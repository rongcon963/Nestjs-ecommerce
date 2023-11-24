import { Product } from 'src/product/entities/product.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity('category_product')
export class CategoryProduct {
  @PrimaryColumn({ name: 'category_id' })
  categoryId: number;

  @PrimaryColumn({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Category, (category) => category.products, { cascade: true })
  @JoinColumn([{ name: 'category_id', referencedColumnName: 'id' }])
  category: Category;

  @ManyToOne(() => Product, (product) => product.categories, { cascade: true })
  @JoinColumn([{ name: 'product_id', referencedColumnName: 'id' }])
  product: Product;
}
