# API-SPEC.md — Shopy NestJS REST API

Base URL: `EXPO_PUBLIC_API_URL` (e.g. `http://localhost:4000/api`). All bodies are JSON. Money is
integer minor units + `currency`. Auth via `Authorization: Bearer <accessToken>`.

## Conventions
- **List responses:** `{ data: T[], meta: { total, page, pageSize } }`. Single resource: the object.
- **Errors (global filter):** `{ statusCode, message, error }` (`message` may be a string or
  string[] from validation). Status codes: `400` validation, `401` unauthenticated, `403` wrong
  role, `404` not found, `409` conflict (e.g. duplicate email).
- **Pagination:** `?page=1&pageSize=12` (defaults 1 / 12; `pageSize` max 50).
- **Validation:** every body is a `class-validator` DTO; global `ValidationPipe(whitelist,transform)`.
- **Roles:** unguarded (public) · `JwtAuthGuard` (any authed user) · `JwtAuthGuard + RolesGuard
  @Roles(ADMIN)` (admin only).

---

## Auth (`/auth`)

### `POST /auth/register` — public
Body: `{ email: string(email), password: string(min 8), name?: string }`
→ `201 { user: PublicUser, accessToken, refreshToken }`. `409` if email exists. Role = `CUSTOMER`.

### `POST /auth/login` — public
Body: `{ email, password }` → `200 { user, accessToken, refreshToken }`. `401` on bad creds.

### `POST /auth/refresh` — public (refresh token in body)
Body: `{ refreshToken }` → `200 { accessToken }`. `401` if invalid/expired.

### `GET /auth/me` — authed
→ `200 PublicUser`.

`PublicUser = { id, email, name, role, createdAt }` — **never** includes `passwordHash`.
JWT payload: `{ sub: userId, email, role }`. Access TTL `JWT_ACCESS_TTL`, refresh `JWT_REFRESH_TTL`.

---

## Catalog (public)

### `GET /home` — curated feed for the glossy home
→ `200`:
```jsonc
{
  "categories": [{ "slug", "name", "icon" }],
  "promos": [{ "id", "title", "subtitle", "tone": "accent|deal|warning" }],
  "heroBanners": [{ "id", "title", "subtitle", "image", "cta", "tone" }],
  "sections": [{ "title": "Stores near you", "storeIds": ["..."] }],
  "productShelves": [{ "id", "title", "subtitle", "products": [Product] }],
  "storeCount": 7
}
```
Built server-side: sections = all / popular (by `boughtRecently`) / has-deal; shelves = best deals,
popular, fresh-produce picks (dedupe by name).

### `GET /categories` — public
→ `200 { data: Category[] }`.

### `GET /stores?category=&page=&pageSize=` — public
→ `200 { data: Store[], meta }`. `category` filters by category slug.

### `GET /stores/:slug` — public
→ `200 StoreDetail` = `Store & { departments: Department[], shelves: { departmentSlug, title,
products: Product[] }[] }`. `404` if missing.

### `GET /stores/:slug/departments/:deptSlug` — public
Query: `?sort=popular|price-asc|price-desc|name & dietary=Organic,Vegan & maxPriceMinor= &
onDealOnly=true & page= & pageSize=`
→ `200 { data: Product[], meta }`. Filtering + sort done in the query (DB-side where possible).

### `GET /products/:id` — public
→ `200 ProductDetail` = `Product & { nutrition?, relatedIds?, oftenBoughtWithIds? }`. `404` if missing.

### `GET /products?search=&storeId=&page=&pageSize=` — public
Searches name/brand/tags (case-insensitive `contains`). `storeId` scopes to one store.
→ `200 { data: Product[], meta }`.

---

## Orders (authed — customer owns their orders)

> **Guest model:** the catalog and cart are public/client-owned, so a guest shops without an account.
> Orders are the **first endpoint that requires auth** — this is exactly where the mobile `AuthSheet`
> gate fires. The client builds the cart locally and only calls `POST /orders` once the user is
> authenticated (the modal resumes the action), so the cart carries straight into the order.

### `POST /orders` — authed
Body:
```jsonc
{
  "storeId": "string",
  "mode": "DELIVERY|PICKUP",
  "slotLabel": "Today, 10–11am",
  "addressLabel": "Home",
  "tipMinor": 500,
  "items": [{ "productId": "string", "qty": 2, "replacement": "BEST_MATCH|SPECIFIC|REFUND", "replacementProductId?": "string" }],
  "payment": { "method": "demo-card", "forceDecline?": false }
}
```
Server flow: validate → reload products from DB → **recompute** `unitMinor/lineMinor/subtotal/fees/
total` (cart math) → `POST` to internal payments.authorize → on decline `402 { error:'payment_declined' }`
→ on success create `Order` + `OrderLine`s + initial `OrderStatusEvent(RECEIVED)` →
`201 OrderDetail`. **Client-sent prices are ignored.**

### `GET /orders?page=&pageSize=` — authed
→ `200 { data: OrderSummary[], meta }` — only the caller's orders, newest first.

### `GET /orders/:id` — authed
→ `200 OrderDetail` (must belong to caller, else `403/404`). Includes `lines`, `events`, totals.

`OrderDetail = { id, store: {id,name,logo}, status, mode, slotLabel, addressLabel, lines:
[{ productId, nameSnap, qty, unitMinor, lineMinor, byWeight }], subtotalMinor, serviceFeeMinor,
deliveryFeeMinor, tipMinor, totalMinor, currency, etaMinutes, events: [{ status, note, createdAt }],
createdAt }`.

---

## Payments (`/payments`) — simulated, never real card data

### `POST /payments/authorize` — authed (usually called internally by Orders)
Body: `{ amountMinor, currency, method: 'demo-card', forceDecline? }`
→ `200 { ok: true, authId }` or `{ ok: false, declineReason }`. **Never collect/transmit real
card data.** A demo card like `4000…0002` (or `forceDecline:true`) returns a decline so the UI can
exercise that path.

---

## Admin (`/admin/*`) — `@Roles(ADMIN)` only (403 otherwise)

### `GET /admin/metrics`
→ `200 { totals: { revenueMinor, orders, products, stores, customers }, ordersByStatus:
{ RECEIVED, PROCESSING, ... }, recentOrders: OrderSummary[], topProducts: [{ product, soldQty }],
revenueByDay: [{ date, revenueMinor }] }`. Powers the dashboard cards + a simple chart.

### Products CRUD
- `GET /admin/products?search=&storeId=&page=&pageSize=` → `{ data: Product[], meta }` (includes
  inactive).
- `POST /admin/products` → body = product fields (storeId, departmentId, name, priceMinor,
  compareAtMinor?, size?, brand?, byWeight?, weightUnit?, image, tags[], description?, isActive?).
  `201 Product`.
- `GET /admin/products/:id` → `Product`.
- `PATCH /admin/products/:id` → partial update → `Product`.
- `DELETE /admin/products/:id` → soft delete (`isActive=false`) → `204`. (Hard delete optional.)

### Stores CRUD
- `GET /admin/stores` · `POST /admin/stores` · `PATCH /admin/stores/:id` · `DELETE /admin/stores/:id`
  (soft). Department management may piggyback on the store payload or `POST /admin/stores/:id/departments`.

### Orders management
- `GET /admin/orders?status=&storeId=&page=&pageSize=` → all orders `{ data, meta }`.
- `GET /admin/orders/:id` → `OrderDetail`.
- `PATCH /admin/orders/:id/status` → body `{ status, note? }` → appends an `OrderStatusEvent`,
  updates `Order.status` → `OrderDetail`. (This is how an admin advances fulfillment.)

### Users
- `GET /admin/users?search=&page=&pageSize=` → `{ data: PublicUser[], meta }`.
- `PATCH /admin/users/:id/role` → body `{ role }` → `PublicUser` (promote/demote; guard against
  removing the last admin).

---

## DTO + zod parity
Every request DTO is a `class-validator` class in the API; every response is mirrored by a **zod
schema in `packages/shared`** that the mobile client uses to parse. Keep names aligned (`Product`,
`StoreDetail`, `OrderDetail`, `PublicUser`, `Meta`) so the contract can't silently drift.

## Mobile client expectations
- Axios instance: `baseURL = EXPO_PUBLIC_API_URL`; request interceptor adds the bearer token from
  SecureStore; on `401` it calls `/auth/refresh` once, retries, else clears the session.
- TanStack Query keys: `['home']`, `['stores',category]`, `['store',slug]`,
  `['department',slug,filters,page]`, `['product',id]`, `['search',q,storeId]`, `['orders']`,
  `['order',id]`, and `['admin', ...]` for admin screens. Admin mutations invalidate the matching
  queries.
