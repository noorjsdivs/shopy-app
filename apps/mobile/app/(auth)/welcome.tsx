import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo, Text, PressableScale } from '@/components';
import { useThemeColors, brandGradient } from '@/lib/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();

  return (
    <LinearGradient
      colors={brandGradient(colors)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 justify-between px-6 py-8">
          <View className="flex-1 justify-center">
            <Logo size={84} variant="mono" color="#ffffff" />
            <Text weight="extrabold" className="mt-6 text-hero text-white">
              Shopy
            </Text>
            <Text weight="semibold" className="mt-2 text-h text-white">
              Everything you love, delivered.
            </Text>
            <Text className="mt-3 text-body text-white">
              Browse stores, build a cart, and check out in seconds. No account
              needed to start.
            </Text>
          </View>

          <View className="gap-3">
            <PressableScale
              accessibilityRole="button"
              onPress={() => router.push('/sign-up')}
              className="h-14 items-center justify-center rounded-pill bg-white"
            >
              <Text weight="bold" className="text-title text-primary">
                Create account
              </Text>
            </PressableScale>
            <PressableScale
              accessibilityRole="button"
              onPress={() => router.push('/sign-in')}
              className="h-14 items-center justify-center rounded-pill bg-glassLight"
            >
              <Text weight="semibold" className="text-title text-white">
                Sign in
              </Text>
            </PressableScale>
            <PressableScale
              accessibilityRole="button"
              onPress={() => router.replace('/')}
              className="h-12 items-center justify-center"
            >
              <Text weight="semibold" className="text-body text-white">
                Continue browsing
              </Text>
            </PressableScale>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
