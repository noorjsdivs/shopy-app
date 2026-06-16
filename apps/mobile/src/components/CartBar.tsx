import { useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { useThemeColors } from '@/lib/colors';
import { formatPrice } from '@/lib/money';
import { useCart, selectCount, selectSubtotal } from '@/store/cart';
import { computeTotals } from '@/lib/cart';

/** Sticky glass bottom bar: count + subtotal + free-delivery meter + View cart. */
export function CartBar() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const totals = computeTotals(subtotal);
  const reduced = useReducedMotion();

  const progress = useSharedValue(totals.freeDeliveryProgress);
  useEffect(() => {
    if (reduced) progress.value = totals.freeDeliveryProgress;
    else progress.value = withTiming(totals.freeDeliveryProgress, { duration: 350 });
  }, [totals.freeDeliveryProgress, reduced, progress]);

  const meterStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%`,
  }));

  if (count <= 0) return null;

  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-surface px-4 pb-8 pt-3">
      <Text className="mb-1.5 text-meta text-muted">
        {totals.amountToFreeDeliveryMinor > 0
          ? `Spend ${formatPrice(totals.amountToFreeDeliveryMinor)} more for free delivery`
          : 'Free delivery unlocked! 🎉'}
      </Text>
      <View className="mb-3 h-1.5 overflow-hidden rounded-full bg-surfaceAlt">
        <Animated.View style={meterStyle} className="h-full rounded-full bg-primary" />
      </View>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${count} items, ${formatPrice(totals.subtotalMinor)}`}
        onPress={() => router.push('/cart')}
        className="h-12 flex-row items-center justify-between rounded-pill bg-primary px-5"
      >
        <View className="flex-row items-center gap-2">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-glassStrong">
            <Text weight="bold" className="text-meta text-onPrimary">
              {count}
            </Text>
          </View>
          <Text weight="semibold" className="text-title text-onPrimary">
            View cart
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text weight="bold" className="text-title text-onPrimary">
            {formatPrice(totals.subtotalMinor)}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.onPrimary} />
        </View>
      </PressableScale>
    </View>
  );
}
