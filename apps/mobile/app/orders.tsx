import { FlatList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  StatusPill,
  Skeleton,
  EmptyState,
  ErrorState,
  PressableScale,
} from '@/components';
import { useAuth } from '@/store/auth';
import { useAuthGate } from '@/features/auth';
import { useOrders } from '@/features/orders/hooks';
import { formatPrice } from '@/lib/money';
import { useThemeColors } from '@/lib/colors';

export default function OrdersScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const status = useAuth((s) => s.status);
  const { requireAuth } = useAuthGate();
  const orders = useOrders();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          className="h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt"
        >
          <Ionicons name="chevron-back" size={22} color={colors.fg} />
        </PressableScale>
        <Text weight="extrabold" className="text-h text-fg">
          Your orders
        </Text>
      </View>

      {status !== 'authed' ? (
        <EmptyState
          icon="lock-closed-outline"
          title="Sign in to see your orders"
          message="Your order history is tied to your account."
          actionLabel="Sign in"
          onAction={() => requireAuth(() => {}, 'Sign in to view your orders')}
        />
      ) : orders.isLoading ? (
        <View className="gap-3 p-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </View>
      ) : orders.isError ? (
        <ErrorState onRetry={() => void orders.refetch()} />
      ) : (orders.data?.data.length ?? 0) === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No orders yet"
          message="When you place an order, it’ll show up here."
          actionLabel="Start shopping"
          onAction={() => router.replace('/')}
        />
      ) : (
        <FlatList
          data={orders.data?.data ?? []}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`Order from ${item.store.name}, ${item.status}, ${formatPrice(item.totalMinor)}`}
              onPress={() => router.push({ pathname: '/order/[id]', params: { id: item.id } })}
              className="rounded-2xl bg-surface p-4 border border-line"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surfaceAlt">
                  <Text className="text-title">{item.store.logo}</Text>
                </View>
                <View className="flex-1">
                  <Text weight="bold" numberOfLines={1} className="text-title text-fg">
                    {item.store.name}
                  </Text>
                  <Text className="text-meta text-muted">
                    {format(parseISO(item.createdAt), 'MMM d, h:mm a')} · {item.itemCount} item
                    {item.itemCount === 1 ? '' : 's'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.faint} />
              </View>
              <View className="mt-3 flex-row items-center justify-between">
                <StatusPill status={item.status} />
                <Text weight="bold" className="text-title text-fg">
                  {formatPrice(item.totalMinor)}
                </Text>
              </View>
            </PressableScale>
          )}
        />
      )}
    </SafeAreaView>
  );
}
