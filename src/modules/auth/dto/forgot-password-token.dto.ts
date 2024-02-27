import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordTokenDTO {
  @ApiProperty()
  email: string;
}
