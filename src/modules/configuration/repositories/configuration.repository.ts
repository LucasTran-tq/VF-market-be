import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseMongoRepositoryAbstract } from 'src/common/database/abstracts/database.mongo-repository.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';
import { IDatabaseRepositoryAbstract } from 'src/common/database/interfaces/database.repository.interface';
import { PermissionEntity } from 'src/modules/permission/schemas/permission.schema';
import { RoleEntity } from 'src/modules/role/schemas/role.schema';
import {
    ConfigurationDocument,
    ConfigurationEntity,
} from 'src/modules/configuration/schemas/configuration.schema';

@Injectable()
export class ConfigurationRepository
    extends DatabaseMongoRepositoryAbstract<ConfigurationDocument>
    implements IDatabaseRepositoryAbstract<ConfigurationDocument>
{
    constructor(
        @DatabaseEntity(ConfigurationEntity.name)
        private readonly ConfigurationModel: Model<ConfigurationDocument>
    ) {
        super(ConfigurationModel);
    }
}
