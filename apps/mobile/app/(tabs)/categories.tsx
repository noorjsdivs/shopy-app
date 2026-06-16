import { useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Screen,
  Text,
  StoreCard,
  Skeleton,
  EmptyState,
  ErrorState,
  PressableScale,
} from '@/components';
import { useCategories, useStores } from '@/features/catalog/hooks';
import { cn } from '@/lib/cn';

export default function CategoriesScreen() {
  const params = useLocalSearchParams<{ focus?: string }>();
  const categories = useCategories();
  const [selected, setSelected] = useState<string | undefined>(params.focus);
  const stores = useStores(selected);

  return (
    <Screen edges={['top']}>
      <View className="px-4 pb-1 pt-1">
        <Text weight="extrabold" className="text-display text-fg">
          Categories
        </Text>
      </View>

      {/* Category chips */}
      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <Chip label="All" active={!selected} onPress={() => setSelected(undefined)} />
          {categories.data?.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              active={selected === c.slug}
              onPress={() => setSelected(c.slug)}
            />
          ))}
        </ScrollView>
      </View>

      {stores.isLoading ? (
        <View className="gap-3 px-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </View>
      ) : stores.isError ? (
        <ErrorState onRetry={() => void stores.refetch()} />
      ) : (stores.data?.data.length ?? 0) === 0 ? (
        <EmptyState icon="storefront-outline" title="No stores here yet" />
      ) : (
        <FlatList
          data={stores.data?.data ?? []}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 24 }}
          renderItem={({ item }) => <StoreCard store={item} layout="list" />}
        />
      )}
    </Screen>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={cn(
        'rounded-pill border px-4 py-2',
        active ? 'border-primary bg-primary' : 'border-line bg-surface',
      )}
    >
      <Text
        weight="semibold"
        className={cn('text-meta', active ? 'text-onPrimary' : 'text-fg')}
      >
        {label}
      </Text>
    </PressableScale>
  );
}
