# CLAUDE.md — Shopy project rules (e-commerce · Expo/NativeWind + NestJS/Prisma)

> Persistent context for Claude Code. Keep at the repo root (`shopy/CLAUDE.md`).
> Toolchain baseline verified 2026-06-16. **Always web-verify the latest stable versions.**

## Project

**Shopy** — a premium, **glossy** e-commerce app with a real client-server backend.

- **Client:** Expo + React Native + Expo Router + **NativeWind v4 (Tailwind v3)** + Reanimated v4 +
  Zustand + TanStack Query + secure on-device storage · TypeScript (strict).
- **Server:** **NestJS** (REST) + **Prisma ORM** + **PostgreSQL** (local via **Docker**), JWT auth
  (access + refresh) with `bcrypt`, role-based access control (`CUSTOMER` / `ADMIN`).
- **Admin Dashboard:** built **into the mobile app**, unlocked by the `ADMIN` role.

Design system → `_props/DESIGN-SPEC.md`. Plan → `_props/BUILD-PLAN.md`. Versions + setup →
`_props/TECH-STACK-SETUP.md`. DB → `_props/DATABASE-SCHEMA.md`. Seed → `_props/SEED-DATA.md`.
API contract → `_props/API-SPEC.md`. Branding/icons/splash → `_props/BRANDING-ASSETS.md`.
**These are the source of truth.**

**Targets both iOS and Android (Expo).** Every screen must look and behave correctly on both — the
user runs the app on real devices/simulators. Build cross-platform from the start (safe-area insets,
themed status bar, Android edge-to-edge, keyboard avoidance, blur/shadow fallbacks). Never ship a
layout verified on only one platform.

**Guest-first, auth only at checkout.** Guests browse, search, and build a cart with no account.
Authentication is required **only to place an order** (and other write actions). Gate those with a
reusable **auth modal** (email + password, switchable to sign-up) that **resumes the pending action**
on success — see "Guest & auth-anywhere" below.

## Project location

Claude Code starts in the **`shopy/`** root, which contains only **`_props/`**. Scaffold the
monorepo **in place at the root of `shopy/`, alongside `_props/`** — never inside `_props/`, never
nested. Copy `_props/CLAUDE.md` up to `shopy/CLAUDE.md` so it auto-loads. **Never delete or
overwrite `_props/`.**

## Repository shape (npm workspaces monorepo)

```
shopy/
  _props/                      # planning docs (read-only)
  CLAUDE.md                    # this file (copied up)
  docker-compose.yml           # postgres:16 service for local dev
  .env                         # root infra env (DB creds) — gitignored
  package.json                 # workspaces: ["apps/*", "packages/*"]
  packages/
    shared/                    # shared TS types + zod schemas (API contract mirror)
  apps/
    api/                       # NestJS + Prisma
      prisma/
        schema.prisma
        seed.ts
        migrations/
      src/
        main.ts  app.module.ts
        prisma/                # PrismaModule + PrismaService
        auth/                  # JWT strategy, guards, @Roles, @CurrentUser, DTOs
        users/  categories/  stores/  departments/
        products/  cart/  orders/  payments/  admin/
        common/                # filters, interceptors, pagination, decorators
      .env                     # API env (DATABASE_URL, JWT secrets) — gitignored
    mobile/                    # Expo + NativeWind (see app/ + src/ below)
```

### Mobile app structure (`apps/mobile`)
```
app/
  _layout.tsx                  # imports global.css; providers (Query, theme, auth, cart, AuthSheet); fonts; splash
  (auth)/ welcome.tsx sign-in.tsx sign-up.tsx     # full-screen auth (also reachable as the modal)
  (tabs)/
    _layout.tsx                # tabs: Home, Search, Categories, Cart(badge), Account
    index.tsx                  # GLOSSY home (hero, categories, featured stores, deal carousels)
    search.tsx  categories.tsx  cart.tsx  account.tsx
  store/[id].tsx               # store view (department shelves)
  store/[id]/dept/[slug].tsx   # department listing (filters + sort + pagination)
  product/[id].tsx             # product detail
  checkout.tsx                 # address → payment(demo) → review → place order
  order/[id].tsx  orders.tsx   # order detail + history
  (admin)/                     # ROLE-GATED admin area (ADMIN only)
    _layout.tsx                # admin guard + admin nav
    index.tsx                  # dashboard metrics
    products/index.tsx products/[id].tsx products/new.tsx
    orders/index.tsx orders/[id].tsx
    stores/index.tsx  users/index.tsx
src/
  components/                  # design-system components (see DESIGN-SPEC §5), incl. AuthSheet, TabBar
  features/                    # catalog, store, cart, checkout, orders, auth, admin modules
                               # auth/: AuthSheet (modal), useAuthGate(requireAuth), session restore
  services/
    api/                       # typed HTTP client → NestJS (fetch + zod parse) — the ONLY data source
    storage/                   # SecureStore (tokens) + AsyncStorage (cart/prefs)
  store/                       # Zustand: session/auth, cart, ui
  lib/                         # money/format, cart math, cn(), query client, env
  types/                       # mirrors packages/shared
global.css  tailwind.config.js  metro.config.js  babel.config.js  nativewind-env.d.ts
```

## Golden rules — Mobile (client)

1. **NativeWind `className`, not `StyleSheet.create`** (Reanimated animated styles excepted).
2. **Tokens live in `tailwind.config.js`** (`theme.extend`); semantic names (`bg-bg`, `bg-surface`,
   `text-fg`, `text-muted`, `bg-primary`, `border-line`, `text-deal`). **No raw hex / magic numbers.**
3. **Theme with `dark:`** + `useColorScheme()` (system/light/dark); semantic colors via CSS variables.
4. **`cn()`** (`clsx` + `tailwind-merge`) + **`cva`** for variants.
5. **All data flows through `src/services/api`** (the typed HTTP client) via **TanStack Query**
   hooks. Components never call `fetch` directly. Parse every response with **zod**.
6. **No screen renders `// TODO`.** Every screen has loading / empty / error states from day one.
7. **Typed routes only** (`expo-router`; never `@react-navigation/*`).
8. **Accessibility:** roles + labels (incl. price/unit/deal), 44×44 targets, AA contrast both
   themes, reduce-motion paths.
9. **Glossy by spec:** match `DESIGN-SPEC.md` — gradients, glass cards, elevation, hero motion.
   Glass/gradient via approved tokens + `expo-linear-gradient` / `expo-blur`, **not** raw hex.
10. **Cross-platform (iOS + Android):** use `react-native-safe-area-context` insets everywhere;
    Android edge-to-edge enabled; `BlurView` has a solid-token fallback on Android; shadows via
    NativeWind (elevation on Android); `KeyboardAvoidingView`/sheet behavior correct on both. The
    **bottom tab bar respects the safe-area bottom inset** and never overlaps the home indicator.
11. **Tab bar theming:** active `text-primary` / inactive `text-muted` via tokens that swap with
    `dark:`; the bar background is `bg-surface`/glass and re-themes instantly on light↔dark.

## Guest & auth-anywhere (the gate model)
- **Guests can:** browse home/stores/departments/search, open products, add/edit the cart, change
  prefs/theme. **No login required.** Cart persists locally for guests.
- **Auth required only for:** placing an order (checkout), viewing order history/detail, and account
  actions. Hitting any of these as a guest opens the **`AuthSheet`** modal.
- **`useAuthGate()` → `requireAuth(action)`:** if authed, runs `action()` now; else opens `AuthSheet`,
  and on successful sign-in/up **runs the queued `action()` automatically** (e.g. proceed to
  checkout / place the order) — no second tap, no lost context.
- **`AuthSheet`** = a bottom-sheet modal: email + password, primary "Sign in", a toggle to
  "Create account" (same sheet), inline zod errors, loading state. It calls the same
  `/auth/login` · `/auth/register` as the full screens and stores tokens in SecureStore. Works from
  anywhere (checkout, orders, account) without leaving the current screen.

## Golden rules — API (server)

1. **Prisma is the only DB access path.** No raw SQL except inside a documented Prisma `$queryRaw`.
2. **Validate every input** with `class-validator` DTOs; enable a global `ValidationPipe`
   (`whitelist: true, transform: true`). Never trust client-sent prices — **prices are computed
   server-side** from the DB at order time.
3. **Money = integer minor units** (cents) + `currency`. Never floats. Prisma `Int` columns.
4. **Auth:** `bcrypt` hashing (cost ≥ 10), JWT **access** (short-lived) + **refresh** (long-lived)
   tokens. Guard protected routes with `JwtAuthGuard`; gate admin routes with `RolesGuard` +
   `@Roles(Role.ADMIN)`. Never return `passwordHash` in any response.
5. **Consistent responses:** REST resources, plural nouns, list endpoints return
   `{ data, meta: { total, page, pageSize } }`. A global exception filter returns
   `{ statusCode, message, error }`.
6. **Config via `@nestjs/config`** — `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
   `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `PORT`, `CORS_ORIGIN`. **No secrets in code.**
7. **CORS enabled** for the Expo dev client. **Seed is idempotent** (`upsert`), re-runnable.
8. **Swap-ready:** local `DATABASE_URL` → production URL changes nothing in code.

## Auth + roles contract

- `POST /auth/register` → creates a `CUSTOMER`, returns `{ user, accessToken, refreshToken }`.
- `POST /auth/login` → verifies `bcrypt`, returns the same shape.
- `POST /auth/refresh` → new access token from a valid refresh token.
- `GET /auth/me` → current user (requires access token).
- Roles: `CUSTOMER` (browse, cart, checkout, own orders) and `ADMIN` (everything + `/admin/*`).
- Mobile: tokens in **`expo-secure-store`**; an axios/fetch interceptor attaches `Authorization:
  Bearer <access>` and refreshes on 401. The **(admin)** route group is guarded by the role; a
  non-admin who deep-links there is redirected.

## The API surface (full contract in `API-SPEC.md`)
```
Auth:        POST /auth/register | /auth/login | /auth/refresh ; GET /auth/me
Catalog:     GET /categories ; GET /stores[?category] ; GET /stores/:id (with departments+shelves)
             GET /stores/:id/departments/:slug (filters, sort, pagination) ; GET /products/:id
             GET /products?search=&storeId= ; GET /home (curated feed)
Cart:        client-owned (Zustand+persist); priced via GET /products for line lookups
Orders:      POST /orders (auth) ; GET /orders (own) ; GET /orders/:id
Payments:    POST /payments/authorize (simulated success/decline)
Admin:       GET /admin/metrics ; CRUD /admin/products ; /admin/stores ; GET /admin/orders ;
             PATCH /admin/orders/:id/status ; GET /admin/users
```

## Conventions
- **TS strict**, no `any`, on both apps. **Shared types/zod schemas** live in `packages/shared` and
  are imported by mobile + (where useful) the API, so the contract can't drift.
- **State (mobile):** TanStack Query for server data; Zustand (persisted) for **auth session** +
  **cart** + UI/theme. SecureStore for tokens only.
- **Images:** `expo-image` + blurhash; royalty-free product photos (document source) or
  color/blurhash placeholders so the UI looks right before images load.
- **Imports:** absolute via `@/` alias in each app.

## Definition of done (per feature)
Renders light + dark via `dark:` · **looks correct on both iOS and Android** (safe-area, insets,
keyboard) · data via `services/api` (TanStack Query) with loading/empty/error · cart persists across
restart (incl. as a guest) · auth gate + role gating work end-to-end, and the auth modal **resumes
the pending action** · its motion implemented + reduce-motion-safe · keyboard + screen-reader
navigable · **mobile:** `tsc --noEmit` + `expo lint` + `expo-doctor` clean, no `StyleSheet.create`/
raw hex · **api:** DTO-validated, `tsc` + lint clean, seed re-runnable, Prisma migration committed.

## Branding & cross-platform (see `BRANDING-ASSETS.md`)
Ship a real **logo**, **app icon**, Android **adaptive icon**, and a **light/dark splash**, wired in
`app.json` per `BRANDING-ASSETS.md`. Verify the icon on a home screen and the splash on launch on
**both** platforms with no white flash. The app runs on iOS + Android — point `EXPO_PUBLIC_API_URL`
at the API correctly per platform (localhost / `10.0.2.2` / LAN IP; see `TECH-STACK-SETUP §4c`).

## Commands
```
# infra
docker compose up -d                      # start local Postgres
# api (apps/api)
npx prisma migrate dev   |  npx prisma db seed  |  npx prisma studio  |  npm run start:dev
# mobile (apps/mobile)
npx expo start   |  npx tsc --noEmit  |  npx expo lint  |  npx expo-doctor
```
