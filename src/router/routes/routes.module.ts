import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AuthApiModule, AuthModule } from 'src/common/auth/auth.module';
import { AuthController } from 'src/common/auth/controllers/auth.controller';
import { AwsModule } from 'src/common/aws/aws.module';
import { SettingController } from 'src/common/setting/controllers/setting.controller';
import { HealthController } from 'src/health/controllers/health.controller';
import { HealthModule } from 'src/health/health.module';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { ProductController } from 'src/modules/product/controllers/product.controller';
import { ProductModule } from 'src/modules/product/product.module';
import { RoleModule } from 'src/modules/role/role.module';
import { TransactionModule } from 'src/modules/transaction/transaction.module';
import { UserAuthController } from 'src/modules/user/controllers/user.auth.controller';
import { UserController } from 'src/modules/user/controllers/user.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [
        SettingController,
        UserController,
        HealthController,
        AuthController,
        ProductController,
        UserAuthController
    ],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        AuthModule,
        AwsModule,
        PermissionModule,
        RoleModule,
        HealthModule,
        TerminusModule,
        HttpModule,
        ProductModule,
        AuthApiModule,
        TransactionModule
    ],
})
export class RoutesModule {}
