import { Body, Headers, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { UserRequest } from 'src/shared/decorators/user.decorator';
import { CreatePaymentStripeDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { ApiTags } from '@nestjs/swagger';
import RequestWithRawBody from '../../shared/interface/requestWithRawBody.interface';

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
    @Headers('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody,
  ) {
    let event;
    
    // if(process.env.NODE_ENV === 'dev') {
      if (!signature) {
        throw new HttpException('Missing stripe-signature header', HttpStatus.NOT_FOUND)
      }

      event = await this.paymentService.constructEventFromPayload(
        signature,
        request.rawBody,
      );
    // }
    
    // event = request.body;
    // console.log(request.body)

    await this.paymentService.handleEvent(event);
  }
}
