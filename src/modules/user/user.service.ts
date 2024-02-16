import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from '../auth/dto/login-user.dto';
import { Status } from 'src/shared/enums/user.enum';
import { MailService } from '../mail/mail.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Caching } from 'src/shared/constants';
import { generateOTP } from 'src/shared/common/codeGenerator';
import { UpdateUserDTO } from './dto/update-user.dto';
import { CartService } from '../cart/cart.service';
import { Cart } from '../cart/entities/cart.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private cartService: CartService,
  ) {}

  async addUser(createUserDto: CreateUserDTO) {
    const newUser = this.userRepository.create(createUserDto);
    const {email, username} = newUser;
    const existUsername = await this.userRepository.findOneBy({ username });
    if (existUsername) {
      throw new HttpException('Username already exist!', HttpStatus.CONFLICT);
    }
    const existEmail = await this.userRepository.findOneBy({ email });
    if (existEmail) {
      throw new HttpException('Email already exist!', HttpStatus.CONFLICT);
    }
    const otpCode = generateOTP(6);
    
    newUser.password = await bcrypt.hash(newUser.password, 10);
    await this.cacheManager.set(`${Caching.CACHE_USER_REGISTER_PREFIX}:${email}`, otpCode, { ttl: 120 });
    const expireTime = await this.cacheManager.store.ttl(`${Caching.CACHE_USER_REGISTER_PREFIX}:${email}`);
    await this.mailService.sendRegisterEmail({email, username, otpCode});
    await this.userRepository.save(newUser);
    return {
      user: newUser,
      expireTime,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id
      }
    });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async getUserInfo(id: number) {
    const cart: Cart[] = await this.cartService.getCartByUser(id);
    const user = await this.findOne(id);
    return { user, cart }
  }

  async findUser(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async findByLogin({ username, password }: LoginUserDTO) {
    const user = await this.findUser(username);
    if (user.status == Status.InActive) {
      const otpCode = generateOTP(6);
      await this.cacheManager.set(`${Caching.CACHE_USER_REGISTER_PREFIX}:${user.email}`, otpCode, { ttl: 120 });
      const expireTime = await this.cacheManager.store.ttl(`${Caching.CACHE_USER_REGISTER_PREFIX}:${user.email}`);
      await this.mailService.sendRegisterEmail({email: user.email, username: user.username, otpCode});
      throw new HttpException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: `Email hasn't been verified yet. Check your inbox`,
        expireTime
      }, HttpStatus.UNAUTHORIZED);
    }

    const is_equal = bcrypt.compareSync(password, user.password);

    if (!is_equal) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDTO) {
    await this.userRepository.update(id, updateUserDto)
    return await this.findOne(id);
  }

  async updateUserStatus(email: string) {
    const user = await this.findUserByEmail(email);
    user.status = Status.Active;
    
    await this.userRepository.save(user);
    return user;
  }
}
