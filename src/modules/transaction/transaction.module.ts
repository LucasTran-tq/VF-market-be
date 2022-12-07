import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import { Web3Module } from 'src/common/web3/web3.module';
import { ConfigurationModule } from '../configuration/configuration.module';
import { TransactionRepository } from './repositories/transaction.repository';
import {
    TransactionEntity,
    TransactionSchema,
    TransactionDatabaseName,
} from './schemas/transaction.schema';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './transaction.controller';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: TransactionEntity.name,
                    schema: TransactionSchema,
                    collection: TransactionDatabaseName,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
        Web3Module,
        ConfigurationModule,
    ],
    controllers: [TransactionController],
    providers: [TransactionService, TransactionRepository],
    exports: [TransactionService],
})
export class TransactionModule {}
