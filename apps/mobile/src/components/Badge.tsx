import { View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text } from './Text';
import { cn } from '@/lib/cn';

const badge = cva('self-start rounded-pill px-2.5 py-1', {
  variants: {
    tone: {
      primary: 'bg-primarySoft',
      deal: 'bg-dealSoft',
      success: 'bg-successSoft',
      warning: 'bg-warningSoft',
      neutral: 'bg-surfaceAlt',
    },
  },
  defaultVariants: { tone: 'primary' },
});

const badgeText = cva('text-meta', {
  variants: {
    tone: {
      primary: 'text-primary',
      deal: 'text-deal',
      success: 'text-success',
      warning: 'text-warning',
      neutral: 'text-muted',
    },
  },
  defaultVariants: { tone: 'primary' },
});

interface BadgeProps extends VariantProps<typeof badge> {
  label: string;
  className?: string;
  numberOfLines?: number;
}

export function Badge({ label, tone, className, numberOfLines }: BadgeProps) {
  return (
    <View className={cn(badge({ tone }), className)}>
      <Text weight="semibold" numberOfLines={numberOfLines} className={badgeText({ tone })}>
        {label}
      </Text>
    </View>
  );
}
