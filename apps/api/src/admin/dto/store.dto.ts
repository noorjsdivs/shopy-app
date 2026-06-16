import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsString()
  logo!: string;

  @IsString()
  categoryId!: string;

  @IsInt()
  @Min(0)
  etaMinutes!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryFeeMinor?: number;

  @IsOptional()
  @IsString()
  dealBadge?: string;

  @IsOptional()
  @IsString()
  pricesNote?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  boughtRecently?: number;

  @IsOptional()
  @IsString()
  brandColor?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}

export class CreateDepartmentDto {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsString()
  icon!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;
}
