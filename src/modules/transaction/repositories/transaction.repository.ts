import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseMongoRepositoryAbstract } from 'src/common/database/abstracts/database.mongo-repository.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';
import { IDatabaseRepositoryAbstract } from 'src/common/database/interfaces/database.repository.interface';
import { PermissionEntity } from 'src/modules/permission/schemas/permission.schema';
import { RoleEntity } from 'src/modules/role/schemas/role.schema';
import {
    TransactionDocument,
    TransactionEntity,
} from 'src/modules/transaction/schemas/transaction.schema';

@Injectable()
export class TransactionRepository
    extends DatabaseMongoRepositoryAbstract<TransactionDocument>
    implements IDatabaseRepositoryAbstract<TransactionDocument>
{
    constructor(
        @DatabaseEntity(TransactionEntity.name)
        private readonly TransactionModel: Model<TransactionDocument>
    ) {
        super(TransactionModel);
    }
}
