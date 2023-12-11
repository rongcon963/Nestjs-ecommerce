import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UserRequest } from 'src/shared/decorators/user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  addProduct(
    @Body() createCartDto: CreateCartDto,
    @UserRequest() user: User,
  ) {
    return this.cartService.addProduct(createCartDto, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@UserRequest() user: User,) {
    return this.cartService.findAll(user?.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
