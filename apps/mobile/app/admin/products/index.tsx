import { useState } from 'react';
import { FlatList, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  SearchBar,
  AdminListRow,
  Skeleton,
  EmptyState,
  ErrorState,
  PressableScale,
} from '@/components';
import { useAdminProducts, useUpdateProduct } from '@/features/admin/hooks';
import { formatPrice } from '@/lib/money';
import { useThemeColors } from '@/lib/colors';

export default function AdminProductsScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [search, setSearch] = useState('');
  const products = useAdminProducts({ search: search.trim() || undefined, page: 1, pageSize: 50 });
  const updateProduct = useUpdateProduct();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt"
        >
          <Ionicons name="chevron-back" size={22} color={colors.fg} />
        </PressableScale>
        <Text weight="extrabold" className="flex-1 text-h text-fg">
          Products
        </Text>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="New product"
          onPress={() => router.push('/admin/products/new')}
          className="h-10 flex-row items-center gap-1 rounded-full bg-primary px-4"
        >
          <Ionicons name="add" size={18} color={colors.onPrimary} />
          <Text weight="semibold" className="text-meta text-onPrimary">
            New
          </Text>
        </PressableScale>
      </View>

      <View className="px-4 pb-2">
        <SearchBar value={search} onChangeText={setSearch} onClear={() => setSearch('')} placeholder="Search products" />
      </View>

      {products.isError ? (
        <ErrorState onRetry={() => void products.refetch()} />
      ) : products.isLoading ? (
        <View className="gap-3 p-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </View>
      ) : (products.data?.data.length ?? 0) === 0 ? (
        <EmptyState icon="cube-outline" title="No products" />
      ) : (
        <FlatList
          data={products.data?.data ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.name}
              subtitle={`${formatPrice(item.priceMinor)} · ${item.store?.name ?? ''} · ${item.department.name}`}
              image={item.image}
              inactive={!item.isActive}
              onPress={() => router.push({ pathname: '/admin/products/[id]', params: { id: item.id } })}
              right={
                <Switch
                  value={item.isActive}
                  onValueChange={(val) =>
                    updateProduct.mutate({ id: item.id, input: { isActive: val } })
                  }
                  trackColor={{ true: colors.primary, false: colors.line }}
                  accessibilityLabel={`${item.name} active`}
                />
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
