import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import { ConfigurationRepository } from './repositories/configuration.repository';
import { ConfigurationDatabaseName, ConfigurationEntity, ConfigurationSchema } from './schemas/configuration.schema';
import { ConfigurationService } from './services/configuration.service';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: ConfigurationEntity.name,
                    schema: ConfigurationSchema,
                    collection: ConfigurationDatabaseName,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
    // controllers: [TransactionController],
    providers: [ConfigurationService, ConfigurationRepository],
    exports: [ConfigurationService],
})
export class ConfigurationModule {}
