import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Store } from '@shopy/shared';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { Badge } from './Badge';
import { RatingStars } from './RatingStars';
import { cn } from '@/lib/cn';
import { glow } from '@/lib/shadow';
import { formatPrice } from '@/lib/money';

interface StoreCardProps {
  store: Store;
  className?: string;
  layout?: 'shelf' | 'list';
}

export function StoreCard({ store, className, layout = 'shelf' }: StoreCardProps) {
  const router = useRouter();
  const feeLabel =
    store.deliveryFeeMinor === 0 ? 'Free delivery' : `${formatPrice(store.deliveryFeeMinor)} delivery`;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${store.name}, rated ${store.rating.toFixed(1)}, ${store.etaMinutes} minutes, ${feeLabel}`}
      onPress={() => router.push({ pathname: '/store/[slug]', params: { slug: store.slug } })}
      style={glow}
      className={cn(
        'rounded-card bg-surface p-3 border border-line',
        layout === 'shelf' ? 'w-[230px]' : 'w-full',
        className,
      )}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: (store.brandColor ?? '#634EF0') + '22' }}
        >
          <Text className="text-h">{store.logo}</Text>
        </View>
        <View className="flex-1">
          <Text weight="bold" numberOfLines={1} className="text-title text-fg">
            {store.name}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-2">
            <RatingStars rating={store.rating} size={12} />
            <Text className="text-meta text-muted">· {store.etaMinutes} min</Text>
          </View>
        </View>
      </View>
      <View className="mt-2.5 flex-row items-center gap-2">
        <Text numberOfLines={1} className="shrink-0 text-meta text-muted">
          {feeLabel}
        </Text>
        {store.dealBadge ? (
          <Badge
            label={store.dealBadge}
            tone="primary"
            numberOfLines={1}
            className="ml-auto shrink"
          />
        ) : null}
      </View>
    </PressableScale>
  );
}
