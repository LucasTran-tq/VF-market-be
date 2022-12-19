/* eslint-disable @typescript-eslint/no-empty-interface */
import { ENUM_AUTH_ACCESS_FOR } from 'src/common/auth/constants/auth.enum.constant';
import { OrderCreateDto } from '../dtos/order.create.dto';
import { OrderDocument } from '../schemas/order.schema';

export interface IOrderDocument extends OrderDocument {}

export interface IOrderCreate extends OrderCreateDto {
    userId: string
}

export interface IOrderCheckExist {
    name: boolean;
}

export interface IOrderRolePayload {
    name: string;
    permissions: string[];
    accessFor: ENUM_AUTH_ACCESS_FOR;
}
