import { View } from 'react-native';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/money';

interface PriceTagProps {
  priceMinor: number;
  compareAtMinor?: number | null;
  byWeight?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Formats minor units; deal variant shows struck-through compare-at price. */
export function PriceTag({
  priceMinor,
  compareAtMinor,
  byWeight,
  size = 'md',
  className,
}: PriceTagProps) {
  const onDeal = compareAtMinor != null && compareAtMinor > priceMinor;
  const priceClass =
    size === 'lg' ? 'text-h' : size === 'sm' ? 'text-price' : 'text-title';

  return (
    <View className={cn('flex-row items-baseline gap-1.5', className)}>
      <Text
        weight="bold"
        className={cn(priceClass, onDeal ? 'text-deal' : 'text-fg')}
      >
        {formatPrice(priceMinor)}
        {byWeight ? <Text className="text-meta text-muted"> /lb</Text> : null}
      </Text>
      {onDeal ? (
        <Text
          className="text-meta text-faint line-through"
          accessibilityLabel={`was ${formatPrice(compareAtMinor)}`}
        >
          {formatPrice(compareAtMinor)}
        </Text>
      ) : null}
    </View>
  );
}
