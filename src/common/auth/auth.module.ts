import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthApiBulkRepository } from 'src/common/auth/repositories/auth.api.bulk.repository';
import { AuthApiRepository } from 'src/common/auth/repositories/auth.api.repository';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import { ApiKeyStrategy } from './guards/api-key/auth.api-key.strategy';
import { JwtRefreshStrategy } from './guards/jwt-refresh/auth.jwt-refresh.strategy';
import { JwtStrategy } from './guards/jwt/auth.jwt.strategy';
import {
    AuthApiDatabaseName,
    AuthApiEntity,
    AuthApiSchema,
} from './schemas/auth.api.schema';
import { AuthApiBulkService } from './services/auth.api.bulk.service';
import { AuthApiService } from './services/auth.api.service';
import { AuthEnumService } from './services/auth.enum.service';
import { AuthService } from './services/auth.service';

@Module({
    providers: [AuthService, AuthEnumService, JwtStrategy, JwtRefreshStrategy],
    exports: [AuthService, AuthEnumService],
    controllers: [],
    imports: [],
})
export class AuthModule {}

@Module({
    providers: [
        AuthApiService,
        AuthApiBulkService,
        AuthApiBulkRepository,
        AuthApiRepository,
        ApiKeyStrategy,
    ],
    exports: [AuthApiService, AuthApiBulkService],
    controllers: [],
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: AuthApiEntity.name,
                    schema: AuthApiSchema,
                    collection: AuthApiDatabaseName,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class AuthApiModule {}
