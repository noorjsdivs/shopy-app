# BRANDING-ASSETS.md — Shopy brand identity & app assets

Shopy must **look like a real product** the moment it launches — a distinct logo, a polished app
icon on the home screen, and a glossy splash on both iOS and Android. This doc defines the brand and
the exact assets Claude Code generates and wires up. Colors reference the design tokens in
`DESIGN-SPEC §2` (primary indigo/violet → tint). **No raw hex in app code; assets bake the brand
colors into PNGs.**

## 1. Brand
- **Name:** Shopy. **Tagline:** "Everything you love, delivered."
- **Personality:** premium, friendly, glossy. Modern fintech-meets-retail.
- **Brandmark:** a rounded **shopping bag** whose handle + cutout reads as an **"S"**, in white on
  the brand gradient. Simple, recognizable at 48px, scalable to 1024px.
- **Wordmark:** "Shopy" set in **Inter ExtraBold**, `text-fg` (or white on gradient).
- **Brand gradient:** diagonal `primary (99 78 240)` → `primaryTint (138 116 255)`, with a soft
  top-left gloss highlight.

## 2. Source artwork (author this once, render the rest)
Create a single master **SVG** logo at `apps/mobile/assets/brand/logo.svg` (1024×1024 artboard):
the bag/"S" glyph centered with safe padding. Keep a **monochrome white** variant
(`logo-mono.svg`) for the adaptive-icon foreground and the notification icon. Render all PNGs from
these with `sharp` (or `@expo/image-utils`) via a small `apps/mobile/scripts/gen-icons.ts` script so
they can be regenerated.

## 3. Required asset files (`apps/mobile/assets/`)
| File | Size | Notes |
|------|------|-------|
| `icon.png` | 1024×1024 | App icon: full-bleed brand gradient + centered white glyph + gloss. No transparency, no rounded corners (the OS masks it). |
| `splash-icon.png` | 1024×1024 (logo ~40% centered) | Splash logo on a transparent or solid field; paired with a brand `backgroundColor`. |
| `adaptive-icon-foreground.png` | 1024×1024 | Android foreground: white glyph centered **inside the 66% safe zone** (outer ~17% can be cropped by the OS mask), transparent background. |
| `adaptive-icon-background.png` *(or color)* | 1024×1024 | Android background layer: the brand gradient (or set `backgroundColor`). |
| `notification-icon.png` | 96×96 | White, transparent — Android tints it. |
| `favicon.png` | 48×48 | Web. |
> Android adaptive icons are masked to circles/squircles/rounded squares per device — **keep the
> glyph well inside the safe zone** so it's never clipped. iOS uses `icon.png` and rounds it itself.

## 4. `app.json` / `app.config.ts` wiring
```jsonc
{
  "expo": {
    "name": "Shopy",
    "slug": "shopy",
    "scheme": "shopy",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",            // supports light + dark
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#634EF0"                // brand primary; dark variant below
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.shopy.app",
      "infoPlist": { "UIuserInterfaceStyle": "Automatic" }
    },
    "android": {
      "package": "com.shopy.app",
      "edgeToEdgeEnabled": true,                  // proper insets for the tab bar
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon-foreground.png",
        "backgroundColor": "#634EF0"
      }
    },
    "experiments": { "typedRoutes": true },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      ["expo-splash-screen", {
        "backgroundColor": "#FFFFFF",
        "dark": { "backgroundColor": "#0A0B10" },  // matches DESIGN-SPEC dark --bg
        "image": "./assets/splash-icon.png",
        "imageWidth": 200
      }]
    ]
  }
}
```
- Use the **config plugin form of `expo-splash-screen`** for a light/dark-aware splash; keep
  `expo-splash-screen` `preventAutoHideAsync()` in `app/_layout.tsx` until fonts + session restore.
- The two hex values here are the **only** place hex appears (native config requires it); they mirror
  `--primary` and dark `--bg`. App code still uses tokens.

## 5. Quality bar
- App icon is crisp on both platforms; the glyph is centered and never clipped by the Android mask.
- Splash shows the brand on launch in **both** light and dark, then hands off to the themed app with
  no white flash.
- Logo renders inside the app (auth screens, headers, empty states) via the SVG (`react-native-svg`)
  so it's sharp at any size and theme-aware.
- `npx expo-doctor` is clean; assets are committed; the gen script is re-runnable.
