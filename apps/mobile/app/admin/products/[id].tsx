import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Skeleton, ErrorState, PressableScale } from '@/components';
import { ProductForm } from '@/features/admin/ProductForm';
import {
  useAdminProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/features/admin/hooks';
import { getApiErrorMessage } from '@/services/api';
import { useThemeColors } from '@/lib/colors';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeColors();
  const product = useAdminProduct(id);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = () => {
    Alert.alert('Delete product', 'This hides it from the storefront (soft delete).', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteProduct.mutate(id, {
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
          Edit product
        </Text>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Delete product"
          onPress={confirmDelete}
          className="h-10 w-10 items-center justify-center rounded-full bg-dealSoft"
        >
          <Ionicons name="trash-outline" size={20} color={colors.deal} />
        </PressableScale>
      </View>

      {product.isError ? (
        <ErrorState onRetry={() => void product.refetch()} />
      ) : product.isLoading || !product.data ? (
        <View className="gap-3 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
        </View>
      ) : (
        <ProductForm
          initial={product.data}
          submitLabel="Save changes"
          submitting={updateProduct.isPending}
          serverError={error}
          onSubmit={(input) => {
            setError(null);
            updateProduct.mutate(
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
