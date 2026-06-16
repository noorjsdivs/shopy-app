# TECH-STACK-SETUP.md — Shopy

Toolchain, **monorepo + Docker + Prisma + NestJS** setup, and **NativeWind** install/config.

> **Versions here are a BASELINE captured 2026-06-16, not a lockfile.** Claude Code has web access
> and **must confirm the current latest stable versions** before installing. Critical pairings:
> **NativeWind v4 ↔ Tailwind CSS v3** (`tailwindcss@^3.4.x`), current **NestJS** + **Prisma** lines.
> Let `npx expo install` choose SDK-compatible versions for Expo packages.

## 0. Toolchain (verify first)
- **Node** ≥ 20.19 LTS · **npm** ≥ 10
- **Docker Desktop** (or Docker Engine + Compose v2) — for local PostgreSQL
- **Expo SDK** latest stable (baseline SDK 56 → RN 0.85, React 19.2, New Arch on)
- **NestJS** latest stable (baseline v11) · **Prisma** latest stable (baseline v6) · **PostgreSQL 16**
- Xcode 16+ / Android Studio for device builds; Expo Go works for the JS client.

## 1. Monorepo scaffold (in place at `shopy/`, alongside `_props/`)

```bash
# from shopy/ (contains only _props/)
# 1) root workspace
npm init -y                      # then edit package.json (see §1a)
# 2) apps
npx @nestjs/cli new apps/api --package-manager npm --skip-git
npx create-expo-app@latest apps/mobile --template default
mkdir -p packages/shared
cp _props/CLAUDE.md ./CLAUDE.md  # so Claude Code auto-reads it
```

### 1a. Root `package.json`
```jsonc
{
  "name": "shopy",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "db:up": "docker compose up -d",
    "db:down": "docker compose down",
    "api:dev": "npm run start:dev -w apps/api",
    "api:seed": "npm run prisma:seed -w apps/api",
    "mobile:dev": "npm run start -w apps/mobile"
  }
}
```
> If create-expo-app / nest refuse on a non-empty dir, scaffold into a temp folder and move the
> contents up. **Never touch `_props/`.**

## 2. Local database with Docker (`docker-compose.yml` at repo root)
```yaml
services:
  db:
    image: postgres:16
    container_name: shopy-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: shopy
      POSTGRES_PASSWORD: shopy
      POSTGRES_DB: shopy
    ports:
      - "5432:5432"
    volumes:
      - shopy_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U shopy -d shopy"]
      interval: 5s
      timeout: 5s
      retries: 10
volumes:
  shopy_pgdata:
```
Root `.env` (gitignored): `POSTGRES_USER/PASSWORD/DB` mirror the above.
**Later (production):** keep the Compose for local dev; in prod set `DATABASE_URL` to the hosted
Postgres (Neon/Supabase/RDS) — no schema or code change.

## 3. API — NestJS + Prisma (`apps/api`)

### 3a. Install
```bash
cd apps/api
npm i @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm i class-validator class-transformer
npm i -D prisma @types/passport-jwt @types/bcrypt
npm i @prisma/client
npx prisma init --datasource-provider postgresql
```

### 3b. `apps/api/.env` (gitignored)
```
DATABASE_URL="postgresql://shopy:shopy@localhost:5432/shopy?schema=public"
JWT_ACCESS_SECRET="dev-access-change-me"
JWT_REFRESH_SECRET="dev-refresh-change-me"
JWT_ACCESS_TTL="900s"
JWT_REFRESH_TTL="30d"
PORT=4000
CORS_ORIGIN="*"
```

### 3c. Prisma schema + migrate + seed
- Author `prisma/schema.prisma` per **`DATABASE-SCHEMA.md`**.
- `npx prisma migrate dev --name init` → creates tables + the typed client.
- Add to `apps/api/package.json`: `"prisma": { "seed": "ts-node prisma/seed.ts" }` and a script
  `"prisma:seed": "prisma db seed"`. Seed authors data from **`SEED-DATA.md`** (idempotent `upsert`).
- `PrismaService` extends `PrismaClient`, connects `onModuleInit`; `PrismaModule` is `@Global()`.

### 3d. Bootstrap (`main.ts`)
- Global `ValidationPipe({ whitelist: true, transform: true })`.
- Global exception filter → `{ statusCode, message, error }`.
- `app.enableCors({ origin: CORS_ORIGIN, credentials: true })`.
- Optional global prefix `/api`. Listen on `PORT` and `0.0.0.0` (so a device/emulator can reach it).

### 3e. Auth wiring
- `AuthModule`: `JwtModule` (access secret/TTL), `JwtStrategy` (validates access token → attaches
  `req.user`), `JwtAuthGuard`, `RolesGuard` reading `@Roles()` metadata, `@CurrentUser()` param
  decorator. Refresh tokens signed with the refresh secret; verified in `POST /auth/refresh`.
- `bcrypt.hash` on register; `bcrypt.compare` on login. Strip `passwordHash` from every response
  (Prisma `select`, or a class-transformer `@Exclude`).

## 4. Mobile — NativeWind + data layer (`apps/mobile`)

### 4a. Install
```bash
cd apps/mobile
npx expo install nativewind react-native-reanimated react-native-worklets \
  react-native-safe-area-context react-native-gesture-handler react-native-screens \
  expo-image expo-haptics @expo/vector-icons expo-font @expo-google-fonts/inter \
  expo-splash-screen expo-status-bar expo-secure-store expo-linear-gradient expo-blur \
  react-native-svg @gorhom/bottom-sheet
npm i -D tailwindcss@^3.4.17 prettier-plugin-tailwindcss sharp
npm i clsx tailwind-merge class-variance-authority zustand zod @tanstack/react-query axios date-fns
npm i @react-native-async-storage/async-storage
```
- `expo-linear-gradient` + `expo-blur` power the **glossy** surfaces (hero, glass cards).
- `react-native-svg` renders the in-app **`Logo`**; `sharp` generates icon/splash PNGs (BRANDING-ASSETS).
- `@gorhom/bottom-sheet` powers the **`AuthSheet`** modal and the `FilterSheet`.
- `expo-secure-store` holds JWT tokens; AsyncStorage persists cart (incl. guest cart) + prefs.

### 4b. NativeWind config (confirm against installed version)
- **`tailwind.config.js`:** `content: ['./app/**/*.{js,jsx,ts,tsx}','./src/**/*.{js,jsx,ts,tsx}']`,
  `presets: [require('nativewind/preset')]`, `darkMode: 'class'`, `theme.extend` = **DESIGN-SPEC §2**.
- **`global.css`:** `@tailwind base; @tailwind components; @tailwind utilities;` + `:root`/`.dark`
  CSS variables (DESIGN-SPEC §2). Imported once in `app/_layout.tsx`.
- **`babel.config.js`:**
  ```js
  module.exports = function (api) {
    api.cache(true);
    return { presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'] };
  };
  ```
- **`metro.config.js`:**
  ```js
  const { getDefaultConfig } = require('expo/metro-config');
  const { withNativeWind } = require('nativewind/metro');
  module.exports = withNativeWind(getDefaultConfig(__dirname), { input: './global.css' });
  ```
- **`nativewind-env.d.ts`:** `/// <reference types="nativewind/types" />`. `app.json`:
  `newArchEnabled:true`, `experiments.typedRoutes:true`, plugin `expo-secure-store`. `tsconfig`:
  extend `expo/tsconfig.base`, `strict`, `@/* → src/*`.

### 4c. API base URL (`apps/mobile/.env` / `app.config`)
- `EXPO_PUBLIC_API_URL` — e.g. `http://localhost:4000/api` (iOS sim), `http://10.0.2.2:4000/api`
  (Android emulator), or your LAN IP for a physical device. **Production:** set it to the deployed
  API URL — nothing else changes. `src/lib/env.ts` reads + validates it with zod.

### 4c-bis. Branding & icons (see `BRANDING-ASSETS.md`)
Author the master logo SVG, generate `icon.png` / adaptive-icon / `splash-icon.png` /
`notification-icon.png` / `favicon.png` with `sharp`, and wire them in `app.json` (icon, splash via
the **`expo-splash-screen` plugin** with a `dark` variant, Android `adaptiveIcon`, `bundleIdentifier`
/ `package` `com.shopy.app`, `userInterfaceStyle: "automatic"`, `edgeToEdgeEnabled: true`). Keep
`preventAutoHideAsync()` in `app/_layout.tsx` until fonts + session restore, then `hideAsync()`.

### 4d. Data layer
- `src/services/api/client.ts` — axios instance with `baseURL = EXPO_PUBLIC_API_URL`, request
  interceptor attaching `Bearer <access>` from SecureStore, response interceptor that on 401 calls
  `/auth/refresh` once, retries, else signs out.
- `src/services/api/*.ts` — typed functions per resource; **parse responses with zod** (schemas from
  `packages/shared`). TanStack Query hooks in `src/features/*` wrap them (`useHome`, `useStore`,
  `useDepartment`, `useProduct`, `useSearch`, `useOrders`, admin queries/mutations).
- `QueryClientProvider` + auth/cart/theme providers in `app/_layout.tsx`.

## 5. Shared contract (`packages/shared`)
Plain TS package exporting domain **types** + **zod schemas** (Money, Product, Store, Department,
Order, auth payloads, pagination `Meta`). Mobile imports these for response parsing; the API may
import the zod schemas for response shaping or reference the types. Keeps client ↔ server in sync.

## 6. Money + cart math
Money is integer minor units + `currency` everywhere (DB `Int`, DTOs, UI). Cart math lives in
`apps/mobile/src/lib/cart.ts` (subtotal, service + delivery fees, free-delivery threshold, tip,
total) — never floats. **The server recomputes line prices and totals at `POST /orders`** from the
DB; the client total is display-only and must reconcile.

## 7. Cross-platform (iOS + Android)
The app must run correctly on both — the user runs it on real devices/simulators.
- **Networking by platform:** iOS sim → `http://localhost:4000/api`; Android emulator →
  `http://10.0.2.2:4000/api`; physical device → `http://<your-LAN-IP>:4000/api` (the API listens on
  `0.0.0.0`). Resolve `EXPO_PUBLIC_API_URL` accordingly (a `Platform.select` default in `lib/env.ts`
  is handy).
- **Safe area + edge-to-edge** (Android) so the tab bar/headers never clip; `BlurView` falls back to
  a solid token on Android; `KeyboardAvoidingView` behavior set per-OS (DESIGN-SPEC §11).
- **Verify each phase on an iOS simulator AND an Android emulator, in light + dark**, before the
  checkpoint. `npx expo run:ios` / `npx expo run:android` (or Expo Go) for device testing.

## 8. Quality gates
**API:** `npx tsc --noEmit` + lint clean · `prisma migrate` applies on a fresh DB · `prisma db seed`
is idempotent · auth + role guards enforced · no secrets in code. **Mobile:** `npx tsc --noEmit` +
`expo lint` + `expo-doctor` clean · boots on **iOS and Android** · NativeWind renders + `dark:`
toggles · branded icon + light/dark splash with no white flash · guest cart persists · auth modal
gates checkout and **resumes the action** · login/refresh/role-gating work against the live API · no
`StyleSheet.create`/raw hex · every animation has a reduce-motion path.

## 9. Run order (local dev)
```bash
npm run db:up            # 1. Postgres in Docker
npm run -w apps/api prisma:migrate   # 2. (first run) create schema
npm run api:seed         # 3. seed stores/products/admin/customer
npm run api:dev          # 4. NestJS on :4000 (0.0.0.0)
npm run mobile:dev       # 5. Expo — press i (iOS) / a (Android); set EXPO_PUBLIC_API_URL per §7
```
