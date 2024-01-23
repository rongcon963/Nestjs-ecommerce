import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private productService: ProductService,
  ) {}

  async createCartItem(quantity, product: Product, userId: number) {
    const cartItem = this.cartRepository.create({
      user: {id: userId},
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
      const cartItem = await this.createCartItem(quantity, product, user_id);
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
    userId: number,
    productId: number,
  ): Promise<Cart> {
    return await this.cartRepository.findOne({
      where: {
        product: { id: productId },
        user: { id: userId },
      },
    });
  }

  async findAll(userId: number) {
    const cartItems = await this.cartRepository.find({
      where: { user: { id: userId } },
      relations: {
        product: true,
      },
    });
    return cartItems;
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
  
  async removeProductQuantity(product, quantity) {
    const updatedQuantity = product.quantity - quantity;
    await this.productService.updateProductQuantity(updatedQuantity, product);
  }
}
