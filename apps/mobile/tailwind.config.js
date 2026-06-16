/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surfaceAlt: 'rgb(var(--surface-alt) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        primarySoft: 'rgb(var(--primary-soft) / <alpha-value>)',
        primaryTint: 'rgb(var(--primary-tint) / <alpha-value>)',
        deal: 'rgb(var(--deal) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        onPrimary: 'rgb(var(--on-primary) / <alpha-value>)',
        // Pre-blended "soft" tints (theme-aware) — replace alpha-modifier classes
        // like bg-deal/15 which trigger NativeWind's runtime color-mix race.
        dealSoft: 'rgb(var(--deal-soft) / <alpha-value>)',
        successSoft: 'rgb(var(--success-soft) / <alpha-value>)',
        warningSoft: 'rgb(var(--warning-soft) / <alpha-value>)',
        // Theme-independent translucent overlays for use over gradients/images.
        glassLight: 'rgba(255, 255, 255, 0.18)',
        glassStrong: 'rgba(255, 255, 255, 0.26)',
        scrim: 'rgba(0, 0, 0, 0.32)',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
        extrabold: ['Inter_800ExtraBold'],
      },
      borderRadius: {
        card: '16px',
        xl: '20px',
        '2xl': '28px',
        '3xl': '32px',
        pill: '9999px',
      },
      fontSize: {
        meta: ['12px', '16px'],
        body: ['14px', '20px'],
        title: ['16px', '22px'],
        price: ['15px', '20px'],
        h: ['20px', '26px'],
        display: ['28px', '34px'],
        hero: ['34px', '40px'],
      },
      boxShadow: {
        glow: '0 10px 30px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
