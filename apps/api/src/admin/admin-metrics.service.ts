import { Injectable } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  orderSummaryInclude,
  toOrderSummary,
} from '../common/order-mapper';
import { productInclude } from '../common/prisma-args';

const DAY_MS = 24 * 60 * 60 * 1000;
const REVENUE_DAYS = 7;

@Injectable()
export class AdminMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const since = new Date(Date.now() - (REVENUE_DAYS - 1) * DAY_MS);
    since.setHours(0, 0, 0, 0);

    const [
      revenueAgg,
      ordersTotal,
      productsTotal,
      storesTotal,
      customersTotal,
      statusGroups,
      recentRows,
      topLines,
      revenueRows,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { totalMinor: true },
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
      this.prisma.order.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.store.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.order.findMany({
        include: orderSummaryInclude,
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.orderLine.groupBy({
        by: ['productId'],
        _sum: { qty: true },
        orderBy: { _sum: { qty: 'desc' } },
        take: 5,
      }),
      this.prisma.order.findMany({
        where: {
          status: { not: OrderStatus.CANCELLED },
          createdAt: { gte: since },
        },
        select: { createdAt: true, totalMinor: true },
      }),
    ]);

    // Orders-by-status with every status present (default 0)
    const ordersByStatus = Object.fromEntries(
      Object.values(OrderStatus).map((s) => [s, 0]),
    ) as Record<OrderStatus, number>;
    for (const g of statusGroups) {
      ordersByStatus[g.status] = g._count._all;
    }

    // Top products with their product info
    const topProductIds = topLines.map((l) => l.productId);
    const topProductRows = await this.prisma.product.findMany({
      where: { id: { in: topProductIds } },
      include: productInclude,
    });
    const productById = new Map(topProductRows.map((p) => [p.id, p]));
    const topProducts = topLines
      .map((l) => {
        const product = productById.get(l.productId);
        return product ? { product, soldQty: l._sum.qty ?? 0 } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    // Revenue by day for the last N days (zero-filled)
    const buckets = new Map<string, number>();
    for (let i = 0; i < REVENUE_DAYS; i++) {
      const d = new Date(since.getTime() + i * DAY_MS);
      buckets.set(dateKey(d), 0);
    }
    for (const row of revenueRows) {
      const key = dateKey(row.createdAt);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + row.totalMinor);
      }
    }
    const revenueByDay = [...buckets.entries()].map(([date, revenueMinor]) => ({
      date,
      revenueMinor,
    }));

    return {
      totals: {
        revenueMinor: revenueAgg._sum.totalMinor ?? 0,
        orders: ordersTotal,
        products: productsTotal,
        stores: storesTotal,
        customers: customersTotal,
      },
      ordersByStatus,
      recentOrders: recentRows.map(toOrderSummary),
      topProducts,
      revenueByDay,
    };
  }
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
