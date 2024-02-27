import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "src/shared/enums/order.enum";

export class CreateOrderDto {
  @ApiProperty()
  total_price: number;
  
  @ApiProperty()
  sub_total: number;

  @ApiProperty()
  status: OrderStatus;
}
