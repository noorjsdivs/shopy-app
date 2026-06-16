import { forwardRef } from 'react';
import { Pressable, type PressableProps, type View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends PressableProps {
  scaleTo?: number;
  className?: string;
}

/** Pressable with a subtle press-scale (honors reduce-motion). */
export const PressableScale = forwardRef<View, PressableScaleProps>(
  function PressableScale({ scaleTo = 0.97, onPressIn, onPressOut, ...props }, ref) {
    const scale = useSharedValue(1);
    const reduced = useReducedMotion();

    const style = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        ref={ref}
        style={style}
        onPressIn={(e) => {
          if (!reduced) scale.value = withTiming(scaleTo, { duration: 90 });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          if (!reduced) scale.value = withTiming(1, { duration: 120 });
          onPressOut?.(e);
        }}
        {...props}
      />
    );
  },
);
