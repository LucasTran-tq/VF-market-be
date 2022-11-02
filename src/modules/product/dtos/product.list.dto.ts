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
    PRODUCT_DEFAULT_AVAILABLE_SEARCH,
    PRODUCT_DEFAULT_AVAILABLE_SORT,
    PRODUCT_DEFAULT_PAGE,
    PRODUCT_DEFAULT_PER_PAGE,
    PRODUCT_DEFAULT_SORT,
} from 'src/modules/product/constants/product.list.constant';

export class ProductListDto implements PaginationListAbstract {
    @PaginationSearch(PRODUCT_DEFAULT_AVAILABLE_SEARCH)
    readonly search: Record<string, any>;

    @ApiHideProperty()
    @PaginationAvailableSearch(PRODUCT_DEFAULT_AVAILABLE_SEARCH)
    readonly availableSearch: string[];

    @PaginationPage(PRODUCT_DEFAULT_PAGE)
    readonly page: number;

    @PaginationPerPage(PRODUCT_DEFAULT_PER_PAGE)
    readonly perPage: number;

    @PaginationSort(PRODUCT_DEFAULT_SORT, PRODUCT_DEFAULT_AVAILABLE_SORT)
    readonly sort: IPaginationSort;

    @ApiHideProperty()
    @PaginationAvailableSort(PRODUCT_DEFAULT_AVAILABLE_SORT)
    readonly availableSort: string[];
}
