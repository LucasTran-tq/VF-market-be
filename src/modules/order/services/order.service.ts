/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseOptions,
    IDatabaseCreateOptions,
    IDatabaseSoftDeleteOptions,
    IDatabaseExistOptions,
} from 'src/common/database/interfaces/database.interface';
import { Web3Service } from 'src/common/web3/services/web3.service';
import { TransactionService } from 'src/modules/transaction/services/transaction.service';
// import { UpdateProductDto } from '../dtoa/update-product.dto';
import { Abi as NFTAbi } from 'src/common/web3/contracts/NFT';
import { OrderDocument, OrderEntity } from '../schemas/order.schema';
import { OrderRepository } from '../repositories/order.repository';
import { IOrderCreate } from '../interfaces/order.interface';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { ProductRepository } from 'src/modules/product/repositories/product.repository';
import { UserService } from 'src/modules/user/services/user.service';
import { ProductService } from 'src/modules/product/services/product.service';
import { UserDocument } from 'src/modules/user/schemas/user.schema';
import { ProductDocument } from 'src/modules/Product/schemas/product.schema';

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly userService: UserService,
        private readonly productService: ProductService
    ) {}

    async create(
        { userId, productId, walletAddress }: IOrderCreate,
        options?: IDatabaseCreateOptions
    ): Promise<OrderDocument> {
        const user: UserDocument = await this.userService.findOneById(userId);
        console.log('user:', user);
        const product: ProductDocument = await this.productService.findOneById(
            productId
        );
        console.log('product:', product);

        const order: OrderEntity = {
            user: user._id,
            product: product._id,
            address: user.address,
            walletAddress,
            tokenId: 1,
            isPaid: false,
        };
        console.log('order:', order);

        return this.orderRepository.create<OrderEntity>(order, options);
    }

    async findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]> {
        return this.orderRepository.findAll<T>(find, options);
    }

    async findOneById<T>(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.orderRepository.findOneById<T>(_id, options);
    }

    async findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.orderRepository.findOne<T>(find, options);
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number> {
        return this.orderRepository.getTotal(find, options);
    }

    async deleteOneById(
        _id: string,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<OrderDocument> {
        return this.orderRepository.deleteOneById(_id, options);
    }

    async deleteOne(
        find: Record<string, any>,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<OrderDocument> {
        return this.orderRepository.deleteOne(find, options);
    }
}
