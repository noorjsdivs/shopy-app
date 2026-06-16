import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Screen,
  Text,
  SearchBar,
  ProductCard,
  StoreCard,
  EmptyState,
  ErrorState,
  Badge,
  PressableScale,
} from '@/components';
import { useSearch, useStores } from '@/features/catalog/hooks';
import { useThemeColors } from '@/lib/colors';

const SUGGESTIONS = ['Milk', 'Bananas', 'Organic', 'Coffee', 'Chicken', 'Snacks'];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ storeId?: string; storeName?: string }>();
  const { colors } = useThemeColors();
  const [term, setTerm] = useState('');
  const search = useSearch(term, params.storeId);
  const allStores = useStores();

  const hasQuery = term.trim().length > 0;
  const results = search.data?.data ?? [];

  // Store matches (only in global search, not store-scoped)
  const storeMatches = useMemo(() => {
    if (params.storeId || !hasQuery) return [];
    const q = term.trim().toLowerCase();
    return (allStores.data?.data ?? []).filter((s) => s.name.toLowerCase().includes(q));
  }, [params.storeId, hasQuery, term, allStores.data]);

  return (
    <Screen edges={['top']}>
      <View className="px-4 pb-2 pt-1">
        <Text weight="extrabold" className="mb-1 text-display text-fg">
          Search
        </Text>
        {params.storeName ? (
          <View className="mb-2 flex-row items-center gap-1.5">
            <Text className="text-meta text-muted">in</Text>
            <Badge label={params.storeName} tone="primary" />
          </View>
        ) : null}
        <SearchBar
          value={term}
          onChangeText={setTerm}
          onClear={() => setTerm('')}
          placeholder={params.storeName ? `Search ${params.storeName}` : 'Search stores and products'}
          autoFocus
        />
      </View>

      {!hasQuery ? (
        <View className="px-4 pt-4">
          <Text weight="semibold" className="mb-3 text-title text-fg">
            Popular searches
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <PressableScale key={s} onPress={() => setTerm(s)} accessibilityRole="button">
                <Badge label={s} tone="neutral" />
              </PressableScale>
            ))}
          </View>
        </View>
      ) : search.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : search.isError ? (
        <ErrorState onRetry={() => void search.refetch()} />
      ) : results.length === 0 && storeMatches.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No results"
          message={`We couldn’t find anything for “${term}”.`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingVertical: 12, paddingBottom: 24 }}
          renderItem={({ item }) => <ProductCard product={item} layout="grid" />}
          ListHeaderComponent={
            <View>
              {storeMatches.length > 0 ? (
                <View className="pb-2">
                  <Text weight="bold" className="px-4 pb-2 text-title text-fg">
                    Stores
                  </Text>
                  <View className="gap-2 px-4">
                    {storeMatches.map((s) => (
                      <StoreCard key={s.id} store={s} layout="list" />
                    ))}
                  </View>
                </View>
              ) : null}
              <Text className="px-4 pb-1 text-meta text-muted">
                {search.data?.meta.total ?? 0} product
                {(search.data?.meta.total ?? 0) === 1 ? '' : 's'}
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}
