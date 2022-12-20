import { Controller, Body, Post, Get, Query, Param } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { TransactionService } from './services/transaction.service';
import {
    Response,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';
import { ApiTags } from '@nestjs/swagger';
import { AuthJwtGuard } from 'src/common/auth/decorators/auth.jwt.decorator';
import { ENUM_LOGGER_ACTION } from 'src/common/logger/constants/logger.enum.constant';
import { Logger } from 'src/common/logger/decorators/logger.decorator';
import { TransactionListDto } from './dto/transaction.list.dto';
import { IResponsePaging } from 'src/common/response/interfaces/response.interface';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { ITransactionDocument } from './interfaces/product.interface';

@ApiTags('modules.transaction')
@Controller({
    version: '1',
    path: '/transaction',
})
@Controller('transaction')
export class TransactionController {
    constructor(
        private readonly transactionsService: TransactionService,
        private readonly paginationService: PaginationService
    ) {}

    @Get('topUp/:walletAddress')
    @Response('transaction.topUp')
    @Logger(ENUM_LOGGER_ACTION.TOPUP, { tags: ['TOPUP', 'walletAddress'] })
    @AuthJwtGuard()
    async topUp(@Param('walletAddress') walletAddress: string) {
        return await this.transactionsService.topUp(walletAddress);
    }

    @ResponsePaging('transaction.list', {
        // classSerialization: ProductListSerialization,
    })
    // @AuthAdminJwtGuard(ENUM_AUTH_PERMISSIONS.USER_READ)
    @Get('/list')
    async list(
        @Query()
        {
            page,
            perPage,
            sort,
            search,
            availableSort,
            availableSearch,
        }: TransactionListDto
    ): Promise<IResponsePaging> {
        const skip: number = await this.paginationService.skip(page, perPage);
        const find: Record<string, any> = {
            ...search,
        };

        const transactions: ITransactionDocument[] =
            await this.transactionsService.findAll(find, {
                limit: perPage,
                skip: skip,
                sort,
            });
        const totalData: number = await this.transactionsService.getTotal(find);
        const totalPage: number = await this.paginationService.totalPage(
            totalData,
            perPage
        );

        return {
            totalData,
            totalPage,
            currentPage: page,
            perPage,
            availableSearch,
            availableSort,
            data: transactions,
        };
    }
}
