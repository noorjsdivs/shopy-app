# DESIGN-SPEC.md — Shopy (e-commerce · NativeWind · glossy)

The design system **is the Tailwind theme** — components use semantic utility classes. Shopy should
feel **premium and glossy**: soft gradients, frosted-glass cards, gentle elevation, large rounded
corners, vivid product imagery, and snappy, tasteful motion. Original tokens, copy, branding.

## 1. Design language

- **Glossy & premium.** A clean canvas lifted by **subtle gradients** (brand → brand-tint), **glass**
  surfaces (`expo-blur`) over imagery, soft shadows, and 16–28px radii. Feels like a flagship retail
  app, not a utility.
- **Product-forward.** Big, crisp photography on cards and a hero carousel; price + "add" are always
  obvious. Density stays scannable via generous spacing.
- **Confident accent.** A single vibrant **primary** (indigo/violet family) for CTAs, active states,
  and the add button; a warm **deal** color for sale prices; everything else calm and neutral.
- **Trust signals.** Ratings, "X bought recently", deal badges, ETAs.
- **Snappy motion.** Add-to-cart fly + badge bump, hero auto-scroll, progress fills, press scale,
  shimmer skeletons. Always honor reduce-motion.

## 2. The Tailwind theme (`tailwind.config.js` → `theme.extend`) + CSS vars

```js
// tailwind.config.js (excerpt) — confirm syntax against the installed NativeWind version
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:         'rgb(var(--bg) / <alpha-value>)',
        surface:    'rgb(var(--surface) / <alpha-value>)',     // cards, sheets
        surfaceAlt: 'rgb(var(--surface-alt) / <alpha-value>)', // subtle raised / glass base
        fg:         'rgb(var(--fg) / <alpha-value>)',
        muted:      'rgb(var(--muted) / <alpha-value>)',
        faint:      'rgb(var(--faint) / <alpha-value>)',
        line:       'rgb(var(--line) / <alpha-value>)',
        primary:     'rgb(var(--primary) / <alpha-value>)',     // CTAs, add, active
        primarySoft: 'rgb(var(--primary-soft) / <alpha-value>)',
        primaryTint: 'rgb(var(--primary-tint) / <alpha-value>)',// gradient end / hero
        deal:       'rgb(var(--deal) / <alpha-value>)',         // sale price
        success:    'rgb(var(--success) / <alpha-value>)',
        warning:    'rgb(var(--warning) / <alpha-value>)',
        onPrimary:  'rgb(var(--on-primary) / <alpha-value>)',   // text on primary
      },
      fontFamily: { sans: ['Inter'] },
      borderRadius: { card: '16px', xl: '20px', '2xl': '28px', '3xl': '32px', pill: '9999px' },
      fontSize: { meta:['12px','16px'], body:['14px','20px'], title:['16px','22px'],
        price:['15px','20px'], h:['20px','26px'], display:['28px','34px'], hero:['34px','40px'] },
      boxShadow: { glow: '0 10px 30px rgba(0,0,0,0.12)' }, // map to elevation on native
    },
  },
  plugins: [],
};
```

### CSS variables (`global.css`)
```css
@tailwind base; @tailwind components; @tailwind utilities;
:root {
  --bg: 248 249 252; --surface: 255 255 255; --surface-alt: 244 245 250;
  --fg: 18 20 28; --muted: 104 110 124; --faint: 156 162 178; --line: 228 230 238;
  --primary: 99 78 240; --primary-soft: 234 231 254; --primary-tint: 138 116 255;
  --deal: 224 60 80; --success: 22 163 96; --warning: 224 150 40; --on-primary: 255 255 255;
}
.dark {
  --bg: 10 11 16; --surface: 22 24 33; --surface-alt: 28 31 42;
  --fg: 240 242 248; --muted: 160 166 182; --faint: 108 114 130; --line: 38 41 54;
  --primary: 140 122 255; --primary-soft: 36 34 64; --primary-tint: 168 150 255;
  --deal: 255 110 130; --success: 52 199 130; --warning: 240 170 70; --on-primary: 16 17 24;
}
```
Components use `bg-bg`, `text-fg`, `bg-primary text-onPrimary`, `text-deal`, `bg-surface`, etc.;
`dark:` swaps automatically. **Gloss = gradients + blur over these tokens, never raw hex.**

## 3. Gloss recipes (reusable)
- **Hero gradient:** `expo-linear-gradient` from `primary` → `primaryTint` (diagonal), white text,
  soft inner highlight; product cutout or banner image floated on top, `rounded-3xl`, `shadow-glow`.
- **Glass card:** `expo-blur` (`intensity` ~40, tint follows scheme) inside a `rounded-2xl`
  `border border-line/60` container over imagery; content in `text-fg`. Use for the home address
  pill, category tiles over photos, and the cart summary bar.
- **Elevated product card:** `bg-surface rounded-card` + `shadow-glow` (native elevation), square
  `expo-image` with blurhash, gradient scrim under the price/add row.
- Wrap `LinearGradient`/`BlurView` with `cssInterop` once in `src/components` so they accept
  `className`.

## 4. Typography & spacing
Font **Inter** (`@expo-google-fonts/inter`); prices tabular. Screen padding `px-4`. Product cards
~150–170px wide in shelves, square images. Radii: cards `rounded-card`, sheets/hero `rounded-2xl`/
`rounded-3xl`, add "+" and CTAs `rounded-full`/`rounded-pill`. Min hit target 44×44.

## 5. Core components (`src/components`) — styled with `className`
- **`GradientHero`** — full-bleed gradient banner/carousel (auto-scroll), title + subtitle + CTA.
- **`GlassCard`** — blur + border wrapper used for pills, overlays, summary bars.
- **`CategoryTile`** — rounded image/illustration tile + label (glass label over photo).
- **`StoreCard`** — logo chip (brandColor), name, rating, ETA · delivery fee, deal badge.
- **`ProductCard`** — square `expo-image`, round **`AddButton`** ("+") that morphs into **`QtyStepper`**
  once added; price (+ struck-through `compareAt` in `text-faint` next to `text-deal`), name,
  size/brand, "X bought recently". `byWeight` → "approx / lb".
- **`QtyStepper`** — − / count / +, trash at count 1; weight items step by unit.
- **`DeptTabs`** — sticky horizontal department tabs w/ scroll-spy (animated active pill).
- **`PriceTag`** — formats minor units + currency; deal variant with strike-through.
- **`CartBar`** — sticky glass bottom bar: item count + subtotal + **free-delivery progress meter**
  ("Spend $10 more for free delivery") + "View cart".
- **`CartLineItem`** — thumb, name, size, `QtyStepper`, line price, replacement picker, swipe-remove.
- **`Logo`** — the Shopy brandmark as `react-native-svg` (theme-aware: white on gradient, or `text-fg`
  on plain surfaces). Used on auth, headers, empty states. Source artwork in `BRANDING-ASSETS.md`.
- **`AuthSheet`** — the reusable **sign-in / sign-up modal** (`@gorhom/bottom-sheet`). Email +
  password fields (zod-validated, inline errors), primary **"Sign in"**, a link/segment to switch to
  **"Create account"** in the same sheet, loading + error states, "demo login" hint in dev. Calls
  `/auth/login` · `/auth/register`, stores tokens in SecureStore, then **resolves the pending action**.
  Opened from anywhere via `useAuthGate().requireAuth(action)` (see §6.3).
- **`RatingStars`**, **`Badge`/`Chip`**, **`SearchBar`**, **`SectionHeader` + "See all"**,
  **`FilterSheet`** (`@gorhom/bottom-sheet`), **`Button`** (cva), **`TabBar`** (animated, themed,
  safe-area-aware, cart badge — see §8), **`Skeleton`** (shimmer), **`EmptyState`**,
  **`Stepper`** (checkout), **`OrderTimeline`**.
- **Admin:** **`MetricCard`** (glossy stat), **`MiniBarChart`**, **`DataRow`/`AdminListRow`**,
  **`StatusPill`**, **`FormField`** (labeled input + zod error), **`ImageUrlField`**.

## 6. Storefront screens

### 6.1 Splash → 6.2 Welcome `(auth)/welcome`
Branded gradient splash + `Logo` (light/dark, see `BRANDING-ASSETS.md`). Value props ("Everything you
love, delivered"), **Create account** / **Sign in** / **Continue browsing**. Default CTA is
**Continue browsing** — Shopy is **guest-first**: you can do everything except check out without an
account.

### 6.3 Auth — full screens + reusable modal (the auth-anywhere gate)
- **Full screens `(auth)/sign-in` · `(auth)/sign-up`:** zod-validated email + password forms →
  `POST /auth/login|register` → tokens to SecureStore → route Home. Each links to the other. Inline
  errors (bad creds, email taken). A "Create account" path that's **easy and fast** (email, password,
  optional name — no long forms).
- **`AuthSheet` modal (the important part):** the **same** email/password sign-in/sign-up, presented
  as a bottom sheet so the user never loses their place. It is triggered by **`useAuthGate()` →
  `requireAuth(action)`**: a guest taps "Place order" (or any gated action) → the sheet slides up →
  they sign in or create an account right there → **the original action runs automatically** (the
  order is placed, the page they wanted opens). Works identically from **checkout, order history,
  and account**. On success it dismisses and resolves; on cancel the user stays exactly where they were.
- **Guest rule:** browsing, search, product/store views, and the **whole cart** need no account. Only
  **placing an order**, **order history/detail**, and **account-bound actions** invoke the gate.

### 6.4 Home `(tabs)/index` — **the glossy centerpiece**
Top: glass **address/location pill** ("Deliver to ▾") + account avatar + cart icon (badge).
`SearchBar`. Then, in order:
1. **`GradientHero`** carousel — auto-scrolling promo banners (`heroBanners`), big rounded, glossy.
2. **Category rail** — `CategoryTile`s (glass labels over imagery).
3. **Promo cards** — credits/deals (`promos`, tone-colored gradients).
4. **Featured stores** — `StoreCard`s ("Stores near you", "Popular", "Deals").
5. **Product carousels** — "Deals you'll love", "Popular right now", "Fresh picks" (horizontal
   `ProductCard` shelves with quick-add).
Pull-to-refresh; shimmer skeletons; subtle parallax on the hero. Tap store → store view; tap product
→ detail.

### 6.5 Store view `store/[slug]`
Glossy store header (logo, rating, ETA, fee, gradient backdrop), in-store search, sticky `DeptTabs`
(scroll-spy), **department shelves** of `ProductCard`s with quick-add, sticky `CartBar`.

### 6.6 Department `store/[slug]/dept/[deptSlug]`
Full product grid + `FilterSheet` (sort; dietary tags, brand, max price, on-deal) + infinite scroll
(`page`/`meta`).

### 6.7 Search `(tabs)/search`
Products + stores; recent + suggestions; results grid with quick-add (`GET /products?search=`).

### 6.8 Product detail `product/[id]`
Large image (gradient scrim), name, brand, size, `PriceTag` (+ deal), `QtyStepper` → add, rating +
"bought recently", details/nutrition accordion, "Related" + "Often bought with" shelves.

### 6.9 Categories `(tabs)/categories`
Browse all categories → stores in a category.

### 6.10 Cart `(tabs)/cart`
Grouped by store; `CartLineItem`s; promo code; glossy summary (subtotal, service fee, delivery or
free, tip preview, total) + free-delivery meter; **Go to checkout**. The cart itself needs **no
account** — a guest fills it freely. "Go to checkout" calls `requireAuth(goToCheckout)`: signed-in
users go straight through; guests get the `AuthSheet` and land in checkout the moment they're in.
Empty state → "Start shopping".

### 6.11 Checkout `checkout`
`Stepper`: **Address** (saved/seed) → **Tip** (presets) → **Payment** (clearly **demo** — never real
card data) → **Review** → **Place order**. **Place order** runs through `requireAuth(placeOrder)`, so
if a guest reached here (e.g. deep link) the `AuthSheet` resolves first, then `POST /orders` fires
(server prices + simulated payment) → animated success → order detail. A guest's local cart carries
into the order untouched. Handle a simulated decline gracefully.

### 6.12 Order detail `order/[id]` + history `orders`
`OrderTimeline` (status events from the API), line items, totals, store, ETA, "Buy it again".
History lists past orders (reorder).

### 6.13 Account `(tabs)/account`
Profile (`GET /auth/me`), addresses, payment methods (mock), appearance (system/light/dark),
notifications, **"Admin Dashboard" entry — visible only when `role === 'ADMIN'`**, sign out.

## 7. Admin Dashboard `(admin)/*` — role-gated, same glossy system
A non-admin who reaches this group is redirected. Entered from Account (or auto-routed on admin login).

- **`(admin)/index` — Dashboard:** glossy `MetricCard`s (revenue, orders, products, stores,
  customers), a `MiniBarChart` (revenue by day), orders-by-status pills, recent orders list
  (`GET /admin/metrics`).
- **`(admin)/products` — list** (search, filter by store, paginated; `AdminListRow` with image,
  name, price, store, active toggle). **`/products/new`** + **`/products/[id]`** — create/edit form
  (`FormField`s, zod, image URL, department picker, deal price, tags, active) → `POST/PATCH
  /admin/products`. Delete = soft (`isActive=false`).
- **`(admin)/orders` — list** (filter by status/store) + **`/orders/[id]`** — detail with a
  **status changer** (`PATCH /admin/orders/:id/status`) that appends a timeline event.
- **`(admin)/stores` — list + edit** (`CRUD /admin/stores`).
- **`(admin)/users` — list** (search) with role change (`PATCH /admin/users/:id/role`; block
  demoting the last admin).
All admin lists have loading/empty/error states and optimistic-ish UX via TanStack Query
invalidation.

## 8. Bottom tab bar (alignment + theming + cross-platform)
5 evenly-spaced slots: **Home**, **Search**, **Categories**, **Cart** (live badge), **Account**.
- **Alignment:** each tab is a flex item of equal width; icon + label vertically centered with
  consistent gap; the active indicator (pill/underline) is centered under its icon. Touch targets
  ≥ 44×44. Build a custom `TabBar` (Expo Router `tabBar` prop) so the layout is exact — don't rely on
  default insets.
- **Safe area:** the bar adds the **bottom safe-area inset** (`react-native-safe-area-context`) as
  padding so it clears the iOS home indicator and Android gesture bar; with Android **edge-to-edge**
  on, content scrolls under and the bar floats correctly. Never hard-code a height.
- **Theming:** background `bg-surface` (or a `GlassCard`/blur over content), top hairline
  `border-line`; **active `text-primary`, inactive `text-muted`** — all tokens, so it **re-themes
  instantly on light↔dark** with no relayout. Verify in both themes on **both iOS and Android**.
- **Cart badge:** live item count (sums the cart), `bg-primary text-onPrimary` pill, animates on add.
- Admin is **not** a tab — it's a gated route reached from Account, so the customer UI stays clean.

## 9. Motion (Reanimated v4) — honor `useReducedMotion()`
- **Add to cart:** image/"+" flies to the cart tab; badge + `CartBar` bump; "+" morphs to stepper.
- **Hero:** gentle auto-scroll + parallax; dots animate.
- **Free-delivery meter:** width animates with subtotal; celebrates at 100%.
- **Dept tabs:** scroll-spy pill slides; tap smooth-scrolls to the shelf.
- **Order timeline:** fills as status advances; new events fade in.
- **Filter sheet:** spring open; grid animates on apply.
- **Press:** global scale 0.97. Skeletons shimmer. Reduced-motion → final state, no transform.

## 10. Accessibility
Labeled cards/buttons (e.g. "Organic strawberries, 1 lb, $5.99, was $7.99, add to cart"). Don't rely
on color alone for deals/selected (label + strike-through + icon). Announce cart + order-status
changes. AA contrast both themes (tokens tuned for it). Honor Dynamic Type. Reduced-motion path for
every §9 animation. Admin forms have labeled fields + error text tied to inputs.

## 11. Cross-platform (iOS + Android) — must look right on both
Shopy runs on both platforms; design and verify accordingly.
- **Safe areas:** wrap screens with `SafeAreaView`/insets; headers respect the notch, the tab bar
  respects the bottom inset (§8). Android **edge-to-edge** on; status bar themed (`expo-status-bar`
  follows the scheme).
- **Glass/shadow:** `BlurView` looks great on iOS; on Android provide a **solid `bg-surface`/
  `surface-alt` fallback** (and use elevation for shadows). Gradients (`expo-linear-gradient`) render
  the same on both.
- **Keyboard:** auth screens + the `AuthSheet` + checkout use `KeyboardAvoidingView` (iOS `padding`,
  Android `height`) and a keyboard-aware bottom sheet so inputs stay visible.
- **Touch + haptics:** `expo-haptics` on add-to-cart / place-order; 44×44 targets everywhere.
- **Splash/icon:** branded and flash-free on both (`BRANDING-ASSETS.md`).
- **Verify each phase in both themes on an iOS simulator AND an Android emulator** before the
  checkpoint.
