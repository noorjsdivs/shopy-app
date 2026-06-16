import { FlatList, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  AdminListRow,
  Skeleton,
  EmptyState,
  ErrorState,
  PressableScale,
} from '@/components';
import { useAdminStores, useUpdateStore } from '@/features/admin/hooks';
import { useThemeColors } from '@/lib/colors';

export default function AdminStoresScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const stores = useAdminStores();
  const updateStore = useUpdateStore();

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
          Stores
        </Text>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="New store"
          onPress={() => router.push('/admin/stores/new')}
          className="h-10 flex-row items-center gap-1 rounded-full bg-primary px-4"
        >
          <Ionicons name="add" size={18} color={colors.onPrimary} />
          <Text weight="semibold" className="text-meta text-onPrimary">
            New
          </Text>
        </PressableScale>
      </View>

      {stores.isError ? (
        <ErrorState onRetry={() => void stores.refetch()} />
      ) : stores.isLoading ? (
        <View className="gap-3 p-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </View>
      ) : (stores.data?.length ?? 0) === 0 ? (
        <EmptyState icon="storefront-outline" title="No stores" />
      ) : (
        <FlatList
          data={stores.data ?? []}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.name}
              emoji={item.logo}
              subtitle={`${item.category.name} · ${item._count.products} products · ${item._count.orders} orders`}
              inactive={!item.isActive}
              onPress={() => router.push({ pathname: '/admin/stores/[id]', params: { id: item.id } })}
              right={
                <Switch
                  value={item.isActive}
                  onValueChange={(val) => updateStore.mutate({ id: item.id, input: { isActive: val } })}
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
