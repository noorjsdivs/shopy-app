import { RefreshControl, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { OrderStatus } from '@shopy/shared';
import {
  Text,
  MetricCard,
  MiniBarChart,
  StatusPill,
  AdminListRow,
  Skeleton,
  ErrorState,
  PressableScale,
} from '@/components';
import { useMetrics } from '@/features/admin/hooks';
import { formatPrice } from '@/lib/money';
import { useThemeColors } from '@/lib/colors';

const MANAGE = [
  { label: 'Products', icon: 'cube-outline' as const, href: '/admin/products' as const },
  { label: 'Orders', icon: 'receipt-outline' as const, href: '/admin/orders' as const },
  { label: 'Stores', icon: 'storefront-outline' as const, href: '/admin/stores' as const },
  { label: 'Users', icon: 'people-outline' as const, href: '/admin/users' as const },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const metrics = useMetrics();
  const m = metrics.data;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Back to app"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          className="h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt"
        >
          <Ionicons name="chevron-back" size={22} color={colors.fg} />
        </PressableScale>
        <Text weight="extrabold" className="text-h text-fg">
          Admin Dashboard
        </Text>
      </View>

      {metrics.isError ? (
        <ErrorState onRetry={() => void metrics.refetch()} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={metrics.isRefetching}
              onRefresh={() => void metrics.refetch()}
              tintColor={colors.primary}
            />
          }
        >
          {metrics.isLoading || !m ? (
            <>
              <View className="flex-row gap-3">
                <Skeleton className="h-28 flex-1" />
                <Skeleton className="h-28 flex-1" />
              </View>
              <Skeleton className="h-48 w-full" />
            </>
          ) : (
            <>
              {/* Metric cards */}
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <MetricCard
                    icon="cash-outline"
                    label="Revenue"
                    value={formatPrice(m.totals.revenueMinor)}
                    highlight
                    className="flex-1"
                  />
                  <MetricCard
                    icon="receipt-outline"
                    label="Orders"
                    value={`${m.totals.orders}`}
                    className="flex-1"
                  />
                </View>
                <View className="flex-row gap-3">
                  <MetricCard icon="cube-outline" label="Products" value={`${m.totals.products}`} className="flex-1" />
                  <MetricCard icon="storefront-outline" label="Stores" value={`${m.totals.stores}`} className="flex-1" />
                  <MetricCard icon="people-outline" label="Customers" value={`${m.totals.customers}`} className="flex-1" />
                </View>
              </View>

              {/* Revenue chart */}
              <MiniBarChart data={m.revenueByDay} />

              {/* Orders by status */}
              <View className="rounded-2xl bg-surface p-4 border border-line">
                <Text weight="bold" className="mb-3 text-title text-fg">
                  Orders by status
                </Text>
                <View className="flex-row flex-wrap gap-x-4 gap-y-2">
                  {(Object.entries(m.ordersByStatus) as [OrderStatus, number][]).map(([status, count]) => (
                    <View key={status} className="flex-row items-center gap-1.5">
                      <StatusPill status={status} />
                      <Text weight="bold" className="text-meta text-fg">
                        {count}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Manage */}
              <View className="gap-2">
                <Text weight="bold" className="text-title text-fg">
                  Manage
                </Text>
                {MANAGE.map((item) => (
                  <AdminListRow
                    key={item.label}
                    title={item.label}
                    onPress={() => router.push(item.href)}
                    right={
                      <View className="flex-row items-center gap-2">
                        <Ionicons name={item.icon} size={18} color={colors.muted} />
                        <Ionicons name="chevron-forward" size={18} color={colors.faint} />
                      </View>
                    }
                  />
                ))}
              </View>

              {/* Recent orders */}
              {m.recentOrders.length > 0 ? (
                <View className="gap-2">
                  <Text weight="bold" className="text-title text-fg">
                    Recent orders
                  </Text>
                  {m.recentOrders.map((o) => (
                    <AdminListRow
                      key={o.id}
                      title={o.store.name}
                      emoji={o.store.logo}
                      subtitle={`${format(parseISO(o.createdAt), 'MMM d')} · ${o.itemCount} items`}
                      onPress={() => router.push({ pathname: '/admin/orders/[id]', params: { id: o.id } })}
                      right={
                        <View className="items-end gap-1">
                          <StatusPill status={o.status} />
                          <Text weight="bold" className="text-meta text-fg">
                            {formatPrice(o.totalMinor)}
                          </Text>
                        </View>
                      }
                    />
                  ))}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
