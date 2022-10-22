import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';

export class PermissionGetSerialization {
    @ApiProperty({
        description: 'Id that representative with your target data',
        example: faker.database.mongodbObjectId(),
        required: true,
    })
    @Type(() => String)
    readonly _id: string;

    @ApiProperty({
        description: 'Active flag of permission',
        example: true,
        required: true,
    })
    readonly isActive: boolean;

    @ApiProperty({
        description: 'Alias name of permission',
        example: faker.name.jobDescriptor(),
        required: true,
    })
    readonly name: string;

    @ApiProperty({
        description: 'Unique code of permission',
        example: faker.random.alpha(5),
        required: true,
    })
    readonly code: string;

    @ApiProperty({
        description: 'Description of permission',
        example: 'blabla description',
        required: true,
    })
    readonly description: string;

    @ApiProperty({
        description: 'Date created at',
        example: faker.date.recent(),
        required: true,
    })
    readonly createdAt: Date;

    @Exclude()
    readonly updatedAt: Date;
}
