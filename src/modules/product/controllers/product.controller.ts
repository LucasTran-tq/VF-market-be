import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { ResponsePaging } from 'src/common/response/decorators/response.decorator';
import { IResponsePaging } from 'src/common/response/interfaces/response.interface';
import { ProductListDto } from '../dtos/product.list.dto';
import { IProductDocument } from '../interfaces/product.interface';
import { ProductListSerialization } from '../serializations/product.list.serialization';
import { ProductService } from '../services/product.service';

@ApiTags('modules.product')
@Controller({
    version: '1',
    path: '/product',
})
@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly paginationService: PaginationService
    ) {}

    

    @ResponsePaging('product.list', {
        classSerialization: ProductListSerialization,
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
        }: ProductListDto
    ): Promise<IResponsePaging> {
        const skip: number = await this.paginationService.skip(page, perPage);
        const find: Record<string, any> = {
            ...search,
        };

        const products: IProductDocument[] = await this.productService.findAll(
            find,
            {
                limit: perPage,
                skip: skip,
                sort,
            }
        );
        const totalData: number = await this.productService.getTotal(find);
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
            data: products,
        };
    }
}
