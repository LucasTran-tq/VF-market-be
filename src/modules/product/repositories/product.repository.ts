import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseMongoRepositoryAbstract } from 'src/common/database/abstracts/database.mongo-repository.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';
import { IDatabaseRepositoryAbstract } from 'src/common/database/interfaces/database.repository.interface';
import {
    ProductDocument,
    ProductEntity,
} from 'src/modules/product/schemas/product.schema';

@Injectable()
export class ProductRepository
    extends DatabaseMongoRepositoryAbstract<ProductDocument>
    implements IDatabaseRepositoryAbstract<ProductDocument>
{
    constructor(
        @DatabaseEntity(ProductEntity.name)
        private readonly productModel: Model<ProductDocument>
    ) {
        super(productModel);
    }
}
