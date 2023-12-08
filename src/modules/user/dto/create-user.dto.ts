import { Role } from "src/shared/enums/role.enum";

export class CreateUserDTO {
  username: string;
  email: string;
  password: string;
  roles: Role;
}
