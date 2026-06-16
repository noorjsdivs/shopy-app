import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Product, ProductDetail } from '@shopy/shared';
import {
  Text,
  Button,
  PriceTag,
  Badge,
  QtyStepper,
  ProductCard,
  SectionHeader,
  Skeleton,
  ErrorState,
  PressableScale,
} from '@/components';
import { useProduct, useProductsByIds } from '@/features/catalog/hooks';
import { useThemeColors } from '@/lib/colors';
import { useCart, selectQtyFor } from '@/store/cart';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeColors();
  const product = useProduct(id);

  const qty = useCart(selectQtyFor(id));
  const add = useCart((s) => s.add);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);

  if (product.isError) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-bg">
        <ErrorState onRetry={() => void product.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View>
          {product.data ? (
            <Image
              source={{ uri: product.data.image }}
              placeholder={product.data.blurhash ? { blurhash: product.data.blurhash } : undefined}
              style={{ width: '100%', aspectRatio: 1 }}
              contentFit="cover"
              transition={250}
            />
          ) : (
            <Skeleton className="aspect-square w-full rounded-none" />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.25)', 'transparent']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 96 }}
          />
          <SafeAreaView edges={['top']} className="absolute left-0 right-0 top-0">
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              className="m-4 h-10 w-10 items-center justify-center rounded-full bg-scrim"
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </PressableScale>
          </SafeAreaView>
        </View>

        {product.isLoading || !product.data ? (
          <View className="gap-3 p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </View>
        ) : (
          <View className="p-4">
            {product.data.compareAtMinor && product.data.compareAtMinor > product.data.priceMinor ? (
              <Badge label="Deal" tone="deal" className="mb-2" />
            ) : null}
            <Text weight="extrabold" className="text-h text-fg">
              {product.data.name}
            </Text>
            {product.data.brand ? (
              <Text className="mt-0.5 text-body text-muted">{product.data.brand}</Text>
            ) : null}
            <View className="mt-2 flex-row items-center gap-3">
              <PriceTag
                priceMinor={product.data.priceMinor}
                compareAtMinor={product.data.compareAtMinor}
                byWeight={product.data.byWeight}
                size="lg"
              />
              {product.data.size ? (
                <Text className="text-meta text-muted">· {product.data.size}</Text>
              ) : null}
            </View>

            {product.data.boughtRecently > 0 ? (
              <Text className="mt-1 text-meta text-faint">
                {product.data.boughtRecently.toLocaleString()} bought recently
              </Text>
            ) : null}

            {/* Tags */}
            {product.data.tags.length > 0 ? (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {product.data.tags.map((t) => (
                  <Badge key={t} label={t} tone="neutral" />
                ))}
              </View>
            ) : null}

            {product.data.description ? (
              <View className="mt-5">
                <Text weight="bold" className="mb-1 text-title text-fg">
                  About
                </Text>
                <Text className="text-body text-muted">{product.data.description}</Text>
              </View>
            ) : null}

            {/* Nutrition */}
            {product.data.nutrition && product.data.nutrition.length > 0 ? (
              <View className="mt-5">
                <Text weight="bold" className="mb-2 text-title text-fg">
                  Nutrition
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {product.data.nutrition.map((n) => (
                    <View key={n.label} className="rounded-xl bg-surface px-4 py-2 border border-line">
                      <Text className="text-meta text-muted">{n.label}</Text>
                      <Text weight="bold" className="text-title text-fg">
                        {n.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        )}

        {product.data ? <RelatedShelves product={product.data} /> : null}
      </ScrollView>

      {/* Sticky add bar */}
      {product.data ? (
        <View className="absolute bottom-0 left-0 right-0 flex-row items-center gap-3 border-t border-line bg-surface px-4 pb-8 pt-3">
          {qty > 0 ? (
            <View className="flex-1 flex-row items-center justify-between rounded-pill bg-surfaceAlt px-2 py-1.5">
              <Text weight="semibold" className="px-2 text-body text-fg">
                In cart
              </Text>
              <QtyStepper
                qty={qty}
                onIncrement={() => increment(id)}
                onDecrement={() => decrement(id)}
              />
            </View>
          ) : (
            <Button
              title="Add to cart"
              block
              leftIcon={<Ionicons name="add" size={20} color={colors.onPrimary} />}
              onPress={() => product.data && add(product.data)}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

function RelatedShelves({ product }: { product: ProductDetail }) {
  const related = useProductsByIds(product.relatedIds);
  const often = useProductsByIds(product.oftenBoughtWithIds);
  return (
    <View className="mt-2">
      {related.data.length > 0 ? (
        <Shelf title="You might also like" products={related.data} />
      ) : null}
      {often.data.length > 0 ? (
        <Shelf title="Often bought with" products={often.data} />
      ) : null}
    </View>
  );
}

function Shelf({ title, products }: { title: string; products: Product[] }) {
  return (
    <View className="mt-5">
      <SectionHeader title={title} className="px-4" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 12 }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </ScrollView>
    </View>
  );
}
