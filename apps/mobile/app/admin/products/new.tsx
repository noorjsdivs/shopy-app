import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, PressableScale } from '@/components';
import { ProductForm } from '@/features/admin/ProductForm';
import { useCreateProduct } from '@/features/admin/hooks';
import { getApiErrorMessage } from '@/services/api';
import { useThemeColors } from '@/lib/colors';

export default function NewProductScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const createProduct = useCreateProduct();
  const [error, setError] = useState<string | null>(null);

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
        <Text weight="extrabold" className="text-h text-fg">
          New product
        </Text>
      </View>
      <ProductForm
        submitLabel="Create product"
        submitting={createProduct.isPending}
        serverError={error}
        onSubmit={(input) => {
          setError(null);
          createProduct.mutate(input, {
            onSuccess: () => router.back(),
            onError: (e) => setError(getApiErrorMessage(e)),
          });
        }}
      />
    </SafeAreaView>
  );
}
