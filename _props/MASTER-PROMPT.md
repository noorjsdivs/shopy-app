# Master Prompt — paste this into Claude Code (Opus 4.8) as your first message

---

You are building **Shopy**, a production-quality, **glossy** e-commerce app with a **real backend**:
an **Expo + React Native (NativeWind / Tailwind)** mobile app, a **NestJS + Prisma + PostgreSQL** API,
JWT authentication with roles, a **local Dockerised database** with seeded catalog data, and an
**in-app Admin Dashboard** unlocked by the `ADMIN` role. Use the **latest stable versions**.

**Where you are:** you're starting in the **`shopy/`** root, which currently contains **only** a
**`_props/`** folder (this kit). Build the whole monorepo **in place at the root of `shopy/`,
alongside `_props/`** — not nested, not elsewhere. **Never delete or overwrite `_props/`.**

Read these files before writing any code and treat them as the source of truth:

- `_props/CLAUDE.md` — project rules + conventions (mobile + API + DB guardrails)
- `_props/TECH-STACK-SETUP.md` — versions, monorepo, Docker, Prisma, NestJS, NativeWind setup
- `_props/DATABASE-SCHEMA.md` — the Prisma schema + migration/seed strategy
- `_props/SEED-DATA.md` — the catalog (stores, departments, products) + default accounts to seed
- `_props/API-SPEC.md` — the full REST contract (endpoints, DTOs, auth, roles, errors)
- `_props/DESIGN-SPEC.md` — the design system (Tailwind theme) + **glossy** screens + auth modal +
  themed tab bar + admin screens
- `_props/BRANDING-ASSETS.md` — logo, app icon, Android adaptive icon, light/dark splash, `app.json`
- `_props/BUILD-PLAN.md` — the phased plan you will execute

## What you're building (architecture)

A small **npm-workspaces monorepo**:
```
shopy/
  _props/  CLAUDE.md  docker-compose.yml  package.json
  apps/api/      # NestJS + Prisma (auth, catalog, orders, payments, admin)
  apps/mobile/   # Expo + NativeWind (storefront + role-gated admin dashboard)
  packages/shared/  # shared TS types + zod schemas (the API contract)
```
- **DB:** PostgreSQL in Docker; Prisma ORM; `DATABASE_URL` env (local now, production URL later).
- **API:** real JWT auth (access + refresh, `bcrypt`), `CUSTOMER`/`ADMIN` roles, validated DTOs,
  server-computed prices, simulated payments. Seeded so everything works immediately.
- **Mobile:** NativeWind design system, TanStack Query + axios to the API, SecureStore tokens,
  Zustand cart/session. A **glossy** storefront and an **Admin Dashboard** gated by the `ADMIN` role.

## Use your web access — required

Versions in `_props/TECH-STACK-SETUP.md` are a **baseline from 2026-06-16** and may be stale. Before
installing you MUST look up current stable releases for: Expo SDK / RN / Expo Router / Reanimated,
**NativeWind** (and confirm **NativeWind v4 → Tailwind v3**, `tailwindcss@^3.4.x` — not Tailwind v4),
**NestJS**, and **Prisma**. Prefer `npx expo install` for Expo packages.

## How I want you to work

1. **Confirm the environment first.** Verify Node/npm/**Docker**, fetch current stable versions, and
   present a `package | baseline | latest found | will install` table. Wait for my confirmation.
2. **Follow `_props/BUILD-PLAN.md` phase by phase.** STOP at each checkpoint, summarize, give the
   run/verify command, and wait for "approved". Order: monorepo+Docker → DB+seed → API auth+catalog →
   API orders+payments+admin → mobile foundation+auth → storefront → cart/checkout/orders → admin
   dashboard → polish.
3. **Everything runs on real seeded data from Phase 1.** No `// TODO` screens; the catalog,
   accounts, and demo orders come from the Prisma seed.
4. **Match `_props/DESIGN-SPEC.md` exactly**, and make the **home screen genuinely glossy** —
   gradient hero carousel, glass cards, elevated product cards, snappy motion (DESIGN-SPEC §3, §6.4).
5. **Build the layers in order and finish each properly** before moving up — the API + data/admin
   layer especially must be solid (auth, validated DTOs, server-computed prices, admin CRUD) before
   the screens that depend on them. A feature is done only when its endpoint, validation, data hook,
   and loading/empty/error states all work end-to-end against the live server.
6. **Verify on both iOS and Android, light + dark, every phase** — the user runs the app on real
   devices. Branded app icon + light/dark splash with no white flash; safe-area-aware themed tab bar.
7. **Guest-first; auth only at checkout.** A guest browses, searches, and builds a cart with no
   account. Authentication is required **only to place an order** (and order history/account). Build
   the full sign-in/sign-up screens **and** the reusable **`AuthSheet` modal** with
   `useAuthGate().requireAuth(action)` so the gate can pop up anywhere (checkout, orders) and
   **automatically resume** the pending action once the user signs in or registers. Make registration
   quick and easy (email + password).

## Non-negotiables

- **Mobile styling:** `className` only (no `StyleSheet.create` except Reanimated styles); tokens in
  `tailwind.config.js`; semantic classes (`bg-bg`, `text-fg`, `bg-primary text-onPrimary`,
  `text-deal`); **no raw hex / magic numbers**; `dark:` theming via `useColorScheme()`; `cn()` + `cva`.
  Gloss via approved tokens + `expo-linear-gradient`/`expo-blur`.
- **Data:** mobile talks to the API only through `src/services/api` (axios + zod) via TanStack Query.
  Tokens in `expo-secure-store`; cart in Zustand+persist.
- **API:** Prisma only; global `ValidationPipe`; **prices computed server-side at order time** (never
  trust client money, all integer minor units); JWT access+refresh; `RolesGuard` + `@Roles(ADMIN)` on
  `/admin/*`; never return `passwordHash`; config/secrets via env; idempotent seed; CORS for Expo.
- **Auth + roles end-to-end:** register/login/refresh; the **`AuthSheet` gate resumes the pending
  action**; admin login reveals the in-app Admin Dashboard; a customer cannot reach `(admin)` routes.
- **Branding + cross-platform:** real logo, app icon, Android adaptive icon, light/dark splash
  (`BRANDING-ASSETS.md`); runs correctly on **iOS and Android** with a safe-area-aware, themed tab bar.
- **Typed routes only** (`expo-router`; never `@react-navigation/*`). Accessibility: labels (incl.
  price/unit/deal), 44×44, AA contrast, reduce-motion.

## What NOT to do
- Don't collect or transmit real card/payment data — payments are **simulated**.
- Don't put secrets in code; don't commit `.env` files.
- Don't fall back to `StyleSheet.create`; don't pair Tailwind v4 with NativeWind v4.
- Don't bypass Prisma with ad-hoc SQL; don't trust client-sent prices.
- Don't nest the app inside `_props/` or build outside `shopy/`.
- Don't force login to browse or build a cart — Shopy is **guest-first**; gate only checkout/orders.
- Don't ship a layout verified on only one platform — check iOS **and** Android.
- Don't trust a version number in this kit blindly — confirm it on the web first.

Start by reading the eight `_props/` files, running your web version check (NativeWind+Tailwind,
NestJS, Prisma), confirming Docker is available, and presenting the environment + version table.
Then wait for my go-ahead before Phase 0.
