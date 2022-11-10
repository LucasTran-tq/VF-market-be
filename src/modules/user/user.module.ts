import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import { MailModule } from '../mail/mail.module';
import { UserBulkRepository } from './repositories/user.bulk.repository';
import { UserRepository } from './repositories/user.repository';
import {
    UserDatabaseName,
    UserEntity,
    UserSchema,
} from './schemas/user.schema';
import { UserBulkService } from './services/user.bulk.service';
import { UserService } from './services/user.service';
@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: UserEntity.name,
                    schema: UserSchema,
                    collection: UserDatabaseName,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
        MailModule,
    ],
    exports: [UserService, UserBulkService],
    providers: [
        UserService,
        UserBulkService,
        UserRepository,
        UserBulkRepository,
    ],
    controllers: [],
})
export class UserModule {}
