import { Role, Status } from "src/shared/enums/user.enum";

export class CreateUserDTO {
  username: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  roles: Role;
  // status: Status;
}
