import { AuthGuard } from '@nestjs/passport';
import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { HelperNumberService } from 'src/common/helper/services/helper.number.service';
import { ENUM_AUTH_STATUS_CODE_ERROR } from 'src/common/auth/constants/auth.status-code.constant';
import { ENUM_REQUEST_STATUS_CODE_ERROR } from 'src/common/request/constants/request.status-code.constant';

@Injectable()
export class ApiKeyGuard extends AuthGuard('api-key') {
    constructor(private readonly helperNumberService: HelperNumberService) {
        super();
    }

    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest<TUser = any>(
        err: Record<string, any>,
        user: TUser,
        info: Error | string
    ): TUser {
        if (err || !user) {
            if (
                info instanceof Error &&
                info.name === 'BadRequestError' &&
                info.message === 'Missing API Key'
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_NEEDED_ERROR,
                    message: 'auth.apiKey.error.keyNeeded',
                });
            } else if (
                info instanceof Error &&
                info.name === 'BadRequestError' &&
                info.message.startsWith('Invalid API Key prefix')
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_PREFIX_INVALID_ERROR,
                    message: 'auth.apiKey.error.prefixInvalid',
                });
            }

            const statusCode: number = this.helperNumberService.create(
                info as string
            );

            if (
                statusCode ===
                ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_SCHEMA_INVALID_ERROR
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_SCHEMA_INVALID_ERROR,
                    message: 'auth.apiKey.error.schemaInvalid',
                });
            } else if (
                statusCode ===
                ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_TIMESTAMP_NOT_MATCH_WITH_REQUEST_ERROR
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_TIMESTAMP_NOT_MATCH_WITH_REQUEST_ERROR,
                    message: 'auth.apiKey.error.timestampNotMatchWithRequest',
                });
            } else if (
                statusCode ===
                ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_TIMESTAMP_INVALID_ERROR
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_TIMESTAMP_INVALID_ERROR,
                    message: 'auth.apiKey.error.timestampInvalid',
                });
            } else if (
                statusCode ===
                ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_NOT_FOUND_ERROR
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_NOT_FOUND_ERROR,
                    message: 'auth.apiKey.error.notFound',
                });
            } else if (
                statusCode ===
                ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_INACTIVE_ERROR
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_INACTIVE_ERROR,
                    message: 'auth.apiKey.error.inactive',
                });
            }

            throw new UnauthorizedException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_INVALID_ERROR,
                message: 'auth.apiKey.error.invalid',
            });
        }

        return user;
    }
}
