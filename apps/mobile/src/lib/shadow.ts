import { Platform, type ViewStyle } from 'react-native';

/**
 * Soft elevation applied via the `style` prop (NOT a NativeWind `shadow-*`
 * className) — className shadows trigger NativeWind's CSS-interop race with the
 * navigation context. Inline styles bypass the interop and are safe.
 */
export const glow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 3 },
    default: {},
  }) ?? {};
