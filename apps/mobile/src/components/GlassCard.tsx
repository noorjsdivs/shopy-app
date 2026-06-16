import { Platform, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Frosted-glass surface. Uses expo-blur on iOS; falls back to a solid
 * surface token on Android (BlurView is unreliable there) — DESIGN-SPEC §11.
 */
export function GlassCard({
  intensity = 40,
  className,
  children,
  ...props
}: GlassCardProps) {
  const { scheme } = useThemeColors();

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        className={cn('overflow-hidden rounded-2xl border border-line', className)}
        {...props}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl border border-line bg-surfaceAlt',
        className,
      )}
      {...props}
    >
      {children}
    </View>
  );
}
