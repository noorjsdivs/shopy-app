import { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  ProductCard,
  Skeleton,
  EmptyState,
  ErrorState,
  FilterSheet,
  type DeptFilters,
  PressableScale,
} from '@/components';
import { useDepartment } from '@/features/catalog/hooks';
import { useThemeColors } from '@/lib/colors';

const DEFAULT_FILTERS: DeptFilters = {
  sort: 'popular',
  dietary: [],
  maxPriceMinor: undefined,
  onDealOnly: false,
};

function activeCount(f: DeptFilters): number {
  return (
    (f.sort !== 'popular' ? 1 : 0) +
    f.dietary.length +
    (f.maxPriceMinor != null ? 1 : 0) +
    (f.onDealOnly ? 1 : 0)
  );
}

export default function DepartmentScreen() {
  const { slug, deptSlug } = useLocalSearchParams<{ slug: string; deptSlug: string }>();
  const router = useRouter();
  const { colors } = useThemeColors();
  const [filters, setFilters] = useState<DeptFilters>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const query = useDepartment(slug, deptSlug, {
    sort: filters.sort,
    dietary: filters.dietary,
    maxPriceMinor: filters.maxPriceMinor,
    onDealOnly: filters.onDealOnly,
  });
  const products = query.data?.pages.flatMap((p) => p.data) ?? [];
  const total = query.data?.pages[0]?.meta.total ?? 0;
  const count = activeCount(filters);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          className="h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt"
        >
          <Ionicons name="chevron-back" size={22} color={colors.fg} />
        </PressableScale>
        <View className="flex-1">
          <Text weight="extrabold" numberOfLines={1} className="text-h capitalize text-fg">
            {deptSlug?.replace(/-/g, ' ')}
          </Text>
          {!query.isLoading ? (
            <Text className="text-meta text-muted">{total} items</Text>
          ) : null}
        </View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Filters"
          onPress={() => setSheetOpen(true)}
          className="h-10 flex-row items-center gap-1.5 rounded-full bg-surfaceAlt px-4"
        >
          <Ionicons name="options-outline" size={18} color={colors.fg} />
          <Text weight="semibold" className="text-meta text-fg">
            Filters
          </Text>
          {count > 0 ? (
            <View className="ml-0.5 h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1">
              <Text weight="bold" className="text-[10px] text-onPrimary">
                {count}
              </Text>
            </View>
          ) : null}
        </PressableScale>
      </View>

      {query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <View className="flex-row flex-wrap gap-3 p-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-[47%]" />
          ))}
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          icon="basket-outline"
          title="No products"
          message="Try changing your filters."
          actionLabel={count > 0 ? 'Clear filters' : undefined}
          onAction={count > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingVertical: 12, paddingBottom: 24 }}
          renderItem={({ item }) => <ProductCard product={item} layout="grid" />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={{ paddingVertical: 16 }} />
            ) : null
          }
        />
      )}

      <FilterSheet
        open={sheetOpen}
        value={filters}
        onApply={(f) => {
          setFilters(f);
          setSheetOpen(false);
        }}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  );
}
