import { useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  ProductCard,
  SectionHeader,
  RatingStars,
  SearchBar,
  DeptTabs,
  CartBar,
  Skeleton,
  ErrorState,
  PressableScale,
} from '@/components';
import { useStore } from '@/features/catalog/hooks';
import { useThemeColors, brandGradient } from '@/lib/colors';
import { formatPrice } from '@/lib/money';

const STICKY_OFFSET = 60;

export default function StoreScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { colors } = useThemeColors();
  const store = useStore(slug);

  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<string, number>>({});
  const [activeSlug, setActiveSlug] = useState('');

  const data = store.data;
  const headerColors: [string, string] = data?.brandColor
    ? [data.brandColor, data.brandColor]
    : brandGradient(colors);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!data) return;
    const y = e.nativeEvent.contentOffset.y + 140;
    let current = data.shelves[0]?.departmentSlug ?? '';
    for (const shelf of data.shelves) {
      const off = offsets.current[shelf.departmentSlug];
      if (off != null && off <= y) current = shelf.departmentSlug;
    }
    if (current && current !== activeSlug) setActiveSlug(current);
  };

  const scrollToDept = (deptSlug: string) => {
    const off = offsets.current[deptSlug];
    if (off != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, off - STICKY_OFFSET), animated: true });
    }
    setActiveSlug(deptSlug);
  };

  return (
    <View className="flex-1 bg-bg">
      {/* Floating back button */}
      <SafeAreaView edges={['top']} className="absolute left-0 right-0 top-0 z-10">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          className="m-3 h-10 w-10 items-center justify-center rounded-full bg-scrim"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </PressableScale>
      </SafeAreaView>

      {store.isError ? (
        <ErrorState onRetry={() => void store.refetch()} />
      ) : store.isLoading || !data ? (
        <View className="flex-1 p-4 pt-24">
          <Skeleton className="h-16 w-3/4" />
          <View className="mt-4 flex-row gap-3">
            <Skeleton className="h-56 w-[160px]" />
            <Skeleton className="h-56 w-[160px]" />
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            stickyHeaderIndices={[1]}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* 0: Header */}
            <View>
              <LinearGradient colors={headerColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <SafeAreaView edges={['top']}>
                  <View className="px-4 pb-5 pt-12">
                    <View className="flex-row items-center gap-3">
                      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-glassLight">
                        <Text className="text-display">{data.logo}</Text>
                      </View>
                      <View className="flex-1">
                        <Text weight="extrabold" className="text-h text-white">
                          {data.name}
                        </Text>
                        <View className="mt-1 flex-row items-center gap-2">
                          <RatingStars rating={data.rating} size={13} />
                          <Text className="text-meta text-white">
                            · {data.etaMinutes} min ·{' '}
                            {data.deliveryFeeMinor === 0
                              ? 'Free delivery'
                              : `${formatPrice(data.deliveryFeeMinor)} delivery`}
                          </Text>
                        </View>
                        {data.dealBadge ? (
                          <View className="mt-2 self-start rounded-pill bg-glassLight px-2.5 py-1">
                            <Text weight="semibold" className="text-meta text-white">
                              {data.dealBadge}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </SafeAreaView>
              </LinearGradient>
              <View className="px-4 py-3">
                <SearchBar
                  editable={false}
                  placeholder={`Search ${data.name}`}
                  onPress={() =>
                    router.push({
                      pathname: '/search',
                      params: { storeId: data.id, storeName: data.name },
                    })
                  }
                />
              </View>
            </View>

            {/* 1: Sticky dept tabs */}
            <DeptTabs
              departments={data.departments.map((d) => ({ slug: d.slug, name: d.name }))}
              activeSlug={activeSlug || data.shelves[0]?.departmentSlug || ''}
              onSelect={scrollToDept}
            />

            {/* 2..: Shelves */}
            {data.shelves.map((shelf) => (
              <View
                key={shelf.departmentSlug}
                onLayout={(e) => {
                  offsets.current[shelf.departmentSlug] = e.nativeEvent.layout.y;
                }}
                className="mt-5"
              >
                <SectionHeader
                  title={shelf.title}
                  className="px-4"
                  onSeeAll={() =>
                    router.push({
                      pathname: '/store/[slug]/dept/[deptSlug]',
                      params: { slug, deptSlug: shelf.departmentSlug },
                    })
                  }
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 12 }}
                >
                  {shelf.products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>

          <CartBar />
        </>
      )}
    </View>
  );
}
