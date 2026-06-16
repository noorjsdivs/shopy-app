import { Prisma } from '@prisma/client';

/** PublicUser projection — NEVER includes passwordHash. */
export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

/** Minimal store context attached to product cards. */
export const productStoreSelect = {
  id: true,
  slug: true,
  name: true,
  logo: true,
  brandColor: true,
} satisfies Prisma.StoreSelect;

/** Standard product shape returned across catalog endpoints (with store context). */
export const productInclude = {
  store: { select: productStoreSelect },
} satisfies Prisma.ProductInclude;
