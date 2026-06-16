import { Prisma } from '@prisma/client';

export const orderStoreSelect = {
  store: { select: { id: true, name: true, logo: true } },
} satisfies Prisma.OrderInclude;

export const orderDetailInclude = {
  ...orderStoreSelect,
  lines: true,
  events: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.OrderInclude;

export const orderSummaryInclude = {
  ...orderStoreSelect,
  lines: { select: { qty: true } },
} satisfies Prisma.OrderInclude;

type OrderDetailRow = Prisma.OrderGetPayload<{ include: typeof orderDetailInclude }>;
type OrderSummaryRow = Prisma.OrderGetPayload<{ include: typeof orderSummaryInclude }>;

export function toOrderDetail(order: OrderDetailRow) {
  return {
    id: order.id,
    store: order.store,
    status: order.status,
    mode: order.mode,
    slotLabel: order.slotLabel,
    addressLabel: order.addressLabel,
    lines: order.lines.map((l) => ({
      productId: l.productId,
      nameSnap: l.nameSnap,
      qty: l.qty,
      unitMinor: l.unitMinor,
      lineMinor: l.lineMinor,
      byWeight: l.byWeight,
    })),
    subtotalMinor: order.subtotalMinor,
    serviceFeeMinor: order.serviceFeeMinor,
    deliveryFeeMinor: order.deliveryFeeMinor,
    tipMinor: order.tipMinor,
    totalMinor: order.totalMinor,
    currency: order.currency,
    etaMinutes: order.etaMinutes,
    events: order.events.map((e) => ({
      status: e.status,
      note: e.note,
      createdAt: e.createdAt,
    })),
    createdAt: order.createdAt,
  };
}

export function toOrderSummary(order: OrderSummaryRow) {
  return {
    id: order.id,
    store: order.store,
    status: order.status,
    mode: order.mode,
    totalMinor: order.totalMinor,
    currency: order.currency,
    itemCount: order.lines.reduce((s, l) => s + l.qty, 0),
    etaMinutes: order.etaMinutes,
    createdAt: order.createdAt,
  };
}
