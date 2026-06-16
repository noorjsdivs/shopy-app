export interface PageMeta {
  total: number;
  page: number;
  pageSize: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

/** Clamp + normalize page/pageSize and compute Prisma skip/take. */
export function resolvePaging(page?: number, pageSize?: number) {
  const safePage = Math.max(1, page ?? 1);
  const safeSize = Math.min(50, Math.max(1, pageSize ?? 12));
  return {
    page: safePage,
    pageSize: safeSize,
    skip: (safePage - 1) * safeSize,
    take: safeSize,
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> {
  return { data, meta: { total, page, pageSize } };
}
