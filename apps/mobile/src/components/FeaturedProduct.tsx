import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Product } from '@shopy/shared';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { PriceTag } from './PriceTag';
import { AddButton, QtyStepper } from './QtyStepper';
import { useThemeColors } from '@/lib/colors';
import { glow } from '@/lib/shadow';
import { useCart, selectQtyFor } from '@/store/cart';

interface FeaturedProductProps {
  product: Product;
  label?: string;
}

/** A large, highlighted product card for the home (e.g. the top deal). */
export function FeaturedProduct({ product, label = 'Deal of the day' }: FeaturedProductProps) {
  const router = useRouter();
  const { colors } = useThemeColors();
  const qty = useCart(selectQtyFor(product.id));
  const add = useCart((s) => s.add);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);

  const onDeal = product.compareAtMinor != null && product.compareAtMinor > product.priceMinor;
  const pctOff =
    onDeal && product.compareAtMinor
      ? Math.round((1 - product.priceMinor / product.compareAtMinor) * 100)
      : 0;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${product.name}`}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={glow}
      className="mx-4 flex-row gap-3 overflow-hidden rounded-2xl bg-surface p-3 border border-line"
    >
      <View className="overflow-hidden rounded-xl">
        <Image
          source={{ uri: product.image }}
          placeholder={product.blurhash ? { blurhash: product.blurhash } : undefined}
          style={{ width: 124, height: 124 }}
          contentFit="cover"
          transition={250}
        />
        {pctOff > 0 ? (
          <LinearGradient
            colors={[colors.deal, colors.warning]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', left: 6, top: 6, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}
          >
            <Text weight="extrabold" className="text-[11px] text-white">
              -{pctOff}%
            </Text>
          </LinearGradient>
        ) : null}
      </View>

      <View className="flex-1 justify-between py-0.5">
        <View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="flash" size={13} color={colors.primary} />
            <Text weight="bold" className="text-meta text-primary">
              {label}
            </Text>
          </View>
          <Text weight="bold" numberOfLines={2} className="mt-1 text-title text-fg">
            {product.name}
          </Text>
          <Text numberOfLines={1} className="text-meta text-muted">
            {[product.brand, product.size].filter(Boolean).join(' · ')}
          </Text>
        </View>

        <View className="flex-row items-end justify-between">
          <PriceTag
            priceMinor={product.priceMinor}
            compareAtMinor={product.compareAtMinor}
            byWeight={product.byWeight}
            size="lg"
          />
          {qty > 0 ? (
            <QtyStepper
              qty={qty}
              onIncrement={() => increment(product.id)}
              onDecrement={() => decrement(product.id)}
            />
          ) : (
            <AddButton onPress={() => add(product)} label={`Add ${product.name}`} flyImage={product.image} />
          )}
        </View>
      </View>
    </PressableScale>
  );
}
