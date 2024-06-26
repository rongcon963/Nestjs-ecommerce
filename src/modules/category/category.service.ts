import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryProduct } from './entities/category-product.entity';
import { Category } from './entities/category.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    if(createCategoryDto.product_ids) {
      category.products = createCategoryDto.product_ids.map((id) => ({
        ...new Product(),
        id,
      }));
    }
    await this.categoryRepository.save(category);
    return category;
  }

  async findAll() {
    const categories = await this.categoryRepository.find();
    return categories;
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: {
        id
      },
      relations : {
        products: true,
      }
    });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const updatedCategory = await this.findOne(id);
    updatedCategory.products = []
    if (updateCategoryDto.product_ids?.length) {
      updatedCategory.products = updateCategoryDto.product_ids.map((id) => ({
        ...new Product(),
        id,
      }));
    }
    await this.categoryRepository.save({ ...updatedCategory, ...updateCategoryDto })
    const category = await this.findOne(id);
    return category;
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.categoryRepository.delete(id);
    return `This action removes a #${category.id} category`;
  }
}
