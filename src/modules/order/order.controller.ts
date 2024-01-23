import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserRequest } from 'src/shared/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { CompleteOrderDTO } from './dto/complete-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @UserRequest() user: User,
  ) {
    return this.orderService.create(user?.id);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('complete')
  completeOrder(
    @Body() completeOrderDto: CompleteOrderDTO,
    @UserRequest() user: User,
  ) {
    return this.orderService.completeOrder(completeOrderDto, user?.id)
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @UserRequest() user: User,
  ) {
    return this.orderService.findOne(+id, user?.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
