import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';
import { Status } from 'src/shared/enums/user.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @ApiProperty()
  status: Status;
}
