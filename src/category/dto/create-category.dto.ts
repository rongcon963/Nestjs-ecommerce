import { Product } from 'src/product/entities/product.entity';

export class CreateCategoryDto {
  name: string;
  products: Product[];
}
