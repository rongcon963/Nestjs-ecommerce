import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentStripeDto } from './create-payment.dto';

export class UpdatePaymentStripeDto extends PartialType(CreatePaymentStripeDto) {}
