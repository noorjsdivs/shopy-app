import { ActivityIndicator, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { cn } from '@/lib/cn';

const button = cva(
  'flex-row items-center justify-center rounded-pill',
  {
    variants: {
      variant: {
        primary: 'bg-primary',
        secondary: 'bg-surfaceAlt border border-line',
        outline: 'border border-primary bg-transparent',
        ghost: 'bg-transparent',
        deal: 'bg-deal',
      },
      size: {
        sm: 'h-10 px-4',
        md: 'h-12 px-5',
        lg: 'h-14 px-6',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
);

const label = cva('text-title', {
  variants: {
    variant: {
      primary: 'text-onPrimary',
      secondary: 'text-fg',
      outline: 'text-primary',
      ghost: 'text-primary',
      deal: 'text-white',
    },
  },
  defaultVariants: { variant: 'primary' },
});

export interface ButtonProps
  extends VariantProps<typeof button> {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean | null;
  className?: string;
  leftIcon?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  block,
  loading,
  disabled,
  className,
  leftIcon,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || Boolean(loading);
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
      disabled={isDisabled}
      onPress={onPress}
      style={isDisabled ? { opacity: 0.5 } : undefined}
      className={cn(button({ variant, size, block }), className)}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'deal' ? '#fff' : undefined} />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text weight="semibold" className={label({ variant })}>
            {title}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}
