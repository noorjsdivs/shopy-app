import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import {
  Text,
  Button,
  StatusPill,
  OrderTimeline,
  Skeleton,
  ErrorState,
  PressableScale,
} from '@/components';
import { useOrder } from '@/features/orders/hooks';
import { catalogApi } from '@/services/api';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/money';
import { useThemeColors } from '@/lib/colors';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeColors();
  const order = useOrder(id);
  const qc = useQueryClient();
  const add = useCart((s) => s.add);
  const [reordering, setReordering] = useState(false);

  const buyAgain = async () => {
    if (!order.data) return;
    setReordering(true);
    try {
      for (const line of order.data.lines) {
        const product = await qc.fetchQuery({
          queryKey: ['product', line.productId],
          queryFn: () => catalogApi.getProduct(line.productId),
        });
        add(product, line.qty);
      }
      router.push('/cart');
    } finally {
      setReordering(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/orders'))}
          className="h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt"
        >
          <Ionicons name="chevron-back" size={22} color={colors.fg} />
        </PressableScale>
        <Text weight="extrabold" className="text-h text-fg">
          Order
        </Text>
      </View>

      {order.isError ? (
        <ErrorState onRetry={() => void order.refetch()} />
      ) : order.isLoading || !order.data ? (
        <View className="gap-3 p-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 16 }}>
          {/* Store + status */}
          <View className="flex-row items-center gap-3 rounded-2xl bg-surface p-4 border border-line">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surfaceAlt">
              <Text className="text-h">{order.data.store.logo}</Text>
            </View>
            <View className="flex-1">
              <Text weight="bold" className="text-title text-fg">
                {order.data.store.name}
              </Text>
              <Text className="text-meta text-muted">
                {order.data.mode === 'DELIVERY' ? 'Delivery' : 'Pickup'} ·{' '}
                {order.data.addressLabel ?? '—'} · ETA {order.data.etaMinutes} min
              </Text>
            </View>
            <StatusPill status={order.data.status} />
          </View>

          {/* Timeline */}
          <View className="rounded-2xl bg-surface p-4 border border-line">
            <Text weight="bold" className="mb-3 text-title text-fg">
              Status
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
                <View className="flex-1 pr-3">
                  <Text numberOfLines={1} className="text-body text-fg">
                    {l.nameSnap}
                  </Text>
                  <Text className="text-meta text-muted">
                    {l.qty} × {formatPrice(l.unitMinor)}
                    {l.byWeight ? ' /lb' : ''}
                  </Text>
                </View>
                <Text weight="semibold" className="text-body text-fg">
                  {formatPrice(l.lineMinor)}
                </Text>
              </View>
            ))}
            <View className="my-2 h-px bg-line" />
            <Row label="Subtotal" value={formatPrice(order.data.subtotalMinor)} />
            <Row label="Service fee" value={formatPrice(order.data.serviceFeeMinor)} />
            <Row
              label="Delivery"
              value={order.data.deliveryFeeMinor === 0 ? 'Free' : formatPrice(order.data.deliveryFeeMinor)}
            />
            <Row label="Tip" value={formatPrice(order.data.tipMinor)} />
            <View className="my-1 h-px bg-line" />
            <Row label="Total" value={formatPrice(order.data.totalMinor)} bold />
          </View>

          <Button
            title="Buy it again"
            variant="secondary"
            block
            loading={reordering}
            onPress={() => void buyAgain()}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-0.5">
      <Text weight={bold ? 'bold' : 'regular'} className={bold ? 'text-title text-fg' : 'text-body text-muted'}>
        {label}
      </Text>
      <Text weight={bold ? 'bold' : 'semibold'} className={bold ? 'text-title text-fg' : 'text-body text-fg'}>
        {value}
      </Text>
    </View>
  );
}
