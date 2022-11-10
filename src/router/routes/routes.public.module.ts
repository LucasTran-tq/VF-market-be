import { Module } from '@nestjs/common';
import { AuthApiModule, AuthModule } from 'src/common/auth/auth.module';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { RoleModule } from 'src/modules/role/role.module';
import { UserPublicController } from 'src/modules/user/controllers/user.public.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [UserPublicController],
    providers: [],
    exports: [],
    imports: [UserModule, AuthModule, RoleModule, PermissionModule, AuthApiModule],
})
export class RoutesPublicModule {}
