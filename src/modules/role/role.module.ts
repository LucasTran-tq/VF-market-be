import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import { RoleBulkRepository } from './repositories/role.bulk.repository';
import { RoleRepository } from './repositories/role.repository';
import {
    RoleDatabaseName,
    RoleEntity,
    RoleSchema,
} from './schemas/role.schema';
import { RoleBulkService } from './services/role.bulk.service';
import { RoleService } from './services/role.service';

@Module({
    controllers: [],
    providers: [
        RoleService,
        RoleBulkService,
        RoleRepository,
        RoleBulkRepository,
    ],
    exports: [RoleService, RoleBulkService],
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: RoleEntity.name,
                    schema: RoleSchema,
                    collection: RoleDatabaseName,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class RoleModule {}
