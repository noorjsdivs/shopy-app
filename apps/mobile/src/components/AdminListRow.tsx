import { View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface AdminListRowProps {
  title: string;
  subtitle?: string;
  image?: string;
  emoji?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  inactive?: boolean;
  className?: string;
}

export function AdminListRow({
  title,
  subtitle,
  image,
  emoji,
  right,
  onPress,
  inactive,
  className,
}: AdminListRowProps) {
  const { colors } = useThemeColors();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={inactive ? { opacity: 0.5 } : undefined}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl bg-surface p-3 border border-line',
        className,
      )}
    >
      {image ? (
        <Image source={{ uri: image }} style={{ width: 44, height: 44, borderRadius: 10 }} contentFit="cover" />
      ) : emoji ? (
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-surfaceAlt">
          <Text className="text-title">{emoji}</Text>
        </View>
      ) : null}
      <View className="flex-1">
        <Text weight="semibold" numberOfLines={1} className="text-body text-fg">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-meta text-muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={18} color={colors.faint} />}
    </PressableScale>
  );
}
