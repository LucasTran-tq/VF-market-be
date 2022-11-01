import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import {
    ProductDatabaseName,
    ProductEntity,
    ProductSchema,
} from './schemas/Product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import { ProductRepository } from './repositories/product.repository';

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
    ],
    controllers: [ProductController],
    providers: [ProductService, ProductRepository],
    exports: [ProductService],
})
export class ProductModule {}
