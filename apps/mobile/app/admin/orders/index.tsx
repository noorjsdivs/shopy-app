import { useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { OrderStatus } from '@shopy/shared';
import {
  Text,
  StatusPill,
  AdminListRow,
  Skeleton,
  EmptyState,
  ErrorState,
  PressableScale,
} from '@/components';
import { useAdminOrders } from '@/features/admin/hooks';
import { formatPrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

const STATUSES: (OrderStatus | 'ALL')[] = [
  'ALL',
  'RECEIVED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const orders = useAdminOrders({
    status: status === 'ALL' ? undefined : status,
    page: 1,
    pageSize: 50,
  });

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
          Orders
        </Text>
      </View>

      <View className="py-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {STATUSES.map((s) => (
            <PressableScale
              key={s}
              accessibilityRole="button"
              accessibilityState={{ selected: status === s }}
              onPress={() => setStatus(s)}
              className={cn(
                'rounded-pill border px-3.5 py-1.5',
                status === s ? 'border-primary bg-primary' : 'border-line bg-surface',
              )}
            >
              <Text weight="medium" className={cn('text-meta capitalize', status === s ? 'text-onPrimary' : 'text-fg')}>
                {s === 'ALL' ? 'All' : s.toLowerCase()}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>
      </View>

      {orders.isError ? (
        <ErrorState onRetry={() => void orders.refetch()} />
      ) : orders.isLoading ? (
        <View className="gap-3 p-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </View>
      ) : (orders.data?.data.length ?? 0) === 0 ? (
        <EmptyState icon="receipt-outline" title="No orders" />
      ) : (
        <FlatList
          data={orders.data?.data ?? []}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.store.name}
              emoji={item.store.logo}
              subtitle={`${format(parseISO(item.createdAt), 'MMM d, h:mm a')} · ${item.itemCount} items`}
              onPress={() => router.push({ pathname: '/admin/orders/[id]', params: { id: item.id } })}
              right={
                <View className="items-end gap-1">
                  <StatusPill status={item.status} />
                  <Text weight="bold" className="text-meta text-fg">
                    {formatPrice(item.totalMinor)}
                  </Text>
                </View>
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
