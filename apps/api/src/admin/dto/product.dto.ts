import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { WeightUnit } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  storeId!: string;

  @IsString()
  departmentId!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsInt()
  @Min(0)
  priceMinor!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  compareAtMinor?: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  byWeight?: boolean;

  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @IsString()
  image!: string;

  @IsOptional()
  @IsString()
  blurhash?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  boughtRecently?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
