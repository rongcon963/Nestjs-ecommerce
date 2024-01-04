import { Exclude, instanceToPlain } from 'class-transformer';
import { Role, Status } from 'src/shared/enums/user.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

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

  toJSON() {
    return instanceToPlain(this);
  }
}
