import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { ReplacementPreference } from '@shopy/shared';
import {
  Screen,
  Text,
  Button,
  QtyStepper,
  EmptyState,
  PriceTag,
  PressableScale,
} from '@/components';
import { useShallow } from 'zustand/react/shallow';
import { useCart, selectItemList, type CartItem } from '@/store/cart';
import { computeTotals } from '@/lib/cart';
import { formatPrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import { useAuthGate } from '@/features/auth';

const REPLACEMENTS: { key: ReplacementPreference; label: string }[] = [
  { key: 'BEST_MATCH', label: 'Best match' },
  { key: 'REFUND', label: 'Refund item' },
];

export default function CartScreen() {
  const router = useRouter();
  const { requireAuth } = useAuthGate();
  const items = useCart(useShallow(selectItemList));
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const setReplacement = useCart((s) => s.setReplacement);

  const subtotal = useMemo(
    () => items.reduce((n, i) => n + i.priceMinor * i.qty, 0),
    [items],
  );
  const totals = computeTotals(subtotal);

  // Group by store
  const groups = useMemo(() => {
    const map = new Map<string, CartItem[]>();
    items.forEach((i) => {
      const arr = map.get(i.storeId) ?? [];
      arr.push(i);
      map.set(i.storeId, arr);
    });
    return [...map.values()];
  }, [items]);

  if (items.length === 0) {
    return (
      <Screen edges={['top']}>
        <View className="px-4 pt-1">
          <Text weight="extrabold" className="text-display text-fg">
            Cart
          </Text>
        </View>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          message="Browse stores and add items — no account needed."
          actionLabel="Start shopping"
          onAction={() => router.push('/')}
        />
      </Screen>
    );
  }

  const goToCheckout = () => router.push('/checkout');

  return (
    <Screen edges={['top']}>
      <View className="px-4 pb-2 pt-1">
        <Text weight="extrabold" className="text-display text-fg">
          Cart
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 16, gap: 16 }}
      >
        {/* Free-delivery meter */}
        <View className="rounded-2xl bg-surface p-4 border border-line">
          <Text className="text-meta text-muted">
            {totals.amountToFreeDeliveryMinor > 0
              ? `Spend ${formatPrice(totals.amountToFreeDeliveryMinor)} more for free delivery`
              : 'You’ve unlocked free delivery! 🎉'}
          </Text>
          <View className="mt-2 h-2 overflow-hidden rounded-full bg-surfaceAlt">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.round(totals.freeDeliveryProgress * 100)}%` }}
            />
          </View>
        </View>

        {groups.map((group) => (
          <View key={group[0].storeId} className="rounded-2xl bg-surface p-3 border border-line">
            <View className="mb-1 flex-row items-center gap-2 px-1">
              <Text className="text-title">{group[0].storeLogo}</Text>
              <Text weight="bold" className="text-title text-fg">
                {group[0].storeName}
              </Text>
            </View>
            {group.map((item) => (
              <View key={item.productId} className="py-2">
                <View className="flex-row items-center gap-3">
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 56, height: 56, borderRadius: 12 }}
                    contentFit="cover"
                  />
                  <View className="flex-1">
                    <Text weight="semibold" numberOfLines={1} className="text-body text-fg">
                      {item.name}
                    </Text>
                    <Text className="text-meta text-muted">{item.size ?? item.brand ?? ''}</Text>
                    <PriceTag
                      priceMinor={item.priceMinor * item.qty}
                      size="sm"
                      className="mt-0.5"
                    />
                  </View>
                  <QtyStepper
                    qty={item.qty}
                    onIncrement={() => increment(item.productId)}
                    onDecrement={() => decrement(item.productId)}
                  />
                </View>
                {/* Replacement preference */}
                <View className="mt-2 flex-row items-center gap-2 pl-[68px]">
                  <Text className="text-[11px] text-faint">If out of stock:</Text>
                  {REPLACEMENTS.map((r) => (
                    <PressableScale
                      key={r.key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: item.replacement === r.key }}
                      onPress={() => setReplacement(item.productId, r.key)}
                      className={cn(
                        'rounded-pill border px-2.5 py-1',
                        item.replacement === r.key ? 'border-primary bg-primarySoft' : 'border-line',
                      )}
                    >
                      <Text
                        className={cn(
                          'text-[11px]',
                          item.replacement === r.key ? 'text-primary' : 'text-muted',
                        )}
                      >
                        {r.label}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Summary */}
        <View className="rounded-2xl bg-surface p-4 border border-line">
          <SummaryRow label="Subtotal" value={formatPrice(totals.subtotalMinor)} />
          <SummaryRow label="Service fee" value={formatPrice(totals.serviceFeeMinor)} />
          <SummaryRow
            label="Delivery"
            value={totals.deliveryFeeMinor === 0 ? 'Free' : formatPrice(totals.deliveryFeeMinor)}
          />
          <View className="my-2 h-px bg-line" />
          <SummaryRow label="Total" value={formatPrice(totals.totalMinor)} bold />
        </View>
      </ScrollView>

      {/* Sticky checkout */}
      <View className="border-t border-line bg-surface px-4 pb-6 pt-3">
        <Button
          title={`Go to checkout · ${formatPrice(totals.totalMinor)}`}
          block
          onPress={() => requireAuth(goToCheckout, 'Sign in to place your order')}
        />
      </View>
    </Screen>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text weight={bold ? 'bold' : 'regular'} className={bold ? 'text-title text-fg' : 'text-body text-muted'}>
        {label}
      </Text>
      <Text weight={bold ? 'bold' : 'semibold'} className={bold ? 'text-title text-fg' : 'text-body text-fg'}>
        {value}
      </Text>
    </View>
  );
}
