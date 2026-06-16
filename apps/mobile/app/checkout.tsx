import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import type { CreateOrderPayload, OrderDetail, ReplacementPreference } from '@shopy/shared';
import { useShallow } from 'zustand/react/shallow';
import { Text, Button, PressableScale } from '@/components';
import { useCart, selectItemList, type CartItem } from '@/store/cart';
import { computeTotals } from '@/lib/cart';
import { formatPrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';
import { useAuthGate } from '@/features/auth';
import { useCreateOrder } from '@/features/orders/hooks';
import { getApiErrorMessage, isPaymentDeclined } from '@/services/api';

const STEPS = ['Address', 'Tip', 'Payment', 'Review'] as const;

const ADDRESSES = [
  { label: 'Home', line: '742 Evergreen Terrace, Springfield' },
  { label: 'Work', line: '500 Market St, Springfield' },
];
const TIPS = [
  { label: 'No tip', pct: 0 },
  { label: '10%', pct: 0.1 },
  { label: '15%', pct: 0.15 },
  { label: '20%', pct: 0.2 },
];
const CARDS = [
  { id: 'approve', brand: 'Demo Visa', last4: '4242', forceDecline: false },
  { id: 'decline', brand: 'Demo card', last4: '0002', forceDecline: true },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const { requireAuth } = useAuthGate();
  const items = useCart(useShallow(selectItemList));
  const clear = useCart((s) => s.clear);
  const createOrder = useCreateOrder();

  const [step, setStep] = useState(0);
  const [addressLabel, setAddressLabel] = useState(ADDRESSES[0].label);
  const [tipPct, setTipPct] = useState(0.15);
  const [cardId, setCardId] = useState('approve');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((n, i) => n + i.priceMinor * i.qty, 0),
    [items],
  );
  const tipMinor = Math.round(subtotal * tipPct);
  const totals = computeTotals(subtotal, tipMinor);

  const groups = useMemo(() => {
    const map = new Map<string, CartItem[]>();
    items.forEach((i) => {
      const arr = map.get(i.storeId) ?? [];
      arr.push(i);
      map.set(i.storeId, arr);
    });
    return [...map.values()];
  }, [items]);

  if (items.length === 0 && !success) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-bg px-8">
        <Text weight="bold" className="text-h text-fg">
          Your cart is empty
        </Text>
        <Button title="Back to shopping" className="mt-4" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  const doPlaceOrder = async () => {
    setError(null);
    const card = CARDS.find((c) => c.id === cardId)!;
    try {
      const placed: OrderDetail[] = [];
      for (const group of groups) {
        const storeSubtotal = group.reduce((n, i) => n + i.priceMinor * i.qty, 0);
        const payload: CreateOrderPayload = {
          storeId: group[0].storeId,
          mode: 'DELIVERY',
          slotLabel: 'Today, ASAP',
          addressLabel,
          tipMinor: Math.round(storeSubtotal * tipPct),
          items: group.map((i) => ({
            productId: i.productId,
            qty: i.qty,
            replacement: i.replacement as ReplacementPreference,
          })),
          payment: { method: 'demo-card', forceDecline: card.forceDecline },
        };
        const order = await createOrder.mutateAsync(payload);
        placed.push(order);
      }
      clear();
      setSuccess(true);
      setTimeout(() => {
        router.replace({ pathname: '/order/[id]', params: { id: placed[0].id } });
      }, 1300);
    } catch (e) {
      setError(
        isPaymentDeclined(e)
          ? 'Payment declined. Try a different card.'
          : getApiErrorMessage(e),
      );
      setStep(2);
    }
  };

  const placeOrder = () =>
    requireAuth(() => {
      void doPlaceOrder();
    }, 'Sign in to place your order');

  if (success) return <SuccessOverlay />;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => (step > 0 ? setStep(step - 1) : router.back())}
          className="h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt"
        >
          <Ionicons name="chevron-back" size={22} color={colors.fg} />
        </PressableScale>
        <Text weight="extrabold" className="text-h text-fg">
          Checkout
        </Text>
      </View>

      {/* Step indicator */}
      <View className="flex-row gap-1.5 px-4 py-3">
        {STEPS.map((label, i) => (
          <View key={label} className="flex-1 items-center gap-1">
            <View
              className={cn(
                'h-1.5 w-full rounded-full',
                i <= step ? 'bg-primary' : 'bg-surfaceAlt',
              )}
            />
            <Text
              className={cn('text-[11px]', i === step ? 'text-primary' : 'text-faint')}
              weight={i === step ? 'semibold' : 'regular'}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 16 }}>
        {step === 0 ? (
          <Section title="Delivery address">
            {ADDRESSES.map((a) => (
              <SelectRow
                key={a.label}
                title={a.label}
                subtitle={a.line}
                selected={addressLabel === a.label}
                onPress={() => setAddressLabel(a.label)}
                icon="location-outline"
              />
            ))}
          </Section>
        ) : null}

        {step === 1 ? (
          <Section title="Add a tip" subtitle="100% goes to your shopper">
            <View className="flex-row flex-wrap gap-2">
              {TIPS.map((t) => (
                <PressableScale
                  key={t.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: tipPct === t.pct }}
                  onPress={() => setTipPct(t.pct)}
                  className={cn(
                    'rounded-2xl border px-5 py-3',
                    tipPct === t.pct ? 'border-primary bg-primarySoft' : 'border-line bg-surface',
                  )}
                >
                  <Text
                    weight="bold"
                    className={cn('text-title', tipPct === t.pct ? 'text-primary' : 'text-fg')}
                  >
                    {t.label}
                  </Text>
                  {t.pct > 0 ? (
                    <Text className="text-meta text-muted">
                      {formatPrice(Math.round(subtotal * t.pct))}
                    </Text>
                  ) : null}
                </PressableScale>
              ))}
            </View>
          </Section>
        ) : null}

        {step === 2 ? (
          <Section title="Payment" subtitle="Demo only — no real card data is collected">
            {CARDS.map((c) => (
              <SelectRow
                key={c.id}
                title={`${c.brand} •••• ${c.last4}`}
                subtitle={c.forceDecline ? 'Simulates a decline' : 'Simulates approval'}
                selected={cardId === c.id}
                onPress={() => setCardId(c.id)}
                icon="card-outline"
              />
            ))}
            {error ? (
              <Text className="mt-2 text-meta text-deal" accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}
          </Section>
        ) : null}

        {step === 3 ? (
          <Section title="Review">
            <View className="gap-3 rounded-2xl bg-surface p-4 border border-line">
              <ReviewRow icon="location-outline" label="Deliver to" value={addressLabel} />
              <ReviewRow
                icon="card-outline"
                label="Payment"
                value={`${CARDS.find((c) => c.id === cardId)!.brand} •••• ${CARDS.find((c) => c.id === cardId)!.last4}`}
              />
              <ReviewRow
                icon="bag-handle-outline"
                label="Items"
                value={`${items.reduce((n, i) => n + i.qty, 0)} from ${groups.length} store${groups.length > 1 ? 's' : ''}`}
              />
            </View>
            <View className="mt-3 gap-1 rounded-2xl bg-surface p-4 border border-line">
              <SummaryRow label="Subtotal" value={formatPrice(totals.subtotalMinor)} />
              <SummaryRow label="Service fee" value={formatPrice(totals.serviceFeeMinor)} />
              <SummaryRow
                label="Delivery"
                value={totals.deliveryFeeMinor === 0 ? 'Free' : formatPrice(totals.deliveryFeeMinor)}
              />
              <SummaryRow label="Tip" value={formatPrice(totals.tipMinor)} />
              <View className="my-1 h-px bg-line" />
              <SummaryRow label="Total" value={formatPrice(totals.totalMinor)} bold />
            </View>
            {error ? (
              <Text className="mt-2 text-meta text-deal">{error}</Text>
            ) : null}
          </Section>
        ) : null}
      </ScrollView>

      {/* Footer CTA */}
      <View className="border-t border-line bg-surface px-4 pb-8 pt-3">
        {step < 3 ? (
          <Button title="Continue" block onPress={() => setStep(step + 1)} />
        ) : (
          <Button
            title={`Place order · ${formatPrice(totals.totalMinor)}`}
            block
            loading={createOrder.isPending}
            onPress={placeOrder}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function SuccessOverlay() {
  const { colors } = useThemeColors();
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) scale.value = withSpring(1, { damping: 12 });
  }, [reduced, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <View className="flex-1 items-center justify-center bg-bg px-8">
      <Animated.View
        style={style}
        className="h-24 w-24 items-center justify-center rounded-full bg-success"
      >
        <Ionicons name="checkmark" size={56} color={colors.onPrimary} />
      </Animated.View>
      <Animated.Text entering={reduced ? undefined : FadeIn.delay(150)}>
        <Text weight="extrabold" className="mt-6 text-h text-fg">
          Order placed!
        </Text>
      </Animated.Text>
      <Text className="mt-1 text-body text-muted">Taking you to your order…</Text>
    </View>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View>
        <Text weight="extrabold" className="text-h text-fg">
          {title}
        </Text>
        {subtitle ? <Text className="mt-0.5 text-meta text-muted">{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function SelectRow({
  title,
  subtitle,
  selected,
  onPress,
  icon,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useThemeColors();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border p-4',
        selected ? 'border-primary bg-primarySoft' : 'border-line bg-surface',
      )}
    >
      <Ionicons name={icon} size={22} color={selected ? colors.primary : colors.muted} />
      <View className="flex-1">
        <Text weight="semibold" className="text-body text-fg">
          {title}
        </Text>
        <Text className="text-meta text-muted">{subtitle}</Text>
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={selected ? colors.primary : colors.faint}
      />
    </PressableScale>
  );
}

function ReviewRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useThemeColors();
  return (
    <View className="flex-row items-center gap-3">
      <Ionicons name={icon} size={18} color={colors.muted} />
      <Text className="flex-1 text-meta text-muted">{label}</Text>
      <Text weight="semibold" className="text-body text-fg">
        {value}
      </Text>
    </View>
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
