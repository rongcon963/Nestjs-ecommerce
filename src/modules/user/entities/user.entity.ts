import { Role, Status } from 'src/shared/enums/user.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.User
  })
  roles: Role;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.InActive
  })
  status: Status;
}
