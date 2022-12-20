import { IAuthPassword } from 'src/common/auth/interfaces/auth.interface';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import {
    IDatabaseCreateOptions,
    IDatabaseSoftDeleteOptions,
    IDatabaseExistOptions,
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';
// import { ProductUpdateDto } from 'src/modules/product/dtos/Product.update.dto';
import { ProductDocument } from 'src/modules/product/schemas/product.schema';
// import { ProductPayloadSerialization } from 'src/modules/Product/serializations/Product.payload.serialization';
import {
    IProductCheckExist,
    IProductCreate,
    IProductDocument,
} from './product.interface';

export interface IProductService {
    findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]>;

    findOneById<T>(_id: string, options?: IDatabaseFindOneOptions): Promise<T>;

    findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T>;

    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number>;

    create(
        data: IProductCreate,
        options?: IDatabaseCreateOptions
    ): Promise<ProductDocument>;

    deleteOneById(
        _id: string,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<ProductDocument>;

    deleteOne(
        find: Record<string, any>,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<ProductDocument>;

    // updateOneById(
    //     _id: string,
    //     data: ProductUpdateDto,
    //     options?: IDatabaseOptions
    // ): Promise<ProductDocument>;

    checkExist(
        name: string,
        options?: IDatabaseExistOptions
    ): Promise<IProductCheckExist>;

    // payloadSerialization(
    //     data: IProductDocument
    // ): Promise<ProductPayloadSerialization>;
}
