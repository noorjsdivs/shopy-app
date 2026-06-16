import { useColorScheme } from 'nativewind';

/**
 * Token color values mirrored for NATIVE APIs that can't read CSS variables
 * (expo-linear-gradient `colors`, expo-blur tint, Reanimated). This is the single
 * source for those cases — keep in sync with global.css. Everywhere else, use
 * NativeWind semantic classes (bg-primary, text-fg, …), never these literals.
 */
export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  fg: string;
  muted: string;
  faint: string;
  line: string;
  primary: string;
  primarySoft: string;
  primaryTint: string;
  deal: string;
  success: string;
  warning: string;
  onPrimary: string;
}

export type Scheme = 'light' | 'dark';

export const palette: Record<Scheme, Palette> = {
  light: {
    bg: 'rgb(248, 249, 252)',
    surface: 'rgb(255, 255, 255)',
    surfaceAlt: 'rgb(244, 245, 250)',
    fg: 'rgb(18, 20, 28)',
    muted: 'rgb(104, 110, 124)',
    faint: 'rgb(156, 162, 178)',
    line: 'rgb(228, 230, 238)',
    primary: 'rgb(99, 78, 240)',
    primarySoft: 'rgb(234, 231, 254)',
    primaryTint: 'rgb(138, 116, 255)',
    deal: 'rgb(224, 60, 80)',
    success: 'rgb(22, 163, 96)',
    warning: 'rgb(224, 150, 40)',
    onPrimary: 'rgb(255, 255, 255)',
  },
  dark: {
    bg: 'rgb(10, 11, 16)',
    surface: 'rgb(22, 24, 33)',
    surfaceAlt: 'rgb(28, 31, 42)',
    fg: 'rgb(240, 242, 248)',
    muted: 'rgb(160, 166, 182)',
    faint: 'rgb(108, 114, 130)',
    line: 'rgb(38, 41, 54)',
    primary: 'rgb(140, 122, 255)',
    primarySoft: 'rgb(36, 34, 64)',
    primaryTint: 'rgb(168, 150, 255)',
    deal: 'rgb(255, 110, 130)',
    success: 'rgb(52, 199, 130)',
    warning: 'rgb(240, 170, 70)',
    onPrimary: 'rgb(16, 17, 24)',
  },
};

/** Resolve the active palette + scheme for native APIs. */
export function useThemeColors(): { scheme: Scheme; colors: Palette } {
  const { colorScheme } = useColorScheme();
  const scheme: Scheme = colorScheme === 'dark' ? 'dark' : 'light';
  return { scheme, colors: palette[scheme] };
}

/** Tone -> gradient stop pair for hero banners / promos. */
export function toneGradient(
  tone: 'accent' | 'deal' | 'warning',
  colors: Palette,
): [string, string] {
  switch (tone) {
    case 'deal':
      return [colors.deal, colors.warning];
    case 'warning':
      return [colors.warning, colors.deal];
    case 'accent':
    default:
      return [colors.primary, colors.primaryTint];
  }
}

export function brandGradient(colors: Palette): [string, string] {
  return [colors.primary, colors.primaryTint];
}
