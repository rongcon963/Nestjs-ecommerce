import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { Cart } from './entities/cart.entity';
import { FilterCartDTO } from './dto/filter-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private productService: ProductService,
  ) {}

  async createCartItem(product: Product, user_id: number) {
    const cartItem = this.cartRepository.create({
      user: {id: user_id},
      product: {id: product.id},
      quantity: 0,
    });
    return cartItem;
  }

  async addCartItemQuantity(
    quantity: number,
    cartItem: Cart,
    product: Product,
  ): Promise<Cart> {
    await this.removeProductQuantity(product, quantity);
    cartItem.quantity += quantity;
    await this.cartRepository.save(cartItem);
    return cartItem;
  }

  async addProduct(createCartDto: CreateCartDto, user_id: number) {
    const { product_id, quantity } = createCartDto;
    const product = await this.productService.findOne(product_id);
    if (product.quantity < quantity && product.quantity !== 0) {
      throw new HttpException(`There is just ${product.quantity} ${product.name} left`, HttpStatus.BAD_REQUEST);
    }
    if (product.quantity === 0) {
      throw new HttpException(`The product ${product.name} is out of stock`, HttpStatus.BAD_REQUEST);
    }
    const cartItem = await this.findCartItemByUserAndProduct(
      user_id,
      product?.id,
    );

    if(cartItem) {
      await this.addCartItemQuantity(quantity, cartItem, product);
      return await this.getCartItemById(cartItem?.id);
    } else {
      const cartItem = await this.createCartItem(product, user_id);
      await this.addCartItemQuantity(quantity, cartItem, product);
      return await this.getCartItemById(cartItem?.id);
    }
  }

  private async getCartItemById(cartId): Promise<Cart> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: {
        product: true,
      },
    });
    if (!cartItem) {
      throw new HttpException('Cart Item not found', HttpStatus.NOT_FOUND);
    }
    return cartItem;
  }

  async findCartItemByUserAndProduct(
    user_id: number,
    product_id: number,
  ): Promise<Cart> {
    return await this.cartRepository.findOne({
      where: {
        product: { id: product_id },
        user: { id: user_id },
      },
    });
  }

  async findAll(user_id: number, filterCartDTO: FilterCartDTO) {
    const {limit, page} = filterCartDTO;
    
    const offset = (page-1) * limit;
    const [ cartItems, totalCartItem ] = await this.cartRepository.findAndCount({
      where: { user: { id: user_id } },
      take: limit,
      skip: offset,
      relations: {
        product: true,
      },
    });
    const pageCount = Math.ceil(Number(totalCartItem) / Number(limit));
    return {
      cartItems,
      pageCount
    };
  }
  
  async getCartByUser(user_id: number) {
    const cartItems = await this.cartRepository.find({
      where: { user_id },
      relations: {
        product: true,
      }
    });
    return cartItems;
  }

  async findOne(userId: number) {
    const cartItem = await this.cartRepository.findOne({
      where: {
        user_id: userId
      }
    });
    return cartItem;
  }

  async remove(user_id: number) {
    const cartItem = await this.findOne(user_id);
    await this.cartRepository.remove(cartItem);
  }
  
  async removeProductQuantity(product: Product, quantity: number) {
    const updatedQuantity = product.quantity - quantity;
    await this.productService.updateProductQuantity(updatedQuantity, product);
  }
}
