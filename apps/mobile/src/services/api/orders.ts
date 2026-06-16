import {
  OrderDetailSchema,
  OrdersResponseSchema,
  type CreateOrderPayload,
  type Meta,
  type OrderDetail,
  type OrderSummary,
} from '@shopy/shared';
import { api } from './client';

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderDetail> {
  const res = await api.post('/orders', payload);
  return OrderDetailSchema.parse(res.data);
}

export async function getOrders(
  page = 1,
  pageSize = 20,
): Promise<{ data: OrderSummary[]; meta: Meta }> {
  const res = await api.get('/orders', { params: { page, pageSize } });
  return OrdersResponseSchema.parse(res.data);
}

export async function getOrder(id: string): Promise<OrderDetail> {
  const res = await api.get(`/orders/${id}`);
  return OrderDetailSchema.parse(res.data);
}
