import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ENUM_AUTH_STATUS_CODE_ERROR } from '../../constants/auth.status-code.constant';

@Injectable()
export class FirebaseGuard extends AuthGuard('firebase') {
    handleRequest<TUser = any>(
        err: Record<string, any>,
        user: TUser,
        info: any
    ): TUser {
        console.log('in FirebaseGuard');
        if (err || !user) {
            throw new UnauthorizedException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_FIREBASE_ACCESS_TOKEN_ERROR,
                message: 'http.clientError.unauthorized',
                error: err ? err.message : info.message,
            });
        }

        return user;
    }
}

// @Injectable()
// export class FirebaseAuthGuard extends AuthGuard('firebase-auth') {
//   constructor(private reflector: Reflector) {
//     super();
//   }

//   canActivate(context: ExecutionContext) {
//     const isPublic = this.reflector.getAllAndOverride<boolean>('public', [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     if (isPublic) {
//       return true;
//     }

//     return super.canActivate(context);
//   }
// }
