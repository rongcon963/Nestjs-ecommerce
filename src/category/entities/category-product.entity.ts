import { Product } from 'src/product/entities/product.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('category_product')
export class CategoryProduct {
  @PrimaryGeneratedColumn()
  id: number;

  // @PrimaryColumn({ name: 'category_id' })
  // categoryId: number;

  // @PrimaryColumn({ name: 'product_id' })
  // productId: number;

  // @ManyToOne(() => Category, (category) => category.products)
  // @JoinColumn([{ name: 'category_id', referencedColumnName: 'id' }])
  // categories: Category[];

  // @ManyToOne(() => Product, (product) => product.categories)
  // @JoinColumn([{ name: 'product_id', referencedColumnName: 'id' }])
  // products: Product[];
}
