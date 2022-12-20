import { faker } from '@faker-js/faker';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserCreateDto } from './user.create.dto';

export class UserUpdateDto extends PickType(UserCreateDto, [
    'firstName',
    'lastName',
] as const) {}

export class UserUpdateProfileDto {
    @ApiProperty({
        example: faker.name.firstName(),
        // required: true,
    })
    firstName?: string;

    @ApiProperty({
        example: faker.name.lastName(),
        // required: true,
    })
    lastName?: string;

    @ApiProperty({
        example: faker.address.country(),
        // required: true,
    })
    address?: string;

    @ApiProperty({
        example: '0x123123',
        // required: true,
    })
    walletAddress?: string;
}
