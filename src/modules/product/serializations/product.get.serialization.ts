import { faker } from '@faker-js/faker';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { IRoleDocument } from 'src/modules/role/interfaces/role.interface';

export class ProductGetSerialization {
    @ApiProperty({ example: faker.database.mongodbObjectId() })
    @Type(() => String)
    readonly _id: string;

    @ApiProperty({
        example: faker.name.firstName(),
    })
    readonly name: string;

    @ApiProperty({
        example: faker.definitions.finance,
    })
    readonly description: string;

    // @ApiProperty({
    //     example: ,
    // })
    readonly price: Record<string, any>;

    // @ApiProperty({
    //     example: faker.name.firstName(),
    // })
    readonly images: string;

    @ApiProperty({
        example: faker.date.past(),
    })
    // @Exclude()
    readonly createdAt: Date;

    @Exclude()
    readonly updatedAt: Date;
}
