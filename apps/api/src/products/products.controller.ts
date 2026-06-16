import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { SearchProductsQueryDto } from './dto/search-products-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  search(@Query() query: SearchProductsQueryDto) {
    return this.products.search(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.products.detail(id);
  }
}
