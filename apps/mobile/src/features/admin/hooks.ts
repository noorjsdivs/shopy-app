import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import type {
  AdminOrdersQuery,
  AdminProductsQuery,
  AdminUsersQuery,
  ProductInput,
  StoreInput,
} from '@/services/api/admin';

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['admin'] });
    // Storefront caches that may now be stale:
    void qc.invalidateQueries({ queryKey: ['home'] });
    void qc.invalidateQueries({ queryKey: ['stores'] });
    void qc.invalidateQueries({ queryKey: ['store'] });
    void qc.invalidateQueries({ queryKey: ['product'] });
    void qc.invalidateQueries({ queryKey: ['department'] });
  };
}

// --- Metrics ---
export function useMetrics() {
  return useQuery({ queryKey: ['admin', 'metrics'], queryFn: adminApi.getMetrics });
}

// --- Products ---
export function useAdminProducts(query: AdminProductsQuery) {
  return useQuery({
    queryKey: ['admin', 'products', query],
    queryFn: () => adminApi.adminListProducts(query),
  });
}
export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => adminApi.adminGetProduct(id),
    enabled: Boolean(id),
  });
}
export function useCreateProduct() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (input: ProductInput) => adminApi.adminCreateProduct(input),
    onSuccess: invalidate,
  });
}
export function useUpdateProduct() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      adminApi.adminUpdateProduct(id, input),
    onSuccess: invalidate,
  });
}
export function useDeleteProduct() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => adminApi.adminDeleteProduct(id),
    onSuccess: invalidate,
  });
}

// --- Stores ---
export function useAdminStores() {
  return useQuery({ queryKey: ['admin', 'stores'], queryFn: adminApi.adminListStores });
}
export function useCreateStore() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (input: StoreInput) => adminApi.adminCreateStore(input),
    onSuccess: invalidate,
  });
}
export function useUpdateStore() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<StoreInput> }) =>
      adminApi.adminUpdateStore(id, input),
    onSuccess: invalidate,
  });
}
export function useDeleteStore() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => adminApi.adminDeleteStore(id),
    onSuccess: invalidate,
  });
}

// --- Orders ---
export function useAdminOrders(query: AdminOrdersQuery) {
  return useQuery({
    queryKey: ['admin', 'orders', query],
    queryFn: () => adminApi.adminListOrders(query),
  });
}
export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => adminApi.adminGetOrder(id),
    enabled: Boolean(id),
  });
}
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      adminApi.adminUpdateOrderStatus(id, status, note),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['admin'] });
      void qc.invalidateQueries({ queryKey: ['order', vars.id] });
      void qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// --- Users ---
export function useAdminUsers(query: AdminUsersQuery) {
  return useQuery({
    queryKey: ['admin', 'users', query],
    queryFn: () => adminApi.adminListUsers(query),
  });
}
export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'CUSTOMER' | 'ADMIN' }) =>
      adminApi.adminUpdateUserRole(id, role),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}
