import { useEffect } from 'react';
import { colorScheme, useColorScheme } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import { useThemePref } from '@/store/theme';

/**
 * Applies the persisted theme preference (system/light/dark) to NativeWind and
 * keeps the status bar in sync. Uses NativeWind's imperative `colorScheme.set`
 * (the hook setter can throw a context error when called from effects).
 */
export function ThemeController({ children }: { children: React.ReactNode }) {
  const { colorScheme: active } = useColorScheme();
  const preference = useThemePref((s) => s.preference);
  const hydrated = useThemePref((s) => s.hydrated);

  useEffect(() => {
    if (hydrated) colorScheme.set(preference);
  }, [preference, hydrated]);

  return (
    <>
      <StatusBar style={active === 'dark' ? 'light' : 'dark'} />
      {children}
    </>
  );
}
