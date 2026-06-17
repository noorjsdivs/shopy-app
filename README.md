<div align="center">

# 🛒 Shopy

**A premium, glossy full-stack e-commerce app for iOS & Android.**

Expo (React Native) client · NestJS + Prisma + PostgreSQL API · JWT auth with roles · seeded catalog · in-app Admin Dashboard.

[![Expo](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## ✨ Overview

**Shopy** is a production-style e-commerce app with a real client–server backend — not a clickable mockup.
It's **guest-first**: browse, search, and build a cart with no account, and sign in only at checkout. Behind
the glossy UI sits a typed REST API with JWT auth (access + refresh), role-based access control, a Dockerised
PostgreSQL database with seeded catalog data, and an **Admin Dashboard built right into the mobile app**,
unlocked by the `ADMIN` role.

It targets **both iOS and Android** — every screen is verified on both (safe-area insets, Android edge-to-edge,
keyboard handling, blur/shadow fallbacks) and renders in **light & dark** themes.

## 📸 Screenshots

| Home (light) | Product | Store | Categories |
|:---:|:---:|:---:|:---:|
| ![Home](./screenshots/01-home-light.png) | ![Product](./screenshots/02-product.png) | ![Store](./screenshots/03-store.png) | ![Categories](./screenshots/04-categories.png) |

| Home (dark) | Product (dark) |
|:---:|:---:|
| ![Home dark](./screenshots/05-home-dark.png) | ![Product dark](./screenshots/06-product-dark.png) |

## 🚀 Features

- **🛒 Guest-first shopping** — browse, search & build a cart with no account; the cart persists across restarts (even as a guest).
- **🔐 Auth-anywhere gate** — a sign-in/sign-up bottom-sheet modal that **resumes your pending action** (e.g. proceed to checkout) after a successful login — no second tap, no lost context.
- **🏬 Stores & departments** — store views with department shelves, plus department listings with filters, sort & pagination.
- **🧾 Product detail** — rich detail screens with pricing, deal badges, nutrition facts & related items.
- **💳 Checkout** — address → payment (simulated) → review → place order, with **prices computed server-side** (never trusted from the client).
- **📦 Orders** — order history and order detail with status tracking.
- **🛠️ Admin Dashboard (role-gated)** — dashboard metrics, product & store CRUD, order management with status updates, and user listing — all inside the app, for `ADMIN` accounts only.
- **🎨 Glossy design system** — gradients, glass cards, elevation & hero motion (Reanimated), full light/dark theming via semantic tokens.
- **🌗 Cross-platform** — iOS + Android from day one; typed routes; accessible (roles, labels, 44×44 targets, reduce-motion paths).

## 🧰 Tech stack

| Layer | Stack |
|---|---|
| **Mobile** (`apps/mobile`) | Expo SDK 56 · React Native 0.85 · Expo Router (typed routes) · NativeWind v4 (Tailwind v3) · Reanimated · TanStack Query + axios + Zod · Zustand (cart/auth/theme) · expo-secure-store |
| **API** (`apps/api`) | NestJS 11 · Prisma 6 · PostgreSQL 16 · JWT access + refresh · bcrypt · RBAC (`CUSTOMER` / `ADMIN`) |
| **Shared** (`packages/shared`) | TypeScript types + Zod schemas mirroring the REST contract, imported by both apps |
| **Tooling** | npm workspaces monorepo · Docker (local Postgres) · TypeScript strict · ESLint + Prettier |

## 📁 Project layout

```
shopy/
├─ docker-compose.yml          # postgres:16 service (host port 5433)
├─ package.json                # npm workspaces: apps/*, packages/*
├─ _props/                     # planning docs & specs (design, DB, API, seed, branding)
├─ packages/
│  └─ shared/                  # shared TS types + Zod contract
└─ apps/
   ├─ api/                     # NestJS + Prisma
   │  ├─ prisma/{schema.prisma, seed.ts, migrations/}
   │  └─ src/{auth, users, categories, stores, products,
   │          home, orders, payments, admin, prisma, common}
   └─ mobile/                  # Expo + NativeWind
      ├─ app/                  # expo-router routes: (tabs), (auth), admin,
      │                        #   product, store, checkout, order
      ├─ src/{components, features, services, store, lib, providers}
      └─ assets/brand/         # master brandmark; scripts/gen-icons.mjs renders icon/splash
```

## 📋 Prerequisites

- **Node** ≥ 20.19 and **npm** ≥ 10
- **Docker Desktop** (for the local PostgreSQL container)
- **Xcode** (iOS simulator) and/or **Android Studio** (Android emulator) — or **Expo Go** on a physical device

## ⚡ Quick start

```bash
# 1. Clone & install everything from the repo root
git clone https://github.com/noorjsdivs/shopy-app.git
cd shopy-app
npm install

# 2. Create env files from the examples
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env   # optional (only needed for a physical device)

# 3. Start PostgreSQL (Docker). Host port is 5433 to avoid clashing with a local Postgres.
npm run db:up

# 4. First run only: apply the database schema (runs the committed migrations)
npm run -w apps/api prisma:migrate

# 5. Seed the catalog + demo accounts + demo orders (idempotent — safe to re-run)
npm run api:seed

# 6. Start the API → http://localhost:4000/api (binds 0.0.0.0 so devices can reach it)
npm run api:dev

# 7. In a second terminal, start the mobile app
npm run mobile:dev                            # press i for iOS, a for Android
```

> The mobile app auto-selects the API URL per platform (`apps/mobile/src/lib/env.ts`):
> **iOS simulator → `localhost`**, **Android emulator → `10.0.2.2`**. For a **physical device**, set your LAN IP
> in `apps/mobile/.env` (see [Environment variables](#-environment-variables)).

## 👤 Demo accounts

Seeded by `npm run api:seed`. **Demo only — change before any real deployment.**

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@shopy.dev` | `admin1234` |
| **Customer** | `customer@shopy.dev` | `shop1234` |

Sign in as the admin, then open **Account → Admin Dashboard** to reveal the role-gated admin area.

## 🔧 Environment variables

**`apps/api/.env`** (copy from `apps/api/.env.example`):

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://shopy:shopy@localhost:5433/shopy?schema=public` | Postgres connection string (port 5433 matches Docker) |
| `JWT_ACCESS_SECRET` | `change-me-access` | Secret for short-lived access tokens — **rotate for production** |
| `JWT_REFRESH_SECRET` | `change-me-refresh` | Secret for long-lived refresh tokens — **rotate for production** |
| `JWT_ACCESS_TTL` | `900s` | Access-token lifetime |
| `JWT_REFRESH_TTL` | `30d` | Refresh-token lifetime |
| `PORT` | `4000` | API port |
| `CORS_ORIGIN` | `*` | Allowed origin(s) for the Expo dev client |

**`apps/mobile/.env`** (copy from `apps/mobile/.env.example`):

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | API base URL. Leave unset for the per-platform default; for a physical device set e.g. `http://192.168.1.50:4000/api` |

**Docker / Postgres** (optional overrides, consumed by `docker-compose.yml`): `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DB_PORT` (defaults: `shopy` / `shopy` / `shopy` / `5433`).

> 🔒 `.env` files are gitignored — never commit them. Payments are **simulated** and never collect real card data.

## 🌐 API surface

Base URL: `http://localhost:4000/api`. List endpoints return `{ data, meta: { total, page, pageSize } }`; errors return `{ statusCode, message, error }`.

```
Auth      POST /auth/register · /auth/login · /auth/refresh        GET /auth/me
Catalog   GET  /categories
          GET  /stores[?category]
          GET  /stores/:slug                        (departments + shelves)
          GET  /stores/:slug/departments/:deptSlug  (filters, sort, pagination)
          GET  /products[?search=&storeId=]         GET /products/:id
          GET  /home                                (curated feed)
Orders    POST /orders (auth)   GET /orders (own)    GET /orders/:id
Payments  POST /payments/authorize                  (simulated success / decline)
Admin     GET  /admin/metrics
          CRUD /admin/products · /admin/stores
          GET  /admin/orders    PATCH /admin/orders/:id/status
          GET  /admin/users
```

Protected routes use `JwtAuthGuard`; admin routes add `RolesGuard` + `@Roles(Role.ADMIN)`. The mobile client stores tokens in `expo-secure-store` and refreshes on `401`.

## 🗄️ Data model

PostgreSQL via Prisma (`apps/api/prisma/schema.prisma`). Money is stored as **integer minor units** (cents) + `currency` — never floats. Core models:

`User` · `Address` · `Category` · `Store` · `Department` · `Product` · `CartItem` · `Order` · `OrderLine` · `OrderStatusEvent`

Browse the data live with `npm run api:studio` (Prisma Studio).

## 🛠️ Useful scripts

```bash
# Infrastructure
npm run db:up | db:down            # start / stop the Postgres container
npm run db:logs                    # tail Postgres logs

# API (apps/api)
npm run api:dev                    # NestJS in watch mode
npm run api:seed                   # re-seed (idempotent)
npm run api:studio                 # Prisma Studio (browse the DB)
npm run api:migrate                # prisma migrate dev

# Mobile (apps/mobile)
npm run mobile:dev                 # Expo dev server

# Quality gates
npm run -w apps/api build                                  # API typecheck / build
npm run -w packages/shared typecheck                       # shared contract typecheck
cd apps/mobile && npx tsc --noEmit && npx expo lint && npx expo-doctor
```

## 🎨 Branding

App icon, Android adaptive icon, and the light/dark splash are generated from the master brandmark via
`node apps/mobile/scripts/gen-icons.mjs` (re-runnable). The in-app `Logo` is a theme-aware SVG. The YouTube/marketing
thumbnail is generated by `node scripts/gen-thumbnail.mjs` (requires `sharp`).

## 🚢 Going to production

- Point `DATABASE_URL` at a hosted Postgres and run `npm run -w apps/api prisma:deploy` (`prisma migrate deploy`).
- Set `EXPO_PUBLIC_API_URL` to your deployed API URL.
- **Rotate** `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` and **change the seeded demo passwords**.
- Swap simulated payments (`apps/api/src/payments`) for a real provider — no screen or schema changes needed, since the app only talks to the API and the API only talks to Prisma.

## 🩺 Troubleshooting

- **Port 5432 already in use** — Shopy uses host port **5433** by default; change `DB_PORT` in your shell/env if 5433 is also taken (and update `DATABASE_URL` to match).
- **Android emulator can't reach the API** — it must use `10.0.2.2`, not `localhost`. The default resolver handles this; only override `EXPO_PUBLIC_API_URL` if needed.
- **Physical device can't reach the API** — set `EXPO_PUBLIC_API_URL` to your computer's LAN IP and make sure both devices are on the same network.
- **Prisma client errors after schema changes** — run `npm run -w apps/api prisma:generate`, then re-migrate.
- **Reset the database** — `npm run -w apps/api prisma:reset` (drops, re-migrates, and re-seeds).

## 🤝 Contributing

Issues and pull requests are welcome. Please keep the project's conventions: TypeScript strict (no `any`),
NativeWind `className` (no `StyleSheet.create` / raw hex), DTO-validated API inputs, and a clean
`tsc` / lint run before opening a PR.

## 📄 License

Released under the **MIT License**. _(Add a `LICENSE` file before publishing if one isn't present.)_

## 🙏 Acknowledgements

Built with [Claude Code](https://claude.com/claude-code). More free full-stack projects, setup docs &
prompts at [reactbd.com](https://www.reactbd.com).

<div align="center">

**If Shopy helped you, please ⭐ the repo!**

</div>
