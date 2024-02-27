import { ApiProperty } from "@nestjs/swagger";

export class CompleteOrderDTO {
  @ApiProperty()
  order_id: number;
}