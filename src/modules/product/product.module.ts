import { Module, forwardRef } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import {
    ProductDatabaseName,
    ProductEntity,
    ProductSchema,
} from './schemas/product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import { ProductRepository } from './repositories/product.repository';
import { TransactionModule } from '../transaction/transaction.module';
import { Web3Module } from 'src/common/web3/web3.module';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: ProductEntity.name,
                    schema: ProductSchema,
                    collection: ProductDatabaseName,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
        Web3Module,
        // TransactionModule,
        forwardRef(() => TransactionModule),
    ],
    controllers: [ProductController],
    providers: [ProductService, ProductRepository],
    exports: [ProductService],
})
export class ProductModule {}
