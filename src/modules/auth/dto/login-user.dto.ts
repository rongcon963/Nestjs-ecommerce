import { ApiProperty } from "@nestjs/swagger";

export class LoginUserDTO {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}