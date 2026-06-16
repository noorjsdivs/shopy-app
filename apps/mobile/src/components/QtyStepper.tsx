import { useRef } from 'react';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';
import { useFly } from '@/features/cart/fly.store';

function haptic() {
  if (Platform.OS !== 'web') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

interface AddButtonProps {
  onPress: () => void;
  label?: string;
  className?: string;
  /** When set, plays a fly-to-cart animation from this button. */
  flyImage?: string;
}

/** Round "+" quick-add button. */
export function AddButton({ onPress, label = 'Add to cart', className, flyImage }: AddButtonProps) {
  const { colors } = useThemeColors();
  const play = useFly((s) => s.play);
  const ref = useRef<View>(null);

  const handlePress = () => {
    haptic();
    if (flyImage) {
      ref.current?.measureInWindow((x, y, w, h) => {
        play(x + w / 2, y + h / 2, flyImage);
      });
    }
    onPress();
  };

  return (
    <PressableScale
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      className={cn(
        'h-9 w-9 items-center justify-center rounded-full bg-primary border border-line',
        className,
      )}
    >
      <Ionicons name="add" size={22} color={colors.onPrimary} />
    </PressableScale>
  );
}

interface QtyStepperProps {
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
}

/** − / count / + control; the − becomes a trash icon at qty 1. */
export function QtyStepper({
  qty,
  onIncrement,
  onDecrement,
  className,
}: QtyStepperProps) {
  const { colors } = useThemeColors();
  const removing = qty <= 1;
  return (
    <View
      className={cn(
        'h-9 flex-row items-center rounded-full bg-primary px-1',
        className,
      )}
      accessibilityLabel={`Quantity ${qty}`}
    >
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={removing ? 'Remove from cart' : 'Decrease quantity'}
        onPress={() => {
          haptic();
          onDecrement();
        }}
        className="h-7 w-7 items-center justify-center"
      >
        <Ionicons
          name={removing ? 'trash-outline' : 'remove'}
          size={removing ? 16 : 20}
          color={colors.onPrimary}
        />
      </PressableScale>
      <Text weight="bold" className="min-w-7 text-center text-onPrimary">
        {qty}
      </Text>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        onPress={() => {
          haptic();
          onIncrement();
        }}
        className="h-7 w-7 items-center justify-center"
      >
        <Ionicons name="add" size={20} color={colors.onPrimary} />
      </PressableScale>
    </View>
  );
}
