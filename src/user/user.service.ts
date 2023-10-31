import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addUser(createUserDto: CreateUserDTO): Promise<User> {
    const newUser = await this.userRepository.create(createUserDto);
    newUser.password = await bcrypt.hash(newUser.password, 10);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async findUser(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }
}
