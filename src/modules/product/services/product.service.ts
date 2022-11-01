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
import { ProductDocument, ProductEntity } from '../schemas/Product.schema';

@Injectable()
export class ProductService implements IProductService {
    constructor(
        private readonly productRepository: ProductRepository // private readonly helperStringService: HelperStringService, // private readonly configService: ConfigService
    ) {}
    findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]> {
        throw new Error('Method not implemented.');
    }
    findOneById<T>(_id: string, options?: IDatabaseFindOneOptions): Promise<T> {
        throw new Error('Method not implemented.');
    }
    findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        throw new Error('Method not implemented.');
    }
    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number> {
        throw new Error('Method not implemented.');
    }

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

    deleteOneById(
        _id: string,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<ProductDocument> {
        throw new Error('Method not implemented.');
    }
    deleteOne(
        find: Record<string, any>,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<ProductDocument> {
        throw new Error('Method not implemented.');
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
}
