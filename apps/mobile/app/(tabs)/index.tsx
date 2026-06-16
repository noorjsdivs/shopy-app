import { useMemo } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Store } from '@shopy/shared';
import {
  Screen,
  Text,
  SearchBar,
  GradientHero,
  CategoryTile,
  StoreCard,
  ProductCard,
  FeaturedProduct,
  SectionHeader,
  Skeleton,
  ErrorState,
  PressableScale,
} from '@/components';
import { useHome, useStores } from '@/features/catalog/hooks';
import { useThemeColors, toneGradient } from '@/lib/colors';
import { useCart, selectCount } from '@/store/cart';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const home = useHome();
  const stores = useStores();
  const cartCount = useCart(selectCount);

  const storeMap = useMemo(() => {
    const map = new Map<string, Store>();
    stores.data?.data.forEach((s) => map.set(s.id, s));
    return map;
  }, [stores.data]);

  const refreshing = home.isRefetching || stores.isRefetching;
  const onRefresh = () => {
    void home.refetch();
    void stores.refetch();
  };

  return (
    <Screen edges={['top']}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-1">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Choose delivery address"
          className="flex-1 pr-3"
        >
          <Text className="text-meta text-muted">Deliver to</Text>
          <View className="mt-0.5 flex-row items-center gap-1">
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text weight="extrabold" numberOfLines={1} className="text-title text-fg">
              Home
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.muted} />
          </View>
        </PressableScale>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`View cart, ${cartCount} items`}
          onPress={() => router.push('/cart')}
          className="h-11 w-11 items-center justify-center rounded-full bg-surfaceAlt"
        >
          <Ionicons name="cart-outline" size={21} color={colors.fg} />
          {cartCount > 0 ? (
            <View className="absolute -right-0.5 -top-0.5 h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1">
              <Text weight="bold" className="text-[10px] text-onPrimary">
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          ) : null}
        </PressableScale>
      </View>

      <View className="px-4 pb-2">
        <SearchBar editable={false} onPress={() => router.push('/search')} />
      </View>

      {home.isError ? (
        <ErrorState onRetry={() => void home.refetch()} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {home.isLoading || !home.data ? (
            <HomeSkeleton />
          ) : (
            <>
              <View className="mt-2">
                <GradientHero banners={home.data.heroBanners} />
              </View>

              {/* Category rail */}
              <View className="mt-7">
                <SectionHeader title="Shop by category" className="mb-3 px-4" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingBottom: 6 }}
                >
                  {home.data.categories.map((c) => (
                    <CategoryTile
                      key={c.id}
                      category={c}
                      onPress={() =>
                        router.push({ pathname: '/categories', params: { focus: c.slug } })
                      }
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Highlighted product */}
              {(() => {
                const featured =
                  home.data.productShelves.find((s) => s.id === 'shelf-deals')?.products[0] ??
                  home.data.productShelves[0]?.products[0];
                return featured ? (
                  <View className="mt-7">
                    <SectionHeader title="Featured" className="mb-3 px-4" />
                    <FeaturedProduct product={featured} />
                  </View>
                ) : null;
              })()}

              {/* Promos */}
              <View className="mt-7">
                <SectionHeader title="Offers for you" className="mb-3 px-4" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 6 }}
                >
                  {home.data.promos.map((p) => (
                    <LinearGradient
                      key={p.id}
                      colors={toneGradient(p.tone, colors)}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ width: 220 }}
                      className="rounded-2xl p-4 border border-line"
                    >
                      <Text weight="extrabold" className="text-title text-white">
                        {p.title}
                      </Text>
                      <Text className="mt-1 text-meta text-white">{p.subtitle}</Text>
                    </LinearGradient>
                  ))}
                </ScrollView>
              </View>

              {/* Featured store sections */}
              {home.data.sections.map((section) => {
                const sectionStores = section.storeIds
                  .map((id) => storeMap.get(id))
                  .filter((s): s is Store => Boolean(s));
                if (sectionStores.length === 0) return null;
                return (
                  <View key={section.title} className="mt-7">
                    <SectionHeader title={section.title} className="mb-3 px-4" />
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}
                    >
                      {sectionStores.map((s) => (
                        <StoreCard key={s.id} store={s} />
                      ))}
                    </ScrollView>
                  </View>
                );
              })}

              {/* Product shelves */}
              {home.data.productShelves.map((shelf) => (
                <View key={shelf.id} className="mt-7">
                  <SectionHeader
                    title={shelf.title}
                    subtitle={shelf.subtitle}
                    className="mb-3 px-4"
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}
                  >
                    {shelf.products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </ScrollView>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function HomeSkeleton() {
  return (
    <View className="px-4">
      <Skeleton className="mt-2 h-[168px] w-full rounded-3xl" />
      <View className="mt-6 flex-row gap-3">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} className="items-center gap-1.5">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <Skeleton className="h-3 w-12" />
          </View>
        ))}
      </View>
      <Skeleton className="mt-7 h-5 w-40" />
      <View className="mt-3 flex-row gap-3">
        <Skeleton className="h-24 w-[230px]" />
        <Skeleton className="h-24 w-[230px]" />
      </View>
      <Skeleton className="mt-7 h-5 w-40" />
      <View className="mt-3 flex-row gap-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-56 w-[160px]" />
        ))}
      </View>
    </View>
  );
}
