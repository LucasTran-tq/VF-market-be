import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
} from 'class-validator';

export class OrderCreateDto {
    // @ApiProperty({
    //     example: '123',
    //     required: true,
    // })
    // @IsString()
    // @IsNotEmpty()
    // @Type(() => String)
    // readonly userId?: string;

    @ApiProperty({
        example: '123',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Type(() => String)
    readonly productId: string;

    // @ApiProperty({
    //     example: faker.address.city(),
    //     required: true,
    // })
    // @IsString()
    // @IsNotEmpty()
    // @Type(() => String)
    // readonly address: string;

    @ApiProperty({
        example: '0x123456789',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Type(() => String)
    readonly walletAddress: string;
}
