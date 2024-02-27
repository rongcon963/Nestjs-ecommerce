import { ApiProperty } from "@nestjs/swagger";

export class CancelOrderDTO {
  @ApiProperty()
  order_id: number;
}
