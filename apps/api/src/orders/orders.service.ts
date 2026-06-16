import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { computeTotals } from '../common/economics';
import { paginated, resolvePaging } from '../common/pagination';
import {
  orderDetailInclude,
  orderSummaryInclude,
  toOrderDetail,
  toOrderSummary,
} from '../common/order-mapper';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const store = await this.prisma.store.findFirst({
      where: { id: dto.storeId, isActive: true },
    });
    if (!store) throw new NotFoundException('Store not found.');

    // Reload products from the DB — client-sent prices are IGNORED.
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const lines = dto.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) {
        throw new BadRequestException(
          `Product not available: ${item.productId}`,
        );
      }
      if (product.storeId !== store.id) {
        throw new BadRequestException(
          `Product ${item.productId} does not belong to store ${store.id}`,
        );
      }
      const unitMinor = product.priceMinor; // server price
      return {
        productId: product.id,
        nameSnap: product.name,
        qty: item.qty,
        unitMinor,
        lineMinor: unitMinor * item.qty,
        byWeight: product.byWeight,
      };
    });

    const subtotalMinor = lines.reduce((s, l) => s + l.lineMinor, 0);
    const totals = computeTotals(subtotalMinor, dto.tipMinor ?? 0);

    // Simulated payment authorization on the server-computed total.
    const auth = this.payments.authorize({
      amountMinor: totals.totalMinor,
      currency: 'USD',
      method: 'demo-card',
      forceDecline: dto.payment.forceDecline,
    });
    if (!auth.ok) {
      throw new HttpException(
        { message: 'Payment declined.', error: 'payment_declined' },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        storeId: store.id,
        status: OrderStatus.RECEIVED,
        mode: dto.mode,
        slotLabel: dto.slotLabel ?? null,
        addressLabel: dto.addressLabel ?? null,
        subtotalMinor: totals.subtotalMinor,
        serviceFeeMinor: totals.serviceFeeMinor,
        deliveryFeeMinor: totals.deliveryFeeMinor,
        tipMinor: totals.tipMinor,
        totalMinor: totals.totalMinor,
        currency: 'USD',
        etaMinutes: store.etaMinutes,
        paymentAuthId: auth.authId,
        lines: { create: lines },
        events: {
          create: [{ status: OrderStatus.RECEIVED, note: 'Order placed.' }],
        },
      },
      include: orderDetailInclude,
    });

    return toOrderDetail(order);
  }

  async listForUser(userId: string, query: PaginationQueryDto) {
    const { page, pageSize, skip, take } = resolvePaging(
      query.page,
      query.pageSize,
    );
    const where = { userId };
    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderSummaryInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);
    return paginated(rows.map(toOrderSummary), total, page, pageSize);
  }

  async getForUser(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderDetailInclude,
    });
    if (!order) throw new NotFoundException('Order not found.');
    if (order.userId !== userId) {
      throw new ForbiddenException('This order does not belong to you.');
    }
    return toOrderDetail(order);
  }
}
