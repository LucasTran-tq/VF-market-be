/* eslint-disable @typescript-eslint/no-empty-interface */
import { ENUM_AUTH_ACCESS_FOR } from 'src/common/auth/constants/auth.enum.constant';
import { IRoleDocument } from 'src/modules/role/interfaces/role.interface';
import { ProductCreateDto } from 'src/modules/product/dtos/product.create.dto';
import { ProductDocument } from 'src/modules/Product/schemas/product.schema';
// import { ProductCreateDto } from '../dtos/user.create.dto';

export interface IProductDocument extends ProductDocument {}

export interface IProductCreate extends ProductCreateDto {}

export interface IProductCheckExist {
    name: boolean;
}

export interface IProductRolePayload {
    name: string;
    permissions: string[];
    accessFor: ENUM_AUTH_ACCESS_FOR;
}
