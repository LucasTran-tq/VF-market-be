import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    MaxLength,
    MinLength,
    IsObject,
    IsArray,
} from 'class-validator';

export class ProductCreateDto {
    @ApiProperty({
        example: faker.name.firstName(),
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(30)
    @Type(() => String)
    readonly name: string;

    @ApiProperty({
        example: faker.definitions.finance,
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(30)
    @Type(() => String)
    readonly description: string;

    // @ApiProperty({
    //     example: faker.finance.amount,
    //     required: true,
    // })
    @IsObject()
    @IsNotEmpty()
    @Type(() => Object)
    readonly price: Record<string, any>;

    // @ApiProperty({
    //     example: faker.image.cats,
    //     required: true,
    // })
    @IsNotEmpty()
    @IsArray()
    @Type(() => Array)
    readonly images: string[];
}
