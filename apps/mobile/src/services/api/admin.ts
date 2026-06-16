import {
  AdminMetricsSchema,
  AdminProductSchema,
  AdminProductsResponseSchema,
  AdminStoresResponseSchema,
  AdminUsersResponseSchema,
  AdminOrdersResponseSchema,
  OrderDetailSchema,
  type AdminMetrics,
  type AdminProduct,
  type AdminStore,
  type Meta,
  type OrderDetail,
  type OrderSummary,
  type PublicUser,
} from '@shopy/shared';
import { api } from './client';

export async function getMetrics(): Promise<AdminMetrics> {
  const res = await api.get('/admin/metrics');
  return AdminMetricsSchema.parse(res.data);
}

// --- Products ---
export interface AdminProductsQuery {
  search?: string;
  storeId?: string;
  page?: number;
  pageSize?: number;
}
export async function adminListProducts(
  query: AdminProductsQuery = {},
): Promise<{ data: AdminProduct[]; meta: Meta }> {
  const res = await api.get('/admin/products', { params: query });
  return AdminProductsResponseSchema.parse(res.data);
}
export async function adminGetProduct(id: string): Promise<AdminProduct> {
  const res = await api.get(`/admin/products/${id}`);
  return AdminProductSchema.parse(res.data);
}
export interface ProductInput {
  storeId: string;
  departmentId: string;
  name: string;
  priceMinor: number;
  compareAtMinor?: number | null;
  size?: string | null;
  brand?: string | null;
  description?: string | null;
  byWeight?: boolean;
  weightUnit?: 'LB' | 'OZ' | 'KG' | 'G' | 'EACH' | null;
  image: string;
  blurhash?: string | null;
  tags?: string[];
  boughtRecently?: number;
  isActive?: boolean;
}
export async function adminCreateProduct(
  input: ProductInput,
): Promise<AdminProduct> {
  const res = await api.post('/admin/products', input);
  return AdminProductSchema.parse(res.data);
}
export async function adminUpdateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<AdminProduct> {
  const res = await api.patch(`/admin/products/${id}`, input);
  return AdminProductSchema.parse(res.data);
}
export async function adminDeleteProduct(id: string): Promise<void> {
  await api.delete(`/admin/products/${id}`);
}

// --- Stores ---
export async function adminListStores(): Promise<AdminStore[]> {
  const res = await api.get('/admin/stores');
  return AdminStoresResponseSchema.parse(res.data).data;
}
export interface StoreInput {
  slug: string;
  name: string;
  logo: string;
  categoryId: string;
  etaMinutes: number;
  deliveryFeeMinor?: number;
  dealBadge?: string | null;
  pricesNote?: string | null;
  rating?: number;
  boughtRecently?: number;
  brandColor?: string | null;
  isActive?: boolean;
}
export async function adminCreateStore(input: StoreInput): Promise<unknown> {
  const res = await api.post('/admin/stores', input);
  return res.data;
}
export async function adminUpdateStore(
  id: string,
  input: Partial<StoreInput>,
): Promise<unknown> {
  const res = await api.patch(`/admin/stores/${id}`, input);
  return res.data;
}
export async function adminDeleteStore(id: string): Promise<void> {
  await api.delete(`/admin/stores/${id}`);
}

// --- Orders ---
export interface AdminOrdersQuery {
  status?: string;
  storeId?: string;
  page?: number;
  pageSize?: number;
}
export async function adminListOrders(
  query: AdminOrdersQuery = {},
): Promise<{ data: OrderSummary[]; meta: Meta }> {
  const res = await api.get('/admin/orders', { params: query });
  return AdminOrdersResponseSchema.parse(res.data);
}
export async function adminGetOrder(id: string): Promise<OrderDetail> {
  const res = await api.get(`/admin/orders/${id}`);
  return OrderDetailSchema.parse(res.data);
}
export async function adminUpdateOrderStatus(
  id: string,
  status: string,
  note?: string,
): Promise<OrderDetail> {
  const res = await api.patch(`/admin/orders/${id}/status`, { status, note });
  return OrderDetailSchema.parse(res.data);
}

// --- Users ---
export interface AdminUsersQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}
export async function adminListUsers(
  query: AdminUsersQuery = {},
): Promise<{ data: PublicUser[]; meta: Meta }> {
  const res = await api.get('/admin/users', { params: query });
  return AdminUsersResponseSchema.parse(res.data);
}
export async function adminUpdateUserRole(
  id: string,
  role: 'CUSTOMER' | 'ADMIN',
): Promise<PublicUser> {
  const res = await api.patch(`/admin/users/${id}/role`, { role });
  return res.data as PublicUser;
}
