import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { ProductService } from 'src/product/product.service';
import { CategoryProduct } from './entities/category-product.entity';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CategoryProduct)
    private categoryProductRepository: Repository<CategoryProduct>,
    private productService: ProductService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    console.log(category);
    return category;
  }

  async findAll() {
    const categories = await this.categoryRepository.find();
    return categories;
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    await this.categoryRepository.update(id, updateCategoryDto);
    return category;
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.categoryRepository.delete(id);
    return `This action removes a #${category.id} category`;
  }

  private async addProductsByIds(productIds: number[], products: Product[]) {
    for (const productId of productIds) {
      products.push(await this.productService.findOne(productId));
    }
  }
}
