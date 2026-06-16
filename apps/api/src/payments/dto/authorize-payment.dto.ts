import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AuthorizePaymentDto {
  @IsInt()
  @Min(1)
  amountMinor!: number;

  @IsString()
  currency!: string;

  @IsIn(['demo-card'])
  method!: 'demo-card';

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  forceDecline?: boolean;
}
