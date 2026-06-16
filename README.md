# Shopy

A premium, glossy e-commerce app with a real backend — **Expo + React Native (NativeWind)** mobile
client, a **NestJS + Prisma + PostgreSQL** API, JWT auth with roles, a Dockerised local database with
seeded catalog data, and an in-app **Admin Dashboard** unlocked by the `ADMIN` role.

Guest-first: browse, search, and build a cart with no account — sign in only to check out.

## Stack

- **Mobile** (`apps/mobile`): Expo SDK 56 · Expo Router (typed routes) · NativeWind v4 (Tailwind v3) ·
  Reanimated · TanStack Query + axios + zod · Zustand (cart/auth/theme) · expo-secure-store.
- **API** (`apps/api`): NestJS 11 · Prisma 6 · PostgreSQL 16 · JWT access+refresh · bcrypt · RBAC.
- **Shared** (`packages/shared`): TypeScript types + zod schemas mirroring the REST contract.
- npm workspaces monorepo.

## Prerequisites

Node ≥ 20.19, npm ≥ 10, Docker Desktop, and Xcode (iOS) / Android Studio (Android) or Expo Go.

## Run it locally

```bash
# 1. Install everything (from the repo root)
npm install

# 2. Start PostgreSQL (Docker). Host port is 5433 to avoid clashing with a local Postgres.
npm run db:up

# 3. First time only: create the schema
npm run -w apps/api prisma:migrate     # (name it "init" if prompted)

# 4. Seed the catalog + demo accounts + demo orders (idempotent — safe to re-run)
npm run api:seed

# 5. Start the API (http://localhost:4000/api, listens on 0.0.0.0)
npm run api:dev

# 6. In another terminal, start the app
npm run mobile:dev      # press i for iOS, a for Android
```

The mobile app picks the API URL per platform automatically (`apps/mobile/src/lib/env.ts`):
iOS simulator → `localhost`, Android emulator → `10.0.2.2`. For a **physical device**, set your LAN IP
in `apps/mobile/.env`:

```
EXPO_PUBLIC_API_URL="http://<your-LAN-IP>:4000/api"
```

## Demo accounts (seeded — demo only, change for production)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@shopy.dev` | `admin1234` |
| Customer | `customer@shopy.dev` | `shop1234` |

Sign in as the admin to reveal the **Admin Dashboard** (Account → Admin Dashboard).

## Useful scripts

```bash
npm run db:up | db:down            # Postgres container
npm run api:dev                    # NestJS (watch)
npm run api:seed                   # re-seed (idempotent)
npm run api:studio                 # Prisma Studio (browse the DB)
npm run mobile:dev                 # Expo dev server

# quality gates
npm run -w apps/api build          # API typecheck/build
npm run -w packages/shared typecheck
cd apps/mobile && npx tsc --noEmit && npx expo lint && npx expo-doctor
```

## Project layout

```
shopy/
  docker-compose.yml          # postgres:16 (host port 5433)
  packages/shared/            # types + zod contract
  apps/
    api/                      # NestJS + Prisma
      prisma/{schema.prisma,seed.ts,migrations/}
      src/{auth,users,categories,stores,products,home,orders,payments,admin,prisma,common}
    mobile/                   # Expo + NativeWind
      app/                    # routes (expo-router): (tabs), (auth), admin, product, store, checkout, order
      src/{components,features,services,store,lib,providers}
      assets/brand/           # master logo SVG; scripts/gen-icons.mjs renders icon/splash/adaptive
```

## Branding

App icon, Android adaptive icon, and light/dark splash are generated from the master brandmark via
`node apps/mobile/scripts/gen-icons.mjs` (re-runnable). The in-app `Logo` is a theme-aware SVG.

## Going to production

- Point `DATABASE_URL` at a hosted Postgres and run `prisma migrate deploy`.
- Set `EXPO_PUBLIC_API_URL` to the deployed API.
- Rotate `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` and change the seeded demo passwords.
- Payments are simulated (`apps/api/src/payments`) — swap in a real provider with no screen/schema
  changes, since the app only talks to the API and the API only talks to Prisma.

> Secrets live in env files (`.env`, gitignored). Never commit them. Payments never collect real card data.
