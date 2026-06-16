import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListStoresQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  category?: string;
}
