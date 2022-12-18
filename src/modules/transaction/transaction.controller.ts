import { Controller, Body, Post, Get, Query, Param } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { TransactionService } from './services/transaction.service';
import { Response } from 'src/common/response/decorators/response.decorator';
import { ApiTags } from '@nestjs/swagger';
import { AuthJwtGuard } from 'src/common/auth/decorators/auth.jwt.decorator';
import { ENUM_LOGGER_ACTION } from 'src/common/logger/constants/logger.enum.constant';
import { Logger } from 'src/common/logger/decorators/logger.decorator';

@ApiTags('modules.transaction')
@Controller({
    version: '1',
    path: '/transaction',
})
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionsService: TransactionService) {}

    @Get('topUp/:walletAddress')
    @Response('transaction.topUp')
    @Logger(ENUM_LOGGER_ACTION.TOPUP, { tags: ['TOPUP', 'walletAddress'] })
    @AuthJwtGuard()
    async topUp(@Param('walletAddress') walletAddress: string) {
        return await this.transactionsService.topUp(walletAddress);
    }

    // @Get()
    // async get(@Query() query: QueryTransactionDto) {
    //   try {
    //     const data = await this.transactionsService.findAll(query);

    //     return {
    //       status: 200,
    //       ...data,
    //     };
    //   } catch (e) {
    //     console.log('e:', e);

    //     return {
    //       status: 500,
    //       message: 'Something went wrong',
    //     };
    //   }
    // }

    // @Get('/market')
    // async detail(@Query() query) {
    //   try {
    //     const data = await this.transactionsService.findTransMarket(query);

    //     return {
    //       status: 200,
    //       ...data,
    //     };
    //   } catch (e) {
    //     console.log('e:', e);

    //     return {
    //       status: 500,
    //       message: 'Something went wrong',
    //     };
    //   }
    // }

    // @Post()
    // async create(@Body() createTransactionDto: CreateTransactionDto) {
    //   try {
    //     const data = await this.transactionsService.createTransaction(
    //       createTransactionDto,
    //     );

    //     return {
    //       status: 200,
    //       data,
    //     };
    //   } catch (e) {
    //     return {
    //       status: 500,
    //       message: 'Something went wrong',
    //     };
    //   }
    // }
}
