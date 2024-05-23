import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { Cart } from '../cart/entities/cart.entity';
import { UserService } from '../user/user.service';
import { OrderStatus } from 'src/shared/enums/order.enum';
import { CompleteOrderDTO } from './dto/complete-order.dto';
import { CartService } from '../cart/cart.service';
import { CancelOrderDTO } from './dto/cancel-order.dto';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private cartService: CartService,
  ) {}
  
  async create(user_id: number) {
    const existOrder: Order = await this.getCreatedOrder(OrderStatus.CREATED, user_id)
    const user = await this.userService.getUserInfo(user_id);
    if (user.cart.length === 0) {
      throw new HttpException('Your cart is empty!!', HttpStatus.BAD_REQUEST);
    }
    const total_price = this.calcTotalPrice(user.cart);
    const sub_total = this.calcSubtotal(user.cart);
    let order: Order;
    if (!existOrder?.id) {
      order = this.orderRepository.create({
        user_id,
        total_price,
        status: OrderStatus.CREATED,
        sub_total,
      });
    } else {
      order = this.orderRepository.create({
        id: existOrder?.id,
        user_id,
        total_price,
        status: OrderStatus.CREATED,
        sub_total,
      })
    }
    const orderRes = await this.orderRepository.save(order);
    if(user.cart.length > 0) {
      for (const item of user.cart) {
        const orderItem = await this.orderItemRepository.create({
          name: item?.product?.name,
          price: item?.product?.price,
          quantity: item?.product?.quantity,
          product_id: item?.product?.id,
          order: orderRes,
        })
        await this.orderItemRepository.save(orderItem);
      }
    }
    return this.findOne(orderRes.id, user_id);
  }

  async completeOrder(completeOrderDto: CompleteOrderDTO, user_id: number) {
    const { order_id } = completeOrderDto;
    const order = await this.findOne(order_id, user_id);
    order.status = OrderStatus.COMPLETE;
    await this.cartService.remove(user_id);
    return this.orderRepository.save(order);
  }

  async cancelOrder(cancelOrder: CancelOrderDTO, user_id: number) {
    const { order_id } = cancelOrder;
    const order = await this.findOne(order_id, user_id);
    order.status = OrderStatus.CANCELED;
    return this.orderRepository.save(order);
  }

  findAll() {
    return `This action returns all order`;
  }

  async findOne(id: number, user_id: number) {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        user_id
      },
      relations: {
        orderItems: true,
      }
    });
    if (!order) {
      throw new HttpException('Order not found!!', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  async getOrders(user_id: number) {
    return await this.orderRepository.find({
      where: {
        user_id
      },
      relations: {
        orderItems: true,
      }
    })
  }
  
  async getCreatedOrder(status: OrderStatus, user_id: number) {
    return await this.orderRepository.findOne({
      where: {
        status,
        user_id
      }
    })
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  private calcTotalPrice(cartItems: Cart[]) {
    return cartItems.reduce(
      (acc, item: Cart) => acc + item?.product?.price * item?.quantity,
      0,
    )
  }
  
  private calcSubtotal(cartItems: Cart[]) {
    return this.calcTotalPrice(cartItems);
  }
}
