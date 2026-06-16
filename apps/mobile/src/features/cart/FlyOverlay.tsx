import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { useFly } from './fly.store';

const SIZE = 56;

/**
 * Renders a flying product thumbnail from the tapped add-button to the Cart tab.
 * Mounted once in app/_layout.tsx. Driven entirely by the fly store (no local
 * React state). Honors reduce-motion (clears immediately).
 */
export function FlyOverlay() {
  const event = useFly((s) => s.event);
  const clear = useFly((s) => s.clear);
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const progress = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Cart is the 4th of 5 tabs -> center at 70% width; bottom tab row.
  const targetX = width * 0.7 - SIZE / 2;
  const targetY = height - insets.bottom - 28 - SIZE / 2;

  useEffect(() => {
    if (!event) return;
    if (reduced) {
      clear();
      return;
    }
    startX.value = event.x - SIZE / 2;
    startY.value = event.y - SIZE / 2;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 550 }, (finished) => {
      if (finished) runOnJS(clear)();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const eased = p * p; // ease-in toward the cart
    return {
      position: 'absolute',
      width: SIZE,
      height: SIZE,
      left: startX.value + (targetX - startX.value) * eased,
      top: startY.value + (targetY - startY.value) * p,
      opacity: 1 - p * 0.6,
      transform: [{ scale: 1 - p * 0.65 }],
    };
  });

  if (!event || reduced) return null;

  return (
    <Animated.View pointerEvents="none" style={style} className="overflow-hidden rounded-2xl border border-line">
      {event.image ? (
        <Image source={{ uri: event.image }} style={{ width: SIZE, height: SIZE }} contentFit="cover" />
      ) : (
        <Animated.View className="h-full w-full rounded-2xl bg-primary" />
      )}
    </Animated.View>
  );
}
