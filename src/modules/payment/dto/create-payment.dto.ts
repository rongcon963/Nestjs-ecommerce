import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentStripeDto {
  @ApiProperty()
  order_id: number;

  @ApiProperty()
  currency: string;
}
