/**
 * @shopy/shared — the API contract.
 *
 * Zod schemas + inferred TypeScript types mirroring the Shopy REST API
 * (see _props/API-SPEC.md). The mobile client parses every response with these
 * so the client <-> server contract cannot drift.
 */
import { z } from 'zod';

export const SHARED_PACKAGE = '@shopy/shared' as const;

// --- Enums -----------------------------------------------------------------
export const RoleSchema = z.enum(['CUSTOMER', 'ADMIN']);
export const WeightUnitSchema = z.enum(['LB', 'OZ', 'KG', 'G', 'EACH']);
export const OrderStatusSchema = z.enum([
  'RECEIVED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]);
export const FulfillmentModeSchema = z.enum(['DELIVERY', 'PICKUP']);
export const ReplacementPreferenceSchema = z.enum([
  'BEST_MATCH',
  'SPECIFIC',
  'REFUND',
]);
export const ToneSchema = z.enum(['accent', 'deal', 'warning']);

export type Role = z.infer<typeof RoleSchema>;
export type WeightUnit = z.infer<typeof WeightUnitSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type FulfillmentMode = z.infer<typeof FulfillmentModeSchema>;
export type ReplacementPreference = z.infer<typeof ReplacementPreferenceSchema>;
export type Tone = z.infer<typeof ToneSchema>;

// --- Pagination ------------------------------------------------------------
export const MetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type Meta = z.infer<typeof MetaSchema>;

export const paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item), meta: MetaSchema });

export const listOf = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item) });

// --- Catalog ---------------------------------------------------------------
export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  icon: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

export const StoreStubSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  logo: z.string(),
  brandColor: z.string().nullable().optional(),
});
export type StoreStub = z.infer<typeof StoreStubSchema>;

export const NutritionFactSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const ProductSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  departmentId: z.string(),
  name: z.string(),
  brand: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  priceMinor: z.number(),
  compareAtMinor: z.number().nullable().optional(),
  byWeight: z.boolean(),
  weightUnit: WeightUnitSchema.nullable().optional(),
  boughtRecently: z.number(),
  image: z.string(),
  blurhash: z.string().nullable().optional(),
  tags: z.array(z.string()),
  nutrition: z.array(NutritionFactSchema).nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  store: StoreStubSchema.optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const CategoryStubSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  icon: z.string(),
});

export const StoreSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  logo: z.string(),
  categoryId: z.string(),
  etaMinutes: z.number(),
  deliveryFeeMinor: z.number(),
  dealBadge: z.string().nullable().optional(),
  pricesNote: z.string().nullable().optional(),
  rating: z.number(),
  boughtRecently: z.number(),
  brandColor: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  category: CategoryStubSchema.optional(),
});
export type Store = z.infer<typeof StoreSchema>;

export const DepartmentSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  slug: z.string(),
  name: z.string(),
  icon: z.string(),
  sort: z.number(),
});
export type Department = z.infer<typeof DepartmentSchema>;

export const ShelfSchema = z.object({
  departmentSlug: z.string(),
  title: z.string(),
  products: z.array(ProductSchema),
});

export const StoreDetailSchema = StoreSchema.extend({
  departments: z.array(DepartmentSchema),
  shelves: z.array(ShelfSchema),
});
export type StoreDetail = z.infer<typeof StoreDetailSchema>;

export const ProductDetailSchema = ProductSchema.extend({
  relatedIds: z.array(z.string()),
  oftenBoughtWithIds: z.array(z.string()),
});
export type ProductDetail = z.infer<typeof ProductDetailSchema>;

export const CategoriesResponseSchema = listOf(CategorySchema);
export const StoresResponseSchema = paginated(StoreSchema);
export const ProductsResponseSchema = paginated(ProductSchema);

// --- Home feed -------------------------------------------------------------
export const PromoSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  tone: ToneSchema,
});
export const HeroBannerSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  image: z.string(),
  cta: z.string(),
  tone: ToneSchema,
});
export type HeroBanner = z.infer<typeof HeroBannerSchema>;
export type Promo = z.infer<typeof PromoSchema>;
export const HomeSectionSchema = z.object({
  title: z.string(),
  storeIds: z.array(z.string()),
});
export const ProductShelfSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  products: z.array(ProductSchema),
});
export const HomeFeedSchema = z.object({
  categories: z.array(CategorySchema),
  promos: z.array(PromoSchema),
  heroBanners: z.array(HeroBannerSchema),
  sections: z.array(HomeSectionSchema),
  productShelves: z.array(ProductShelfSchema),
  storeCount: z.number(),
});
export type HomeFeed = z.infer<typeof HomeFeedSchema>;

// --- Auth ------------------------------------------------------------------
export const PublicUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable().optional(),
  role: RoleSchema,
  createdAt: z.string(),
});
export type PublicUser = z.infer<typeof PublicUserSchema>;

export const AuthResponseSchema = z.object({
  user: PublicUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const RefreshResponseSchema = z.object({ accessToken: z.string() });

// --- Orders ----------------------------------------------------------------
export const OrderStoreStubSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string(),
});
export const OrderLineSchema = z.object({
  productId: z.string(),
  nameSnap: z.string(),
  qty: z.number(),
  unitMinor: z.number(),
  lineMinor: z.number(),
  byWeight: z.boolean(),
});
export const OrderEventSchema = z.object({
  status: OrderStatusSchema,
  note: z.string().nullable().optional(),
  createdAt: z.string(),
});
export const OrderDetailSchema = z.object({
  id: z.string(),
  store: OrderStoreStubSchema,
  status: OrderStatusSchema,
  mode: FulfillmentModeSchema,
  slotLabel: z.string().nullable().optional(),
  addressLabel: z.string().nullable().optional(),
  lines: z.array(OrderLineSchema),
  subtotalMinor: z.number(),
  serviceFeeMinor: z.number(),
  deliveryFeeMinor: z.number(),
  tipMinor: z.number(),
  totalMinor: z.number(),
  currency: z.string(),
  etaMinutes: z.number(),
  events: z.array(OrderEventSchema),
  createdAt: z.string(),
});
export type OrderDetail = z.infer<typeof OrderDetailSchema>;

export const OrderSummarySchema = z.object({
  id: z.string(),
  store: OrderStoreStubSchema,
  status: OrderStatusSchema,
  mode: FulfillmentModeSchema,
  totalMinor: z.number(),
  currency: z.string(),
  itemCount: z.number(),
  etaMinutes: z.number(),
  createdAt: z.string(),
});
export type OrderSummary = z.infer<typeof OrderSummarySchema>;

export const OrdersResponseSchema = paginated(OrderSummarySchema);

// Request payloads
export interface CreateOrderItem {
  productId: string;
  qty: number;
  replacement?: z.infer<typeof ReplacementPreferenceSchema>;
  replacementProductId?: string;
}
export interface CreateOrderPayload {
  storeId: string;
  mode: z.infer<typeof FulfillmentModeSchema>;
  slotLabel?: string;
  addressLabel?: string;
  tipMinor?: number;
  items: CreateOrderItem[];
  payment: { method: string; forceDecline?: boolean };
}

// --- Admin -----------------------------------------------------------------
export const AdminProductSchema = ProductSchema.extend({
  department: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
  }),
});
export type AdminProduct = z.infer<typeof AdminProductSchema>;
export const AdminProductsResponseSchema = paginated(AdminProductSchema);

export const AdminStoreSchema = StoreSchema.extend({
  category: CategoryStubSchema,
  _count: z.object({
    products: z.number(),
    departments: z.number(),
    orders: z.number(),
  }),
});
export type AdminStore = z.infer<typeof AdminStoreSchema>;
export const AdminStoresResponseSchema = listOf(AdminStoreSchema);

export const AdminUsersResponseSchema = paginated(PublicUserSchema);
export const AdminOrdersResponseSchema = paginated(OrderSummarySchema);

export const AdminMetricsSchema = z.object({
  totals: z.object({
    revenueMinor: z.number(),
    orders: z.number(),
    products: z.number(),
    stores: z.number(),
    customers: z.number(),
  }),
  ordersByStatus: z.record(OrderStatusSchema, z.number()),
  recentOrders: z.array(OrderSummarySchema),
  topProducts: z.array(
    z.object({ product: ProductSchema, soldQty: z.number() }),
  ),
  revenueByDay: z.array(
    z.object({ date: z.string(), revenueMinor: z.number() }),
  ),
});
export type AdminMetrics = z.infer<typeof AdminMetricsSchema>;
