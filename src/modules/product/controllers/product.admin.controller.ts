import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ApiTags } from '@nestjs/swagger';
import { ProductCreateDto } from '../dtos/product.create.dto';
import { ENUM_ERROR_STATUS_CODE_ERROR } from 'src/common/error/constants/error.status-code.constant';
import { IProductCheckExist } from '../interfaces/product.interface';
import { ENUM_PRODUCT_STATUS_CODE_ERROR } from '../constants/product.status-code.constant';
import {
    Response,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';
import {
    IResponse,
    IResponsePaging,
} from 'src/common/response/interfaces/response.interface';
import { ResponseIdSerialization } from 'src/common/response/serializations/response.id.serialization';
import { AuthAdminJwtGuard } from 'src/common/auth/decorators/auth.jwt.decorator';
import { ENUM_AUTH_PERMISSIONS } from 'src/common/auth/constants/auth.enum.permission.constant';

@ApiTags('modules.admin.product')
@Controller({
    version: '1',
    path: '/product',
})
@Controller('product')
export class ProductAdminController {
    constructor(private readonly productService: ProductService) {}

    // @Post()
    // create(@Body() createProductDto: CreateProductDto) {
    //   return this.productService.create(createProductDto);
    // }

    @Response('product.create', {
        classSerialization: ResponseIdSerialization,
    })
    @AuthAdminJwtGuard(ENUM_AUTH_PERMISSIONS.USER_READ)
    @Post('/create')
    async create(
        @Body()
        body: ProductCreateDto
    ): Promise<IResponse> {
        const checkExist: IProductCheckExist =
            await this.productService.checkExist(body.name);

        if (checkExist.name) {
            throw new BadRequestException({
                statusCode: ENUM_PRODUCT_STATUS_CODE_ERROR.PRODUCT_EXISTS_ERROR,
                message: 'product.error.nameExist',
            });
        }

        try {
            const create = await this.productService.create({
                name: body.name,
                description: body.description,
                price: body.price,
                images: body.images,
            });

            return {
                _id: create._id,
            };
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                error: err.message,
            });
        }
    }

        // @Get()
        // findAll() {
        //     return this.productService.findAll();
        // }

        // @Get(':id')
        // findOne(@Param('id') id: string) {
        //     return this.productService.findOne(+id);
        // }

        // @Patch(':id')
        // update(
        //     @Param('id') id: string,
        //     @Body() updateProductDto: UpdateProductDto
        // ) {
        //     return this.productService.update(+id, updateProductDto);
        // }

        // @Delete(':id')
        // remove(@Param('id') id: string) {
        //     return this.productService.remove(+id);
        // }
}
