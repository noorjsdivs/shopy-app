import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminMetricsService } from './admin-metrics.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import {
  CreateDepartmentDto,
  CreateStoreDto,
  UpdateStoreDto,
} from './dto/store.dto';
import {
  AdminOrdersQueryDto,
  AdminProductsQueryDto,
  AdminUsersQueryDto,
  UpdateOrderStatusDto,
  UpdateUserRoleDto,
} from './dto/admin-queries.dto';

@Controller('admin/metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminMetricsController {
  constructor(private readonly metrics: AdminMetricsService) {}

  @Get()
  get() {
    return this.metrics.getMetrics();
  }
}

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminProductsController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list(@Query() query: AdminProductsQueryDto) {
    return this.admin.listProducts(query);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.admin.createProduct(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.admin.getProduct(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.admin.updateProduct(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.admin.softDeleteProduct(id);
  }
}

@Controller('admin/stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminStoresController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list() {
    return this.admin.listStores();
  }

  @Post()
  create(@Body() dto: CreateStoreDto) {
    return this.admin.createStore(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.admin.updateStore(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.admin.softDeleteStore(id);
  }

  @Post(':id/departments')
  addDepartment(@Param('id') id: string, @Body() dto: CreateDepartmentDto) {
    return this.admin.addDepartment(id, dto);
  }
}

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrdersController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list(@Query() query: AdminOrdersQueryDto) {
    return this.admin.listOrders(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.admin.getOrder(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.admin.updateOrderStatus(id, dto);
  }
}

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list(@Query() query: AdminUsersQueryDto) {
    return this.admin.listUsers(query);
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.admin.updateUserRole(id, dto);
  }
}
