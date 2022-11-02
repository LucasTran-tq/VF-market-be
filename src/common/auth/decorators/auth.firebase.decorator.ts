import {
    applyDecorators,
    HttpStatus,
    SetMetadata,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
    AUTH_ACCESS_FOR_META_KEY,
    AUTH_PERMISSION_META_KEY,
} from 'src/common/auth/constants/auth.constant';
import { ENUM_AUTH_ACCESS_FOR } from 'src/common/auth/constants/auth.enum.constant';
import { ENUM_AUTH_PERMISSIONS } from 'src/common/auth/constants/auth.enum.permission.constant';
import { ENUM_AUTH_STATUS_CODE_ERROR } from 'src/common/auth/constants/auth.status-code.constant';
import { JwtRefreshGuard } from 'src/common/auth/guards/jwt-refresh/auth.jwt-refresh.guard';
import { JwtGuard } from 'src/common/auth/guards/jwt/auth.jwt.guard';
import { AuthPayloadAccessForGuard } from 'src/common/auth/guards/payload/auth.payload.access-for.guard';
import { AuthPayloadPermissionGuard } from 'src/common/auth/guards/payload/auth.payload.permission.guard';
import {
    ResponseDoc,
    ResponseDocOneOf,
} from 'src/common/response/decorators/response.decorator';
import { FirebaseGuard } from '../guards/firebase/auth.firebase.guard';

export function AuthFirebaseGuard(): any {
    return applyDecorators(
        // ApiBearerAuth('refreshToken'),
        ResponseDoc({
            httpStatus: HttpStatus.UNAUTHORIZED,
            messagePath: 'http.clientError.unauthorized',
            statusCode:
                ENUM_AUTH_STATUS_CODE_ERROR.AUTH_FIREBASE_ACCESS_TOKEN_ERROR,
        }),
        UseGuards(FirebaseGuard)
    );
}
