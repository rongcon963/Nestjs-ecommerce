import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { Caching } from 'src/shared/constants';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { VerifyOtpDTO } from './dto/verify-otp.dto';
import { ResendOtpDTO } from './dto/resend-otp.dto';
import { Status } from 'src/shared/enums/user.enum';
import { generateOTP } from 'src/shared/common/codeGenerator';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordTokenDTO } from './dto/forgot-password-token.dto';
import { ResetPasswordTokenDTO } from './dto/reset-password-token.dto';
import { UpdateUserDTO } from '../user/dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private mailService: MailService,
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

  async forgotPasswordToken(host: Headers, forgotPasswordDto: ForgotPasswordTokenDTO) {
    const { email } = forgotPasswordDto;
    const user = await this.userService.findUserByEmail(email);
    const token = this.jwtService.sign({id: user.id});
    const resetUrl = `http://${host}/auth/reset-password?token=${token}`;
    await this.mailService.forgotPasswordToken({email, username: user.username, resetUrl});
    return 'Password reset email sent';
  }

  async resetPasswordToken(token: string, resetPasswordTokenDto: ResetPasswordTokenDTO) {
    const { password } = resetPasswordTokenDto;
    const decodedToken = this.jwtService.verify(token)
    const user = await this.userService.findOne(decodedToken.id);
    if(!user) throw new HttpException('Invalid link or expire', HttpStatus.NOT_FOUND);
    const newPassword = await bcrypt.hash(password, 10);
    await this.userService.update(user.id, { password: newPassword } as UpdateUserDTO);
    await this.mailService.resetPasswordToken({email: user.email, username: user.username});
    return 'Password reset confirm';
  }

  async verify(verifyOtpDto: VerifyOtpDTO) {
    const {email, otp} = verifyOtpDto;
    await this.userService.findUserByEmail(email);
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

  async resendOtp(resendOtpDto: ResendOtpDTO) {
    const { email } = resendOtpDto;
    const user = await this.userService.findUserByEmail(email);
    if(user.status === Status.Active) {
      return 'User already actived!';
    }
    const currentOtpCode = await this.cacheManager.get(`${Caching.CACHE_USER_REGISTER_PREFIX}:${email}`);
    if(currentOtpCode) {
      await this.mailService.sendRegisterEmail({email, username: user.username, otpCode: currentOtpCode});
    } else {
      const otpCode = generateOTP(6);
      await this.cacheManager.set(`${Caching.CACHE_USER_REGISTER_PREFIX}:${email}`, otpCode, { ttl: 120 });
      await this.mailService.sendRegisterEmail({email, username: user.username, otpCode});
    }
    const expireTime = await this.cacheManager.store.ttl(`${Caching.CACHE_USER_REGISTER_PREFIX}:${email}`);
    return {
      user,
      expireTime,
    };
  }
}
