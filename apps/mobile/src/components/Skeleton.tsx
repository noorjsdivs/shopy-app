import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  useReducedMotion,
  cancelAnimation,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

/** Shimmer placeholder. Honors reduce-motion (static at rest opacity). */
export function Skeleton({ className }: SkeletonProps) {
  const opacity = useSharedValue(0.5);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      opacity.value = 0.6;
      return;
    }
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity, reduced]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={style}
      className={cn('rounded-card bg-surfaceAlt', className)}
    />
  );
}
