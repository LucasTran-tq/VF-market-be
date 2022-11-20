import { IsOptional, IsAlphanumeric } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryTransactionDto {
  @IsAlphanumeric()
  @IsOptional()
  limit?: string;

  @IsAlphanumeric()
  @IsOptional()
  page?: number;

  @Type((): any => Boolean())
  @Transform(({ value }): any => Boolean(value.toString() == 'true'))
  @IsOptional()
  isMarket = false;

  @IsAlphanumeric()
  @IsOptional()
  address?: string;

  @IsAlphanumeric()
  @IsOptional()
  refCode?: string;
}
