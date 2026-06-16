import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Product } from '@shopy/shared';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { PriceTag } from './PriceTag';
import { Badge } from './Badge';
import { AddButton, QtyStepper } from './QtyStepper';
import { cn } from '@/lib/cn';
import { glow } from '@/lib/shadow';
import { formatPrice } from '@/lib/money';
import { useCart, selectQtyFor } from '@/store/cart';

interface ProductCardProps {
  product: Product;
  className?: string;
  /** shelf = fixed width for horizontal rails; grid = full width of its column. */
  layout?: 'shelf' | 'grid';
}

export function ProductCard({ product, className, layout = 'shelf' }: ProductCardProps) {
  const router = useRouter();
  const qty = useCart(selectQtyFor(product.id));
  const add = useCart((s) => s.add);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);

  const onDeal = product.compareAtMinor != null && product.compareAtMinor > product.priceMinor;
  const a11y =
    `${product.name}${product.size ? `, ${product.size}` : ''}, ${formatPrice(product.priceMinor)}` +
    `${onDeal ? `, was ${formatPrice(product.compareAtMinor!)}` : ''}`;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={glow}
      className={cn(
        'rounded-card bg-surface p-3 border border-line',
        layout === 'shelf' ? 'w-[164px]' : 'flex-1',
        className,
      )}
    >
      <View className="overflow-hidden rounded-xl">
        <Image
          source={{ uri: product.image }}
          placeholder={product.blurhash ? { blurhash: product.blurhash } : undefined}
          style={{ width: '100%', aspectRatio: 1 }}
          contentFit="cover"
          transition={250}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.18)']}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 44 }}
        />
        {onDeal ? (
          <Badge label="Deal" tone="deal" className="absolute left-1.5 top-1.5" />
        ) : null}
        <View className="absolute bottom-1.5 right-1.5">
          {qty > 0 ? (
            <QtyStepper
              qty={qty}
              onIncrement={() => increment(product.id)}
              onDecrement={() => decrement(product.id)}
            />
          ) : (
            <AddButton
              onPress={() => add(product)}
              label={`Add ${product.name} to cart`}
              flyImage={product.image}
            />
          )}
        </View>
      </View>

      <View className="mt-2.5 gap-1 px-0.5">
        <PriceTag
          priceMinor={product.priceMinor}
          compareAtMinor={product.compareAtMinor}
          byWeight={product.byWeight}
          size="sm"
        />
        <Text weight="semibold" numberOfLines={1} className="text-body text-fg">
          {product.name}
        </Text>
        <Text numberOfLines={1} className="text-meta text-muted">
          {product.size ?? product.brand ?? ' '}
        </Text>
        {product.boughtRecently > 0 ? (
          <Text className="text-meta text-faint">
            {product.boughtRecently.toLocaleString()} bought recently
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}
