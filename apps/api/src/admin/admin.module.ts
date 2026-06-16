import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminMetricsService } from './admin-metrics.service';
import {
  AdminMetricsController,
  AdminOrdersController,
  AdminProductsController,
  AdminStoresController,
  AdminUsersController,
} from './admin.controller';

@Module({
  controllers: [
    AdminMetricsController,
    AdminProductsController,
    AdminStoresController,
    AdminOrdersController,
    AdminUsersController,
  ],
  providers: [AdminService, AdminMetricsService],
})
export class AdminModule {}
