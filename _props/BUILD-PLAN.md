# BUILD-PLAN.md — Shopy

Execute in order. **Stop at every checkpoint**, summarize, give the run/verify command, and wait for
"approved" before the next phase. The database is real from Phase 1, so each later phase runs against
live, seeded data. Commit at each phase (suggested messages at the bottom).

**Build the layers bottom-up and finish each one properly before moving on** — don't leave a layer
half-wired. The backbone (in this order) must be solid: **DB + seed → NestJS API (auth, catalog,
orders, payments) → the admin/data layer → the mobile data client → screens.** A screen is only
"done" when its API endpoint, its DTO validation, its data hook, and its loading/empty/error states
all work end-to-end against the live server — and it's verified on **both iOS and Android, light +
dark**. No stubbed data in the app, no `// TODO` screens, no endpoint left unvalidated.

---

## Phase 0 — Monorepo, Docker & version check
**Goal:** the workspace exists; the local DB runs.
- Confirm Node/npm/Docker. **Web-verify latest stable** versions — Expo SDK, RN, **NativeWind + its
  Tailwind (v4→v3)**, **NestJS**, **Prisma**. Present a `package | baseline | latest | will install`
  table; wait for confirmation.
- Scaffold the npm-workspaces monorepo **in place at `shopy/`, alongside `_props/`** (TECH-STACK §1):
  root `package.json` (workspaces), `apps/api` (Nest), `apps/mobile` (Expo), `packages/shared`.
  Copy `_props/CLAUDE.md` → `shopy/CLAUDE.md`. Add `docker-compose.yml` + root `.env` + `.gitignore`.
- `docker compose up -d`; confirm Postgres is healthy.
**Checkpoint:** `docker compose ps` healthy; both apps scaffolded; workspace installs clean.
**Run:** `npm run db:up`

## Phase 1 — Database + Prisma + seed
**Goal:** schema migrated, catalog + accounts seeded, browsable in Prisma Studio.
- Author `apps/api/prisma/schema.prisma` per **DATABASE-SCHEMA.md**; `prisma migrate dev --name init`
  (commit migrations). `PrismaModule`/`PrismaService`.
- Author `prisma/seed.ts` from **SEED-DATA.md**: categories → stores → departments → products
  (clone templates per store with price scaling) → admin + customer (bcrypt) → a few demo orders.
  Idempotent `upsert`; `prisma db seed`.
**Checkpoint:** `prisma studio` shows 7 stores, departments, hundreds of products, 2 users, demo
orders; re-running the seed doesn't duplicate. **Run:** `npm run api:seed`

## Phase 2 — NestJS API: auth + catalog
**Goal:** a running API with real auth and the public catalog.
- Bootstrap `main.ts` (global ValidationPipe, exception filter, CORS, `/api` prefix, `0.0.0.0`).
- **Auth module:** register/login/refresh/me, `bcrypt`, JWT access+refresh, `JwtStrategy`,
  `JwtAuthGuard`, `RolesGuard`, `@Roles`, `@CurrentUser`. Never leak `passwordHash`.
- **Catalog modules:** `categories`, `stores` (+ detail w/ departments+shelves), `departments`
  (filters/sort/pagination), `products` (detail, search), `home` (curated feed) — per **API-SPEC.md**.
**Checkpoint:** with `curl`/REST client: register→login→`/auth/me` works; `/home`, `/stores`,
`/stores/:slug`, department listing, `/products/:id`, search all return seeded data; bad token → 401.
**Run:** `npm run api:dev`

## Phase 3 — NestJS API: orders, payments, admin
**Goal:** the write side + admin endpoints, all guarded.
- **Payments** (simulated authorize, decline path). **Orders:** `POST /orders` recomputes prices
  server-side, runs payment, persists order+lines+initial event; `GET /orders`, `/orders/:id`
  (ownership). **Admin** (`@Roles(ADMIN)`): metrics, products CRUD (soft delete), stores CRUD,
  orders list + status change, users list + role change (protect last admin).
**Checkpoint:** customer can place an order (and hit a decline); admin token reaches `/admin/*`,
customer token gets 403; status change appends an event; metrics reflect seeded + new orders.
**Run:** `npm run api:dev`

## Phase 4 — Mobile foundation: branding, NativeWind, theme, data layer, auth modal
**Goal:** the app boots branded, themed, glossy-ready, talking to the API, with the guest/auth gate.
- **Branding (BRANDING-ASSETS.md):** master logo SVG + `Logo` component; generate icon / adaptive
  icon / light+dark splash; wire `app.json` (icon, splash plugin w/ dark, adaptive icon, bundle ids,
  `userInterfaceStyle:"automatic"`, `edgeToEdgeEnabled`). Splash held until fonts + session restore.
- NativeWind setup (TECH-STACK §4): tailwind.config (DESIGN-SPEC §2 theme), global.css vars, babel,
  metro, env d.ts, tsconfig `@/`. Load Inter. `cssInterop` for `LinearGradient`/`BlurView`.
- **Themed, safe-area-aware `TabBar`** (DESIGN-SPEC §8): equal slots, bottom inset, token colors that
  swap on `dark:`, cart badge.
- Data layer: axios client (base URL **per platform**, token interceptor, 401-refresh), zod schemas
  in `packages/shared`, TanStack Query provider, Zustand `auth` (SecureStore tokens) + `cart`
  (persists for guests too) + `theme`. `cn()`.
- **Auth-anywhere:** full `(auth)` welcome/sign-in/sign-up **and** the **`AuthSheet` modal** +
  `useAuthGate().requireAuth(action)` that resumes the pending action on success (CLAUDE "Guest &
  auth-anywhere"). Guests browse freely; the gate only fires on checkout/orders/account.
- `/_kitchen-sink` route renders the core components + gloss recipes + `AuthSheet` in light + dark.
**Checkpoint (verify on iOS *and* Android, both themes):** app boots with the branded icon + splash
(no white flash); `dark:` toggles incl. the tab bar; sign-up/sign-in/refresh and the **modal gate**
work against the live API and resume the queued action; kitchen-sink correct; **no
`StyleSheet.create`/raw hex**. **Run:** `npm run mobile:dev` (press i / a)

## Phase 5 — Storefront: glossy Home, Store, Department, Search, Product
**Goal:** the shopping surface, from the API, looking premium.
- **Home (DESIGN-SPEC §6.4):** `GradientHero` carousel, category rail, promos, featured stores,
  product carousels; pull-to-refresh; shimmer skeletons; **add-to-cart fly + badge bump**.
- Store view (sticky `DeptTabs` scroll-spy, shelves, glass `CartBar`); Department (filters + sort +
  infinite scroll); Search (products + stores); Product detail (qty add, nutrition, related).
**Checkpoint:** browse a store → add items (incl. a by-weight item) → free-delivery meter updates →
open product detail — loading/empty/error states, both themes, glossy home matches spec.
**Run:** `npm run mobile:dev`

## Phase 6 — Cart, checkout, orders
**Goal:** complete the purchase loop end-to-end against the API.
- Cart (grouped by store, qty, replacement preference, promo, summary + meter) — usable **as a
  guest**. Checkout `Stepper` (address → tip → **demo** payment → review). **Place order** runs
  through `requireAuth(placeOrder)`: a guest gets the `AuthSheet`, signs in/registers, and the order
  places automatically with their cart intact → `POST /orders` → animated success → order detail;
  handle a decline. Order detail (`OrderTimeline` from API events) + history (reorder), both auth-gated.
**Checkpoint:** as a **guest**, fill a cart → tap checkout → the auth modal appears → create an
account → the order places without re-tapping; it's persisted in `GET /orders` + Prisma Studio; view
the timeline; reorder; test a decline. Verify on iOS + Android. **Run:** `npm run mobile:dev`

## Phase 7 — Admin Dashboard (in-app, role-gated)
**Goal:** admins manage the catalog and orders from inside the app.
- `(admin)` route group with a **role guard** (redirect non-admins). Account shows the Admin entry
  only for `ADMIN`. Dashboard metrics + chart; products list + create/edit/soft-delete; orders list +
  status changer; stores CRUD; users list + role change. TanStack Query invalidation keeps lists fresh.
**Checkpoint:** log in as `admin@shopy.dev` → dashboard shows real metrics → create a product → it
appears in the storefront → change an order's status → the customer's order timeline reflects it.
Log in as the customer → no Admin entry, `(admin)` deep-link redirects. **Run:** `npm run mobile:dev`

## Phase 8 — Polish, QA & release prep
**Goal:** production-grade craft.
- Motion pass + **reduce-motion** paths; 60fps lists (windowing + blurhash); gloss consistency.
- Accessibility pass (labels incl. price/unit/deal, cart + status announcements, contrast, Dynamic
  Type). a11y on admin forms.
- **iOS + Android pass:** run both, light + dark — branded icon/splash, themed safe-area tab bar,
  keyboard behavior, blur fallbacks; fix any platform gaps.
- Quality gates: **api** `tsc`+lint clean, migrations apply on a fresh DB, seed idempotent; **mobile**
  `tsc`+`expo lint`+`expo-doctor` clean, no `StyleSheet.create`/raw hex; remove debug/kitchen-sink;
  finalize icon/splash. Root README with run steps + the demo logins (`admin@shopy.dev` /
  `customer@shopy.dev`).
- Optional: `eas build --profile preview` (iOS + Android); Dockerfile for the API.
**Checkpoint:** fresh clone → `db:up` → migrate → seed → api → mobile runs **on iOS and Android** the
full guest shop → auth-modal at checkout → order, and admin manages catalog/orders, both themes,
offline-tolerant imagery.

---

## Cross-cutting acceptance (every phase)
Light + dark via `dark:` · **works on iOS and Android** (safe-area, insets, themed tab bar) ·
**NativeWind `className` only** (no `StyleSheet.create`/raw hex) · all mobile data via `services/api`
+ TanStack Query with loading/empty/error · server **validates DTOs and computes prices** · JWT +
role guards enforced · guest-first with the auth modal gating only checkout/orders/account and
**resuming the action** · no secrets in code · never collect real card data · labels + 44×44 + AA
contrast + reduce-motion · seed re-runnable.

## Suggested commits
`chore: monorepo + docker + workspaces` → `feat(db): prisma schema + seed` →
`feat(api): auth + catalog` → `feat(api): orders + payments + admin` →
`feat(mobile): branding + nativewind + theme + auth modal + data layer` →
`feat(mobile): glossy home + store + department + search + product` →
`feat(mobile): cart + guest-gated checkout + orders` → `feat(mobile): admin dashboard` →
`chore: polish + a11y + iOS/Android pass + release`.

## Later (production)
Point `DATABASE_URL` at a hosted Postgres and `prisma migrate deploy`; set `EXPO_PUBLIC_API_URL` to
the deployed API; rotate JWT secrets and change the seeded demo passwords; optionally swap the
simulated `payments` module for a real provider — **no screen or schema changes**, since the mobile
app only talks to the API and the API only talks to Prisma.
