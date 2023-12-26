import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { User } from '../user/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Caching } from 'src/shared/constants';
import { VerifyOtpDTO } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findUser(username);
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );
    if (user && isPasswordMatch) {
      return user;
    }
    return null;
  }

  async login(loginUserDTO: LoginUserDTO) {
    const user = await this.userService.findByLogin(loginUserDTO);
    
    const token = this._createToken(user);
    return {
      email: user.email,
      ...token,
    }
  }

  async verify(verifyOtpDto: VerifyOtpDTO) {
    const {email, otp} = verifyOtpDto;
    const otpCache = await this.cacheManager.get(`${Caching.CACHE_USER_REGISTER_PREFIX}:${email}`);
    if (!otpCache) {
      throw new HttpException('OTP has expire!!', HttpStatus.NOT_FOUND);
    }
    if (otp !== otpCache) {
      throw new HttpException('Invalid OTP', HttpStatus.NOT_FOUND);
    }
    await this.userService.updateUserStatus(email);
    await this.cacheManager.del(`${Caching.CACHE_USER_REGISTER_PREFIX}:${email}`);
    return 'Verify OTP sucess';
  }

  private _createToken(user: User) {
    const payload = { username: user.username, sub: user.id, roles: user.roles };
    const access_token = this.jwtService.sign(payload);
    return {
      expiresIn: process.env.EXPIRESIN,
      access_token,
    };
  }
}
