import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Skeleton, EmptyState, PressableScale } from '@/components';
import { StoreForm } from '@/features/admin/StoreForm';
import {
  useAdminStores,
  useUpdateStore,
  useDeleteStore,
} from '@/features/admin/hooks';
import { getApiErrorMessage } from '@/services/api';
import { useThemeColors } from '@/lib/colors';

export default function EditStoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeColors();
  const stores = useAdminStores();
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();
  const [error, setError] = useState<string | null>(null);

  const store = stores.data?.find((s) => s.id === id);

  const confirmDelete = () => {
    Alert.alert('Delete store', 'This hides it from the storefront (soft delete).', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteStore.mutate(id, {
            onSuccess: () => router.back(),
            onError: (e) => setError(getApiErrorMessage(e)),
          }),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pb-1 pt-1">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt"
        >
          <Ionicons name="chevron-back" size={22} color={colors.fg} />
        </PressableScale>
        <Text weight="extrabold" className="flex-1 text-h text-fg">
          Edit store
        </Text>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Delete store"
          onPress={confirmDelete}
          className="h-10 w-10 items-center justify-center rounded-full bg-dealSoft"
        >
          <Ionicons name="trash-outline" size={20} color={colors.deal} />
        </PressableScale>
      </View>

      {stores.isLoading ? (
        <View className="gap-3 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </View>
      ) : !store ? (
        <EmptyState icon="storefront-outline" title="Store not found" />
      ) : (
        <StoreForm
          initial={store}
          submitLabel="Save changes"
          submitting={updateStore.isPending}
          serverError={error}
          onSubmit={(input) => {
            setError(null);
            updateStore.mutate(
              { id, input },
              {
                onSuccess: () => router.back(),
                onError: (e) => setError(getApiErrorMessage(e)),
              },
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
