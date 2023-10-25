import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDTO } from './dtos/create-product.dto';
import { Product } from './entities/product.entity';
import { UpdateProductDTO } from './dtos/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDTO: CreateProductDTO): Promise<Product> {
    const newProduct = await this.productRepository.create(createProductDTO);
    await this.productRepository.save(newProduct);
    return newProduct;
  }

  async findAll(): Promise<Product[]> {
    const products = await this.productRepository.find();
    return products;
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDTO,
  ): Promise<Product> {
    const updatedProduct = await this.productRepository.findOneBy({ id });
    if (!updatedProduct) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    await this.productRepository.update(id, updateProductDto);
    return updatedProduct;
  }

  async remove(id: number) {
    const deleteProduct = await this.productRepository.delete(id);
    if (!deleteProduct.affected) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return deleteProduct;
  }
}