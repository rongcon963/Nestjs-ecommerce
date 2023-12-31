import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/user.enum';
import { CreateUserDTO } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserRequest } from 'src/shared/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { VerifyOtpDTO } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @Post('/register')
  async register(@Body() createUserDTO: CreateUserDTO) {
    const user = await this.userService.addUser(createUserDTO);
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.login(loginUserDTO);
  }

  @Post('/verify')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDTO) {
    return this.authService.verify(verifyOtpDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Get('/user')
  getProfile(@UserRequest() user: User) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('/admin')
  getDashboard(@UserRequest() user: User) {
    return user;
  }
}
