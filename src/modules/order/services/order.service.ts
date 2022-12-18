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

@Injectable()
export class OrderService implements IOrderService {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly web3Service: Web3Service,
        // @INject
        private readonly transactionService: TransactionService
    ) {}

    async create(
        {
            name,
            description,
            price,
            images,
            launchId,
            totalCount,
            totalSold,
        }: IOrderCreate,
        options?: IDatabaseCreateOptions
    ): Promise<OrderDocument> {
        const order: OrderEntity = {
            name,
            description,
            price,
            images,
            launchId,
            totalCount,
            totalSold,
        };

        return this.orderRepository.create<OrderEntity>(order, options);
    }

    async checkExist(
        name: string,
        options?: IDatabaseExistOptions
    ): Promise<IOrderCheckExist> {
        const existOrder: boolean = await this.orderRepository.exists(
            {
                name: {
                    $regex: new RegExp(name),
                    $options: 'i',
                },
            },
            options
        );

        return {
            name: existProduct,
        };
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
