import { Category } from 'src/category/entities/category.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  quantity: number;

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({
    name: 'category_product',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'category_product_product_id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'category_product_category_id',
    },
  })
  categories?: Category[];
}
