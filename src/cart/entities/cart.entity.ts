import { Product } from "src/product/entities/product.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  product_id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  quantity: number;

  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({name: 'product_id'})
  product: Product

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({name: 'user_id'})
  user: User;
}
