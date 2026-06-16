import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum DepartmentSort {
  POPULAR = 'popular',
  PRICE_ASC = 'price-asc',
  PRICE_DESC = 'price-desc',
  NAME = 'name',
}

export class DepartmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(DepartmentSort)
  sort?: DepartmentSort = DepartmentSort.POPULAR;

  /** Comma-separated dietary tags, e.g. "Organic,Vegan". Product must have ALL. */
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.split(',').map((s) => s.trim()).filter(Boolean)
      : value,
  )
  dietary?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPriceMinor?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  onDealOnly?: boolean;
}
