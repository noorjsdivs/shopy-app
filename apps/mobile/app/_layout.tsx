import '../global.css';
import '@/lib/register-interop';

import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import { queryClient } from '@/lib/query';
import { ThemeController } from '@/providers/ThemeController';
import { useAuth } from '@/store/auth';
import { useThemePref } from '@/store/theme';
import { setOnAuthFailure } from '@/services/api';
import { AuthSheet } from '@/features/auth';
import { FlyOverlay } from '@/features/cart/FlyOverlay';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const authStatus = useAuth((s) => s.status);
  const restore = useAuth((s) => s.restore);
  const themeHydrated = useThemePref((s) => s.hydrated);

  // Restore session + wire the API client's auth-failure handler.
  useEffect(() => {
    void restore();
    setOnAuthFailure(() => {
      useAuth.getState().handleAuthFailure();
    });
    return () => setOnAuthFailure(null);
  }, [restore]);

  const ready = fontsLoaded && authStatus !== 'loading' && themeHydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeController>
            <View className="flex-1 bg-bg">
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
                <Stack.Screen name="admin" />
                <Stack.Screen name="product/[id]" />
                <Stack.Screen name="store/[slug]" />
                <Stack.Screen name="checkout" options={{ presentation: 'card' }} />
                <Stack.Screen name="order/[id]" />
                <Stack.Screen name="orders" />
              </Stack>
              <FlyOverlay />
              <AuthSheet />
            </View>
          </ThemeController>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
