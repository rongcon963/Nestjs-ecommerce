import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  category_ids: number[];
}
