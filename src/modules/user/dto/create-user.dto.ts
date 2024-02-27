import { ApiProperty } from "@nestjs/swagger";
import { Role, Status } from "src/shared/enums/user.enum";

export class CreateUserDTO {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  roles: Role;
  // status: Status;
}
