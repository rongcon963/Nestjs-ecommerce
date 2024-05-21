import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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
    const newProduct = this.productRepository.create(createProductDTO);
    if(createProductDTO.category_ids) {
      newProduct.categories = createProductDTO.category_ids.map((id) => ({
        ...new Product(),
        id,
      }));
    }
    await this.productRepository.save(newProduct);
    return newProduct;
  }

  async findAll(filterProductDTO: FilterProductDTO) {
    const {search, limit, page} = filterProductDTO;
    
    const offset = (page-1) * limit;
    const [ products, totalProduct ] = await this.productRepository.findAndCount({
      where: {
        name: ILike(`%${search}%`)
      },
      take: limit,
      skip: offset,
    });
    const pageCount = Math.ceil(Number(totalProduct) / Number(limit));
    return {
      products,
      pageCount
    };
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
    updatedProduct.categories = []
    if (updateProductDto.category_ids?.length) {
      updatedProduct.categories = updateProductDto.category_ids.map((id) => ({
        ...new Product(),
        id,
      }));
    }
    await this.productRepository.save({ ...updatedProduct, ...updateProductDto});
    
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
