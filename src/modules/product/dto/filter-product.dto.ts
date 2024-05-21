import { ApiProperty } from "@nestjs/swagger";

export class FilterProductDTO {
    @ApiProperty()
    search: string;

    @ApiProperty()
    page: number = 1;

    @ApiProperty()
    limit: number = 10;
}
