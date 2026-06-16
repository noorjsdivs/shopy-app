import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { OrderStatus } from '@shopy/shared';
import {
  Text,
  StatusPill,
  OrderTimeline,
  Skeleton,
  ErrorState,
  PressableScale,
} from '@/components';
import { useAdminOrder, useUpdateOrderStatus } from '@/features/admin/hooks';
import { formatPrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

const ALL_STATUSES: OrderStatus[] = [
  'RECEIVED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeColors();
  const order = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();

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
          Manage order
        </Text>
      </View>

      {order.isError ? (
        <ErrorState onRetry={() => void order.refetch()} />
      ) : order.isLoading || !order.data ? (
        <View className="gap-3 p-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 16 }}>
          <View className="flex-row items-center gap-3 rounded-2xl bg-surface p-4 border border-line">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surfaceAlt">
              <Text className="text-h">{order.data.store.logo}</Text>
            </View>
            <View className="flex-1">
              <Text weight="bold" className="text-title text-fg">
                {order.data.store.name}
              </Text>
              <Text className="text-meta text-muted">
                {order.data.addressLabel ?? '—'} · {formatPrice(order.data.totalMinor)}
              </Text>
            </View>
            <StatusPill status={order.data.status} />
          </View>

          {/* Status changer */}
          <View className="rounded-2xl bg-surface p-4 border border-line">
            <Text weight="bold" className="mb-3 text-title text-fg">
              Set status
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {ALL_STATUSES.map((s) => {
                const active = order.data!.status === s;
                return (
                  <PressableScale
                    key={s}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    disabled={updateStatus.isPending}
                    onPress={() =>
                      !active &&
                      updateStatus.mutate({ id, status: s, note: 'Updated by admin' })
                    }
                    className={cn(
                      'rounded-pill border px-3.5 py-2',
                      active ? 'border-primary bg-primary' : 'border-line bg-surface',
                    )}
                  >
                    <Text
                      weight="medium"
                      className={cn('text-meta capitalize', active ? 'text-onPrimary' : 'text-fg')}
                    >
                      {s.toLowerCase()}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>

          {/* Timeline */}
          <View className="rounded-2xl bg-surface p-4 border border-line">
            <Text weight="bold" className="mb-3 text-title text-fg">
              Timeline
            </Text>
            <OrderTimeline events={order.data.events} />
          </View>

          {/* Items */}
          <View className="rounded-2xl bg-surface p-4 border border-line">
            <Text weight="bold" className="mb-2 text-title text-fg">
              Items
            </Text>
            {order.data.lines.map((l) => (
              <View key={l.productId} className="flex-row items-center justify-between py-1.5">
                <Text numberOfLines={1} className="flex-1 pr-3 text-body text-fg">
                  {l.qty} × {l.nameSnap}
                </Text>
                <Text weight="semibold" className="text-body text-fg">
                  {formatPrice(l.lineMinor)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
