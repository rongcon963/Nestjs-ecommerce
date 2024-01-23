import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { OrderService } from '../order/order.service';
import { OrderStatus } from 'src/shared/enums/order.enum';
import { PaymentStatus } from 'src/shared/enums/payment.enum';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private orderService: OrderService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    })
  }

  async create(createPaymentDto: CreatePaymentDto, user_id: number) {
    const {order_id} = createPaymentDto;
    const order = await this.orderService.findOne(order_id, user_id);
    if(order?.status !== OrderStatus.COMPLETE) {
      throw new HttpException('Order with Status COMPLETE is required', HttpStatus.BAD_REQUEST);
    }
    const payment = await this.paymentRepository.create({
      status: PaymentStatus.CREATED,
    })
    const paymentData = await this.paymentRepository.save(payment);
    const stripePaymentIntent = await this.stripe.paymentIntents.create({
      amount: order.total_price,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: order.id,
        payment_id: payment.id,
      },
    });
    const chargePayment = await this.paymentRepository.save({
      ...paymentData,
      payment_intent_id: stripePaymentIntent?.id,
      amount: stripePaymentIntent?.amount,
      client_secret: stripePaymentIntent?.client_secret,
    });
    return chargePayment;
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
