import { ApiProperty } from "@nestjs/swagger";

export class FilterCartDTO {
  @ApiProperty()
  page: number = 1;

  @ApiProperty()
  limit: number = 10;
}
