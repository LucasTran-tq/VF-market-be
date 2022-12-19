/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { ResponsePaging } from 'src/common/response/decorators/response.decorator';
import {
    IResponse,
    IResponsePaging,
} from 'src/common/response/interfaces/response.interface';
// import { ProductListDto } from '../dtos/order.list.dto';
// import { IProductDocument } from '../interfaces/order.interface';
// import { ProductListSerialization } from '../serializations/order.list.serialization';
import { OrderService } from '../services/order.service';
import { Response } from 'src/common/response/decorators/response.decorator';
import { UserProfileSerialization } from 'src/modules/user/serializations/user.profile.serialization';
import { AuthJwtGuard } from 'src/common/auth/decorators/auth.jwt.decorator';
import { ENUM_ERROR_STATUS_CODE_ERROR } from 'src/common/error/constants/error.status-code.constant';
import { OrderCreateDto } from '../dtos/order.create.dto';
import { GetUser } from 'src/modules/user/decorators/user.decorator';
import { IUserDocument } from 'src/modules/user/interfaces/user.interface';
import { UserProfileGuard } from 'src/modules/user/decorators/user.public.decorator';

@ApiTags('modules.order')
@Controller({
    version: '1',
    path: '/order',
})
@Controller('order')
export class OrderController {
    constructor(
        private readonly orderService: OrderService,
        private readonly paginationService: PaginationService
    ) {}

    @Response('order.create', {
        // classSerialization: ResponseIdSerialization,
    })
    @UserProfileGuard()
    @AuthJwtGuard()
    @Post('/create')
    async create(
        @GetUser() user: IUserDocument,
        @Body() body: OrderCreateDto
    ): Promise<IResponse> {
        try {
            console.log('user:', user)
            const create = await this.orderService.create({
                userId: user._id,
                productId: body.productId,
                walletAddress: body.walletAddress,
            });

            return {
                order: create,
            };
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                error: err.message,
            });
        }
    }

    // @ResponsePaging('order.list', {
    //     classSerialization: ProductListSerialization,
    // })
    // // @AuthAdminJwtGuard(ENUM_AUTH_PERMISSIONS.USER_READ)
    // @Get('/list')
    // async list(
    //     @Query()
    //     {
    //         page,
    //         perPage,
    //         sort,
    //         search,
    //         availableSort,
    //         availableSearch,
    //     }: ProductListDto
    // ): Promise<IResponsePaging> {
    //     const skip: number = await this.paginationService.skip(page, perPage);
    //     const find: Record<string, any> = {
    //         ...search,
    //     };

    //     const products: IProductDocument[] = await this.orderService.findAll(
    //         find,
    //         {
    //             limit: perPage,
    //             skip: skip,
    //             sort,
    //         }
    //     );
    //     const totalData: number = await this.orderService.getTotal(find);
    //     const totalPage: number = await this.paginationService.totalPage(
    //         totalData,
    //         perPage
    //     );

    //     return {
    //         totalData,
    //         totalPage,
    //         currentPage: page,
    //         perPage,
    //         availableSearch,
    //         availableSort,
    //         data: products,
    //     };
    // }
}
