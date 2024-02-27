import { Body, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { UserRequest } from 'src/shared/decorators/user.decorator';
import { CreatePaymentStripeDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('stripe')
  chargeStripe(@Body() createPaymentStripeDto: CreatePaymentStripeDto, @UserRequest() user: number) {
    return this.paymentService.chargeStripe(createPaymentStripeDto, user);
  }

  @Post('webhook/stripe')
  async handleInComingEventStripe(
    @Req() request: Request,
  ) {
    const signature = request.headers['stripe-signature'];

    let event;
    
    if(process.env.NODE_ENV === 'production') {
      if (!signature) {
        throw new HttpException('Missing stripe-signature header', HttpStatus.NOT_FOUND)
      }

      event = await this.paymentService.constructEventFromPayload(
        signature,
        request.body,
      );
    }
    
    event = request.body;
    console.log(request.body)

    await this.paymentService.handleEvent(event);
  }
}
