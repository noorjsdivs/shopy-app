import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface RatingStarsProps {
  rating: number;
  showValue?: boolean;
  size?: number;
  className?: string;
}

export function RatingStars({
  rating,
  showValue = true,
  size = 14,
  className,
}: RatingStarsProps) {
  const { colors } = useThemeColors();
  return (
    <View
      className={cn('flex-row items-center gap-1', className)}
      accessibilityLabel={`Rated ${rating.toFixed(1)} out of 5`}
    >
      <Ionicons name="star" size={size} color={colors.warning} />
      {showValue ? (
        <Text weight="semibold" className="text-meta text-fg">
          {rating.toFixed(1)}
        </Text>
      ) : null}
    </View>
  );
}
