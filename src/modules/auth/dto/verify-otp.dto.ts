import { ApiProperty } from "@nestjs/swagger";

export class VerifyOtpDTO {
  @ApiProperty()
  email: string;
  
  @ApiProperty()
  otp: string;
}