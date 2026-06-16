import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Category } from '@shopy/shared';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface CategoryTileProps {
  category: Category;
  onPress?: () => void;
  className?: string;
}

// Per-category gradient pairs (data, not UI literals) keyed by slug.
const GRADIENTS: Record<string, [string, string]> = {
  grocery: ['#2E933C', '#56C271'],
  alcohol: ['#7B1FA2', '#A857C9'],
  convenience: ['#F57C00', '#FFB14E'],
  pharmacy: ['#0277BD', '#3FA9E0'],
  retail: ['#455A64', '#78909C'],
};

export function CategoryTile({ category, onPress, className }: CategoryTileProps) {
  const { colors } = useThemeColors();
  const grad = GRADIENTS[category.slug] ?? [colors.primary, colors.primaryTint];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={category.name}
      onPress={onPress}
      className={cn('w-[76px] items-center', className)}
    >
      <LinearGradient
        colors={grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 64, height: 64 }}
        className="items-center justify-center rounded-2xl border border-line"
      >
        <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={28} color="#fff" />
      </LinearGradient>
      <Text weight="medium" numberOfLines={1} className="mt-1.5 text-meta text-fg">
        {category.name}
      </Text>
    </PressableScale>
  );
}
