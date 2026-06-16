import { useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PublicUser } from '@shopy/shared';
import {
  Text,
  SearchBar,
  Badge,
  Skeleton,
  EmptyState,
  ErrorState,
  PressableScale,
} from '@/components';
import { useAdminUsers, useUpdateUserRole } from '@/features/admin/hooks';
import { getApiErrorMessage } from '@/services/api';
import { useThemeColors } from '@/lib/colors';

export default function AdminUsersScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [search, setSearch] = useState('');
  const users = useAdminUsers({ search: search.trim() || undefined, page: 1, pageSize: 50 });
  const updateRole = useUpdateUserRole();

  const toggleRole = (user: PublicUser) => {
    const nextRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    Alert.alert('Change role', `Make ${user.email} a ${nextRole}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () =>
          updateRole.mutate(
            { id: user.id, role: nextRole },
            { onError: (e) => Alert.alert('Could not change role', getApiErrorMessage(e)) },
          ),
      },
    ]);
  };

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
        <Text weight="extrabold" className="text-h text-fg">
          Users
        </Text>
      </View>

      <View className="px-4 pb-2">
        <SearchBar value={search} onChangeText={setSearch} onClear={() => setSearch('')} placeholder="Search by name or email" />
      </View>

      {users.isError ? (
        <ErrorState onRetry={() => void users.refetch()} />
      ) : users.isLoading ? (
        <View className="gap-3 p-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </View>
      ) : (users.data?.data.length ?? 0) === 0 ? (
        <EmptyState icon="people-outline" title="No users" />
      ) : (
        <FlatList
          data={users.data?.data ?? []}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-3 rounded-2xl bg-surface p-4 border border-line">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primarySoft">
                <Text weight="bold" className="text-title text-primary">
                  {(item.name ?? item.email).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text weight="semibold" numberOfLines={1} className="text-body text-fg">
                  {item.name ?? 'Customer'}
                </Text>
                <Text numberOfLines={1} className="text-meta text-muted">
                  {item.email}
                </Text>
              </View>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={`Change role for ${item.email}`}
                onPress={() => toggleRole(item)}
              >
                <Badge label={item.role} tone={item.role === 'ADMIN' ? 'primary' : 'neutral'} />
              </PressableScale>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
