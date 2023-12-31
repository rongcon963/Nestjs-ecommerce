import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDTO } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { UpdateProductDTO } from './dto/update-product.dto';
import { FilterProductDTO } from './dto/filter-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDTO: CreateProductDTO): Promise<Product> {
    const newProduct = await this.productRepository.create(createProductDTO);
    if(createProductDTO.categoryIds) {
      newProduct.categories = createProductDTO.categoryIds.map((id) => ({
        ...new Product(),
        id,
      }));
    }
    await this.productRepository.save(newProduct);
    return newProduct;
  }

  async getFilteredProducts(
    filterProductDTO: FilterProductDTO,
  ): Promise<Product[]> {
    const { search } = filterProductDTO;
    let products = await this.findAll();

    if (search) {
      products = products.filter(
        (product) =>
          product.name.includes(search) || product.description.includes(search),
      );
    }

    return products;
  }

  async findAll(): Promise<Product[]> {
    const products = await this.productRepository.find();
    return products;
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        categories: true,
      },
    });
    if (!product)
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDTO,
  ): Promise<Product> {
    const updatedProduct = await this.findOne(id);
    if (updateProductDto.categoryIds.length) {
      updatedProduct.categories = updateProductDto.categoryIds.map((id) => ({
        ...new Product(),
        id,
      }));
      await this.productRepository.save(updatedProduct);
    }

    updateProductDto.categoryIds = undefined;
    await this.productRepository.update(id, updateProductDto);
    const resUpdatedProduct = await this.findOne(id);
    return resUpdatedProduct;
  }

  public updateProductQuantity = async (
    updatedQuantity,
    product,
  ): Promise<Product> => {
    try {
      return this.productRepository.save({
        ...product,
        quantity: updatedQuantity,
      });
    } catch (err) {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };

  async remove(id: number) {
    const deleteProduct = await this.productRepository.delete(id);
    if (!deleteProduct.affected) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return deleteProduct;
  }
}
