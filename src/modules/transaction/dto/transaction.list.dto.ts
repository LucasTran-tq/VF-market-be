import { ApiHideProperty } from '@nestjs/swagger';
import { PaginationListAbstract } from 'src/common/pagination/abstracts/pagination.abstract';
import {
    PaginationAvailableSearch,
    PaginationAvailableSort,
    PaginationPage,
    PaginationPerPage,
    PaginationSearch,
    PaginationSort,
} from 'src/common/pagination/decorators/pagination.decorator';
import { IPaginationSort } from 'src/common/pagination/interfaces/pagination.interface';
import {
    TRANSACTION_DEFAULT_AVAILABLE_SEARCH,
    TRANSACTION_DEFAULT_PAGE,
    TRANSACTION_DEFAULT_PER_PAGE,
    TRANSACTION_DEFAULT_SORT,
    TRANSACTION_DEFAULT_AVAILABLE_SORT,
} from '../constants/transaction.list.constant';

export class TransactionListDto implements PaginationListAbstract {
    @PaginationSearch(TRANSACTION_DEFAULT_AVAILABLE_SEARCH)
    readonly search: Record<string, any>;

    @ApiHideProperty()
    @PaginationAvailableSearch(TRANSACTION_DEFAULT_AVAILABLE_SEARCH)
    readonly availableSearch: string[];

    @PaginationPage(TRANSACTION_DEFAULT_PAGE)
    readonly page: number;

    @PaginationPerPage(TRANSACTION_DEFAULT_PER_PAGE)
    readonly perPage: number;

    @PaginationSort(
        TRANSACTION_DEFAULT_SORT,
        TRANSACTION_DEFAULT_AVAILABLE_SORT
    )
    readonly sort: IPaginationSort;

    @ApiHideProperty()
    @PaginationAvailableSort(TRANSACTION_DEFAULT_AVAILABLE_SORT)
    readonly availableSort: string[];
}
