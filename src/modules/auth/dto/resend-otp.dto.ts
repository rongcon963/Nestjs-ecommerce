import { ApiProperty } from "@nestjs/swagger";

export class ResendOtpDTO {
  @ApiProperty()
  email: string;
}
