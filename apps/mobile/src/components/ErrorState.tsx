import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Button } from './Button';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn’t load this right now. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  const { colors } = useThemeColors();
  return (
    <View className={cn('flex-1 items-center justify-center px-8 py-12', className)}>
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-dealSoft">
        <Ionicons name="cloud-offline-outline" size={30} color={colors.deal} />
      </View>
      <Text weight="bold" className="text-h text-center text-fg">
        {title}
      </Text>
      <Text className="mt-1.5 text-center text-body text-muted">{message}</Text>
      {onRetry ? (
        <Button title="Try again" variant="secondary" onPress={onRetry} className="mt-5 px-8" />
      ) : null}
    </View>
  );
}
