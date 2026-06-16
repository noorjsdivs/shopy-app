import {
  useInfiniteQuery,
  useQueries,
  useQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import type { Product } from '@shopy/shared';
import { catalogApi } from '@/services/api';
import type { DepartmentQuery } from '@/services/api/catalog';

export function useHome() {
  return useQuery({ queryKey: ['home'], queryFn: catalogApi.getHome });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: catalogApi.getCategories });
}

export function useStores(category?: string) {
  return useQuery({
    queryKey: ['stores', category ?? 'all'],
    queryFn: () => catalogApi.getStores({ category }),
  });
}

export function useStore(slug: string) {
  return useQuery({
    queryKey: ['store', slug],
    queryFn: () => catalogApi.getStore(slug),
    enabled: Boolean(slug),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogApi.getProduct(id),
    enabled: Boolean(id),
  });
}

const PAGE_SIZE = 12;

export function useDepartment(
  slug: string,
  deptSlug: string,
  filters: Omit<DepartmentQuery, 'page' | 'pageSize'>,
) {
  return useInfiniteQuery({
    queryKey: ['department', slug, deptSlug, filters],
    queryFn: ({ pageParam = 1 }) =>
      catalogApi.getDepartment(slug, deptSlug, {
        ...filters,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.meta.page * lastPage.meta.pageSize;
      return loaded < lastPage.meta.total ? lastPage.meta.page + 1 : undefined;
    },
    enabled: Boolean(slug && deptSlug),
  });
}

/** Fetch several products by id (for related / often-bought-with shelves). */
export function useProductsByIds(ids: string[]): { data: Product[]; isLoading: boolean } {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['product', id],
      queryFn: () => catalogApi.getProduct(id),
      enabled: Boolean(id),
    })),
  });
  return {
    data: results.flatMap((r) => (r.data ? [r.data as Product] : [])),
    isLoading: results.some((r) => r.isLoading),
  };
}

export function useSearch(term: string, storeId?: string) {
  const q = term.trim();
  return useQuery({
    queryKey: ['search', q, storeId ?? null],
    queryFn: () => catalogApi.searchProducts({ search: q, storeId }),
    enabled: q.length > 0,
    placeholderData: keepPreviousData,
  });
}
