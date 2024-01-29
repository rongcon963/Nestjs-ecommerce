import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentStripeDto } from './dto/create-payment.dto';
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

  async chargeStripe(createPaymentStripeDto: CreatePaymentStripeDto, user_id: number) {
    const {order_id} = createPaymentStripeDto;
    const currency = createPaymentStripeDto.currency || 'usd';   
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
      currency: currency,
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

  public async constructEventFromPayload(signature: string, payload) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    return event;
  }

  async handleEvent(event) {
    switch (event.type) {
      case 'payment_intent.created':
        await this.setPaymentStatus(event, PaymentStatus.CREATED);
      case 'payment_intent.succeeded':
        await this.setPaymentStatus(event, PaymentStatus.PROCESSING);
        break;
      case 'charge.succeeded':
        await this.setPaymentStatus(event, PaymentStatus.SUCCEEDED);
        break;
      case 'payment_intent.canceled':
        await this.setPaymentStatus(event, PaymentStatus.FAILED);
        break;
      case 'payment_intent.payment_failed':
        await this.setPaymentStatus(event, PaymentStatus.FAILED);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return 'Success';
  }

  async setPaymentStatus(event, status: PaymentStatus) {
    const payment = await this.paymentRepository.findOne({
      where: {
        payment_intent_id: event.data.object.payment_intent,
      }
    });
    if (!payment) {
      throw new HttpException('Payment not found!', HttpStatus.NOT_FOUND);
    }
    payment.status = status;
    return await this.paymentRepository.save(payment);
  }
}
