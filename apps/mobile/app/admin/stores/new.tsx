import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, PressableScale } from '@/components';
import { StoreForm } from '@/features/admin/StoreForm';
import { useCreateStore } from '@/features/admin/hooks';
import { getApiErrorMessage } from '@/services/api';
import { useThemeColors } from '@/lib/colors';

export default function NewStoreScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const createStore = useCreateStore();
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
          New store
        </Text>
      </View>
      <StoreForm
        submitLabel="Create store"
        submitting={createStore.isPending}
        serverError={error}
        onSubmit={(input) => {
          setError(null);
          createStore.mutate(input, {
            onSuccess: () => router.back(),
            onError: (e) => setError(getApiErrorMessage(e)),
          });
        }}
      />
    </SafeAreaView>
  );
}
