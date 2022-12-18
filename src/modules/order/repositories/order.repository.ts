import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseMongoRepositoryAbstract } from 'src/common/database/abstracts/database.mongo-repository.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';
import { IDatabaseRepositoryAbstract } from 'src/common/database/interfaces/database.repository.interface';
import { OrderDocument, OrderEntity } from '../schemas/order.schema';

@Injectable()
export class OrderRepository
    extends DatabaseMongoRepositoryAbstract<OrderDocument>
    implements IDatabaseRepositoryAbstract<OrderDocument>
{
    constructor(
        @DatabaseEntity(OrderEntity.name)
        private readonly orderModel: Model<OrderDocument>
    ) {
        super(orderModel);
    }
}
