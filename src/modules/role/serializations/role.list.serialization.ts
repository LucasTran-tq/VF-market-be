import { OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Types } from 'mongoose';
import { RoleGetSerialization } from './role.get.serialization';

export class RoleListSerialization extends OmitType(RoleGetSerialization, [
    'permissions',
] as const) {
    @Exclude()
    readonly permissions: Types.ObjectId;
}
