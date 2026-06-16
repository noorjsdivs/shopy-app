import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoresService } from './stores.service';
import { ListStoresQueryDto } from './dto/list-stores-query.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  @Get()
  list(@Query() query: ListStoresQueryDto) {
    return this.stores.list(query);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.stores.detail(slug);
  }

  @Get(':slug/departments/:deptSlug')
  departmentListing(
    @Param('slug') slug: string,
    @Param('deptSlug') deptSlug: string,
    @Query() query: DepartmentQueryDto,
  ) {
    return this.stores.departmentListing(slug, deptSlug, query);
  }
}
