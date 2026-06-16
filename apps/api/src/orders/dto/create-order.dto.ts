import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { FulfillmentMode, ReplacementPreference } from '@prisma/client';

export class OrderItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  qty!: number;

  @IsOptional()
  @IsEnum(ReplacementPreference)
  replacement?: ReplacementPreference;

  @IsOptional()
  @IsString()
  replacementProductId?: string;
}

export class OrderPaymentDto {
  @IsString()
  method!: string;

  @IsOptional()
  forceDecline?: boolean;
}

export class CreateOrderDto {
  @IsString()
  storeId!: string;

  @IsEnum(FulfillmentMode)
  mode!: FulfillmentMode;

  @IsOptional()
  @IsString()
  slotLabel?: string;

  @IsOptional()
  @IsString()
  addressLabel?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  tipMinor?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ValidateNested()
  @Type(() => OrderPaymentDto)
  payment!: OrderPaymentDto;
}
