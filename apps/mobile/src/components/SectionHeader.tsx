import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  onSeeAll,
  className,
}: SectionHeaderProps) {
  const { colors } = useThemeColors();
  return (
    <View className={cn('flex-row items-end justify-between', className)}>
      <View className="flex-1 pr-3">
        <Text weight="bold" className="text-h text-fg">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-meta text-muted">{subtitle}</Text>
        ) : null}
      </View>
      {onSeeAll ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
          onPress={onSeeAll}
          className="flex-row items-center gap-0.5"
        >
          <Text weight="semibold" className="text-meta text-primary">
            See all
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </PressableScale>
      ) : null}
    </View>
  );
}
