import { User } from "src/modules/user/entities/user.entity";
import { OrderStatus } from "src/shared/enums/order.enum";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  status: OrderStatus;

  @Column({ type: 'decimal' })
  sub_total: number;

  @Column({ type: 'decimal' })
  total_price: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({name: 'user_id'})
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];
}
