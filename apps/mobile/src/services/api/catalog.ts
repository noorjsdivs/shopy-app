import {
  CategoriesResponseSchema,
  HomeFeedSchema,
  ProductDetailSchema,
  ProductsResponseSchema,
  StoreDetailSchema,
  StoresResponseSchema,
  type Category,
  type HomeFeed,
  type Meta,
  type Product,
  type ProductDetail,
  type StoreDetail,
  type Store,
} from '@shopy/shared';
import { api } from './client';

export async function getHome(): Promise<HomeFeed> {
  const res = await api.get('/home');
  return HomeFeedSchema.parse(res.data);
}

export async function getCategories(): Promise<Category[]> {
  const res = await api.get('/categories');
  return CategoriesResponseSchema.parse(res.data).data;
}

export interface StoresQuery {
  category?: string;
  page?: number;
  pageSize?: number;
}
export async function getStores(
  query: StoresQuery = {},
): Promise<{ data: Store[]; meta: Meta }> {
  const res = await api.get('/stores', { params: query });
  return StoresResponseSchema.parse(res.data);
}

export async function getStore(slug: string): Promise<StoreDetail> {
  const res = await api.get(`/stores/${slug}`);
  return StoreDetailSchema.parse(res.data);
}

export interface DepartmentQuery {
  sort?: 'popular' | 'price-asc' | 'price-desc' | 'name';
  dietary?: string[];
  maxPriceMinor?: number;
  onDealOnly?: boolean;
  page?: number;
  pageSize?: number;
}
export async function getDepartment(
  slug: string,
  deptSlug: string,
  query: DepartmentQuery = {},
): Promise<{ data: Product[]; meta: Meta }> {
  const params: Record<string, string | number | boolean> = {};
  if (query.sort) params.sort = query.sort;
  if (query.dietary?.length) params.dietary = query.dietary.join(',');
  if (query.maxPriceMinor != null) params.maxPriceMinor = query.maxPriceMinor;
  if (query.onDealOnly) params.onDealOnly = true;
  if (query.page) params.page = query.page;
  if (query.pageSize) params.pageSize = query.pageSize;
  const res = await api.get(`/stores/${slug}/departments/${deptSlug}`, {
    params,
  });
  return ProductsResponseSchema.parse(res.data);
}

export async function getProduct(id: string): Promise<ProductDetail> {
  const res = await api.get(`/products/${id}`);
  return ProductDetailSchema.parse(res.data);
}

export interface SearchQuery {
  search?: string;
  storeId?: string;
  page?: number;
  pageSize?: number;
}
export async function searchProducts(
  query: SearchQuery = {},
): Promise<{ data: Product[]; meta: Meta }> {
  const res = await api.get('/products', { params: query });
  return ProductsResponseSchema.parse(res.data);
}
