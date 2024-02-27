import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordTokenDTO {
  @ApiProperty()
  password: string;
}