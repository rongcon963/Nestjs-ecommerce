import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';
import { Status } from 'src/shared/enums/user.enum';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  status: Status;
}
