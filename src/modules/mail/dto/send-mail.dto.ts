import { ApiProperty } from "@nestjs/swagger";

export class SendMail {
  // from: string;
  // to: string;
  // subject: string;
  // text: string;
  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;
  
  [key: string]: any;
}
