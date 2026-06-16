# DATABASE-SCHEMA.md — Shopy (Prisma · PostgreSQL)

The data model mirrors the catalog shape (Store → Department → Product) and adds the auth, cart and
order tables a real backend needs. **Money is integer minor units (`Int`), never floats.** This is a
reference schema — Claude Code should confirm syntax against the installed Prisma version and may
add indexes/constraints as needed.

## Entities & relations (overview)

- **User** — auth + role. Has many **Order**, many **Address**, many **CartItem**.
- **Category** — store category (grocery, fashion, electronics…). Has many **Store**.
- **Store** — a seller/storefront. Belongs to a **Category**; has many **Department**, **Product**,
  **Order**.
- **Department** — a section within a store (Produce, Dairy…). Has many **Product**.
- **Product** — sellable item in a store + department. Has many **CartItem**, **OrderLine**.
- **Order** — a placed order (belongs to **User** + **Store**); has many **OrderLine** and
  **OrderStatusEvent**.
- **CartItem** — server-persisted cart line (optional; cart may stay client-side — see note).
- **Address** — saved delivery address for a user.

> **Cart note:** the cart is primarily **client-owned** (Zustand + persist) for snappy UX. The
> `CartItem` table is included so the cart can optionally sync to the server / across devices; if
> Claude Code keeps the cart client-only, omit `CartItem` and the `/cart` endpoints — the schema
> still works. Default: keep it, it's cheap and demonstrates the full stack.

## `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER
  ADMIN
}

enum WeightUnit {
  LB
  OZ
  KG
  G
  EACH
}

enum OrderStatus {
  RECEIVED
  PROCESSING
  PACKED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum FulfillmentMode {
  DELIVERY
  PICKUP
}

enum ReplacementPreference {
  BEST_MATCH
  SPECIFIC
  REFUND
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  passwordHash String
  name         String?
  role         Role       @default(CUSTOMER)
  addresses    Address[]
  orders       Order[]
  cartItems    CartItem[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model Address {
  id     String  @id @default(cuid())
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  label  String
  line1  String
  line2  String?
  city   String
  state  String
  zip    String
}

model Category {
  id     String  @id @default(cuid())
  slug   String  @unique
  name   String
  icon   String
  stores Store[]
}

model Store {
  id               String       @id @default(cuid())
  slug             String       @unique
  name             String
  logo             String       // emoji / short mark
  category         Category     @relation(fields: [categoryId], references: [id])
  categoryId       String
  etaMinutes       Int
  deliveryFeeMinor Int          @default(0)
  dealBadge        String?
  pricesNote       String?
  rating           Float        @default(0)
  boughtRecently   Int          @default(0)
  brandColor       String?
  departments      Department[]
  products         Product[]
  orders           Order[]
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}

model Department {
  id       String    @id @default(cuid())
  store    Store     @relation(fields: [storeId], references: [id], onDelete: Cascade)
  storeId  String
  slug     String    // unique per store
  name     String
  icon     String
  sort     Int       @default(0)
  products Product[]

  @@unique([storeId, slug])
}

model Product {
  id              String      @id @default(cuid())
  store           Store       @relation(fields: [storeId], references: [id], onDelete: Cascade)
  storeId         String
  department      Department  @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  departmentId    String
  name            String
  brand           String?
  size            String?
  description     String?
  priceMinor      Int
  compareAtMinor  Int?        // struck-through "was" price for deals
  byWeight        Boolean     @default(false)
  weightUnit      WeightUnit?
  boughtRecently  Int         @default(0)
  image           String
  blurhash        String?
  tags            String[]    // dietary / facets
  nutrition       Json?       // [{ label, value }]
  isActive        Boolean     @default(true)
  cartItems       CartItem[]
  orderLines      OrderLine[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([storeId, departmentId])
  @@index([name])
}

model CartItem {
  id                    String                @id @default(cuid())
  user                  User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId                String
  product               Product               @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId             String
  qty                   Int                   @default(1)
  replacement           ReplacementPreference @default(BEST_MATCH)
  replacementProductId  String?
  createdAt             DateTime              @default(now())

  @@unique([userId, productId])
}

model Order {
  id           String             @id @default(cuid())
  user         User               @relation(fields: [userId], references: [id])
  userId       String
  store        Store              @relation(fields: [storeId], references: [id])
  storeId      String
  status       OrderStatus        @default(RECEIVED)
  mode         FulfillmentMode    @default(DELIVERY)
  slotLabel    String?
  addressLabel String?
  // snapshot of computed economics at placement (server-computed, minor units)
  subtotalMinor    Int
  serviceFeeMinor  Int
  deliveryFeeMinor Int
  tipMinor         Int            @default(0)
  totalMinor       Int
  currency         String         @default("USD")
  etaMinutes       Int            @default(0)
  paymentAuthId    String?        // from simulated payments.authorize
  lines        OrderLine[]
  events       OrderStatusEvent[]
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  @@index([userId])
}

model OrderLine {
  id          String   @id @default(cuid())
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String
  product     Product  @relation(fields: [productId], references: [id])
  productId   String
  nameSnap    String   // product name at purchase time
  qty         Int
  unitMinor   Int      // price per unit at purchase time
  lineMinor   Int      // unitMinor * qty
  byWeight    Boolean  @default(false)
}

model OrderStatusEvent {
  id        String      @id @default(cuid())
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
  status    OrderStatus
  note      String?
  createdAt DateTime    @default(now())
}
```

## Migrations
- First run: `npx prisma migrate dev --name init` (creates tables + typed client). Commit the
  generated `prisma/migrations/` folder.
- Schema changes go through `prisma migrate dev` (dev) / `prisma migrate deploy` (prod). Never edit
  the DB by hand.

## Seeding (`prisma/seed.ts`) — strategy
1. **Idempotent:** use `upsert` keyed by natural keys (`Category.slug`, `Store.slug`,
   `Department [storeId,slug]`, `Product` by a deterministic slug/`[storeId,name]`). Safe to re-run.
2. **Order:** categories → stores → departments → products → default users (1 admin, 1 customer) →
   a couple of demo orders for the admin dashboard to show non-empty metrics.
3. **Source data:** **`SEED-DATA.md`** (catalog templates cloned per store with a price multiplier,
   exactly like the reference app). Hash passwords with `bcrypt`.
4. Run via `prisma db seed` (configured in `package.json`). Document the Unsplash image source.

## Server-side pricing rule
`POST /orders` ignores client prices: it reloads each `productId` from the DB, recomputes
`unitMinor`, `lineMinor`, `subtotalMinor`, fees and `totalMinor` (same math as `src/lib/cart.ts`),
snapshots `nameSnap`/`unitMinor` into `OrderLine`, and stores the result. This is the integrity
boundary — never trust client-sent money.
