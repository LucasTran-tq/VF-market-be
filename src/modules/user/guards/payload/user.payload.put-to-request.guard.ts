import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IUserDocument } from 'src/modules/user/interfaces/user.interface';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class UserPayloadPutToRequestGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('in UserPayloadPutToRequestGuard');

        const request = context.switchToHttp().getRequest();
        const { user } = request;

        const check: IUserDocument =
        await this.userService.findOneById<IUserDocument>(user._id, {
            populate: true,
            });
            console.log('check:', check)
        request.__user = check;
        console.log('request:', request)

        return true;
    }
}
