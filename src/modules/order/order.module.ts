import { Module, forwardRef } from '@nestjs/common';
import { OrderService } from './services/order.service';
import {
    OrderDatabaseName,
    OrderEntity,
    OrderSchema,
} from './schemas/order.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import { OrderRepository } from './repositories/order.repository';
import { TransactionModule } from '../transaction/transaction.module';
import { Web3Module } from 'src/common/web3/web3.module';
import { OrderController } from './controllers/order.controller';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: OrderEntity.name,
                    schema: OrderSchema,
                    collection: OrderDatabaseName,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
        UserModule,
        ProductModule,
    ],
    controllers: [OrderController],
    providers: [OrderService, OrderRepository],
    exports: [OrderService],
})
export class OrderModule {}
