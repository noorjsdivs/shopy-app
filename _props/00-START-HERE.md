# Shopy — Full-Stack E-Commerce Build Kit (Expo · NativeWind · NestJS · Prisma)

A complete prompt + context package for building **Shopy**, a polished, **glossy** e-commerce
mobile app with a **real API backend**: **Expo + React Native (NativeWind / Tailwind)** on the
client, a **NestJS + Prisma + PostgreSQL** server, JWT authentication with roles, a **local
Dockerised database** with seeded product/store data, and an **in-app Admin Dashboard** that
unlocks when a user signs in with the `ADMIN` role.

Designed to be driven end-to-end by **Claude Code (Opus 4.8)**.

Toolchain baseline verified **2026-06-16**. Claude Code re-verifies the latest stable versions
on the web at build time.

---

## What this is (and how it differs from a mock-only app)

This is **not** a mock/local-only build. Shopy ships a genuine client-server architecture:

- **Database:** PostgreSQL, run locally via **Docker Compose**, managed with **Prisma ORM**.
  `DATABASE_URL` is an env var — point it at the local container now, swap in a **production URL**
  later with zero code changes.
- **Backend:** a **NestJS** REST API — modules for Auth, Users, Categories, Stores, Departments,
  Products, Cart, Orders, Payments (simulated), and Admin. Real JWT auth (access + refresh),
  `bcrypt` password hashing, role-based guards.
- **Auth + roles:** users register / log in through the API. Two roles — `CUSTOMER` and `ADMIN`.
  The mobile app stores tokens securely and gates screens by role.
- **Seeding:** a Prisma seed script loads realistic **stores, departments, products, deals** (the
  same shape of catalog data described in `SEED-DATA.md`) plus a default **admin** and **customer**
  account, so the whole app works the moment the DB is up.
- **Admin dashboard inside the app:** when an `ADMIN` signs in, an extra **Admin** area appears in
  the app (products CRUD, orders, stores, users, dashboard metrics) — same NativeWind design
  system, glossy styling.
- **Glossy storefront:** the home and product surfaces are designed to feel premium — soft
  gradients, glass cards, hero carousels, elevation, and snappy motion (see `DESIGN-SPEC.md`).
- **Browse freely, sign in only to check out:** a guest can do everything — browse, search, build a
  cart — without an account. Authentication is required **only at checkout** (and other write
  actions). A reusable **auth modal** (email + password, with a one-tap switch to sign-up) pops up
  in place, and the action the user was doing **resumes automatically** once they're signed in.
- **Branded & cross-platform:** a real Shopy logo, app icon, and a light/dark splash, built to run
  correctly on **both iOS and Android** (safe-area-aware tab bar, proper theming, platform insets).

---

## What's in this kit

| File | Purpose |
|------|---------|
| `00-START-HERE.md` | This overview |
| `MASTER-PROMPT.md` | The copy-paste kickoff prompt for Claude Code (paste as your first message) |
| `CLAUDE.md` | Persistent project rules + conventions (mobile + API + DB). **Copied to repo root.** |
| `TECH-STACK-SETUP.md` | Versions, monorepo layout, Docker, Prisma, NestJS, NativeWind install/config |
| `DATABASE-SCHEMA.md` | Prisma schema, entities/relations, migrations + seed strategy |
| `SEED-DATA.md` | The actual catalog (stores, departments, products, deals) + default accounts to seed |
| `API-SPEC.md` | Full REST contract: endpoints, DTOs, auth, roles, pagination, error shapes |
| `DESIGN-SPEC.md` | Design system (Tailwind theme), **glossy** home, auth modal, themed tab bar, screen specs |
| `BRANDING-ASSETS.md` | Logo, app icon, Android adaptive icon + light/dark splash, `app.json` wiring |
| `BUILD-PLAN.md` | The phased, checkpointed build plan you execute in order |

---

## How to use it (the workflow)

1. You have a folder named **`shopy/`** containing **only** this **`_props/`** subfolder (these 9
   files). Nothing else.
2. **Open Claude Code in `shopy/`.**
3. **Paste `_props/MASTER-PROMPT.md`** as your first message. It instructs Claude Code to read the
   kit, web-verify versions, and scaffold the monorepo **in place at the root of `shopy/`**,
   alongside `_props/`.
4. Claude Code copies `_props/CLAUDE.md` → `shopy/CLAUDE.md`, then executes `BUILD-PLAN.md` phase by
   phase, **pausing at each checkpoint** for your approval.
5. Phase order, briefly: **infra (Docker + Prisma + seed)** → **NestJS API + auth** → **mobile
   foundation (NativeWind + theme)** → **storefront** → **cart/checkout/orders** → **admin
   dashboard** → **polish + a11y**. The DB is real from Phase 1; every later phase runs against it.

Resulting layout (a small npm-workspaces monorepo):

```
shopy/
  _props/                 # this kit (read-only reference)
  CLAUDE.md               # copied up from _props/
  docker-compose.yml      # local PostgreSQL
  package.json            # npm workspaces root
  apps/
    api/                  # NestJS + Prisma server
    mobile/              # Expo + NativeWind app (storefront + admin)
  packages/
    shared/               # shared TS types/contracts (optional, recommended)
```

## The app, in one line

**Shopy** — a glossy e-commerce app: a premium home of categories, featured stores, hero deals and
product carousels; store + department browsing; search; rich product detail; a persistent cart;
real sign-up / sign-in; a simulated checkout that creates **real orders in PostgreSQL**; order
history with live status; and a **role-gated Admin Dashboard** for managing products, stores,
orders and users — all served by a **NestJS + Prisma** API over a **Dockerised local database**.

> **Version gotchas (verify at build time):** NativeWind **v4** pairs with **Tailwind CSS v3**
> (`tailwindcss@^3.4.x`) — not Tailwind v4. Use the current stable **NestJS** and **Prisma** lines.
> Let `npx expo install` choose SDK-compatible versions for Expo packages. All copy, branding,
> colors and seed data here are original.
