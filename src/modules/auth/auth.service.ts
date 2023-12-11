import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { User } from '../user/entities/user.entity';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
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

  private _createToken(user: User) {
    const payload = { username: user.username, sub: user.id, roles: user.roles };
    const access_token = this.jwtService.sign(payload);
    return {
      expiresIn: process.env.EXPIRESIN,
      access_token,
    };
  }
}
