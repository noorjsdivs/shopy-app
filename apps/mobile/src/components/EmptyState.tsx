import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Button } from './Button';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  message,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const { colors } = useThemeColors();
  return (
    <View className={cn('flex-1 items-center justify-center px-8 py-12', className)}>
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-primarySoft">
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <Text weight="bold" className="text-h text-center text-fg">
        {title}
      </Text>
      {message ? (
        <Text className="mt-1.5 text-center text-body text-muted">{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} className="mt-5 px-8" />
      ) : null}
    </View>
  );
}
