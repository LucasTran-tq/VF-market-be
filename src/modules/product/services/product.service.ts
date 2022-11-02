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
import {
    IProductCheckExist,
    IProductCreate,
} from '../interfaces/product.interface';
// import { UpdateProductDto } from '../dtoa/update-product.dto';
import { IProductService } from '../interfaces/product.service.interface';
import { ProductRepository } from '../repositories/product.repository';
import { ProductDocument, ProductEntity } from '../schemas/product.schema';

@Injectable()
export class ProductService implements IProductService {
    constructor(
        private readonly productRepository: ProductRepository // private readonly helperStringService: HelperStringService, // private readonly configService: ConfigService
    ) {}

    async create(
        { name, description, price, images }: IProductCreate,
        options?: IDatabaseCreateOptions
    ): Promise<ProductDocument> {
        const product: ProductEntity = {
            name,
            description,
            price,
            images,
        };

        return this.productRepository.create<ProductEntity>(product, options);
    }

    async checkExist(
        name: string,
        options?: IDatabaseExistOptions
    ): Promise<IProductCheckExist> {
        const existProduct: boolean = await this.productRepository.exists(
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
        return this.productRepository.findAll<T>(find, options);
    }

    async findOneById<T>(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.productRepository.findOneById<T>(_id, options);
    }

    async findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.productRepository.findOne<T>(find, options);
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number> {
        return this.productRepository.getTotal(find, options);
    }

    async deleteOneById(
        _id: string,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<ProductDocument> {
        return this.productRepository.deleteOneById(_id, options);
    }

    async deleteOne(
        find: Record<string, any>,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<ProductDocument> {
        return this.productRepository.deleteOne(find, options);
    }
}
