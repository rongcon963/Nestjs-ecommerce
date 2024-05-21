import { Exclude, instanceToPlain } from 'class-transformer';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { Role, Status } from 'src/shared/enums/user.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
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

  @Column()
  stripe_customer_id: string;

  @OneToMany(() => Cart, (cart) => cart.user)
  cart: Cart[];

  toJSON() {
    return instanceToPlain(this);
  }
}
