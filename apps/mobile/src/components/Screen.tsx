import { View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { cn } from '@/lib/cn';

interface ScreenProps extends ViewProps {
  edges?: Edge[];
  className?: string;
  children: React.ReactNode;
}

/** Themed, safe-area-aware screen container. */
export function Screen({
  edges = ['top'],
  className,
  children,
  ...props
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-bg">
      <View className={cn('flex-1', className)} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}
