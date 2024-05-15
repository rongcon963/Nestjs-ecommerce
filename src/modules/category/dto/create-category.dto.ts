import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  product_ids: number[];
  // products: Product[];
}
