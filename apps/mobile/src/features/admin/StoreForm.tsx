import { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import type { AdminStore } from '@shopy/shared';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { PressableScale } from '@/components/PressableScale';
import { useCategories } from '@/features/catalog/hooks';
import type { StoreInput } from '@/services/api/admin';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface StoreFormProps {
  initial?: AdminStore;
  submitLabel: string;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (input: StoreInput) => void;
}

const toDollars = (minor?: number | null) => (minor != null ? (minor / 100).toFixed(2) : '0.00');
const toMinor = (s: string): number => {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

export function StoreForm({ initial, submitLabel, submitting, serverError, onSubmit }: StoreFormProps) {
  const { colors } = useThemeColors();
  const categories = useCategories();
  const isEdit = Boolean(initial);

  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [logo, setLogo] = useState(initial?.logo ?? '🛍️');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [eta, setEta] = useState(String(initial?.etaMinutes ?? 30));
  const [deliveryFee, setDeliveryFee] = useState(toDollars(initial?.deliveryFeeMinor));
  const [dealBadge, setDealBadge] = useState(initial?.dealBadge ?? '');
  const [rating, setRating] = useState(String(initial?.rating ?? 4.5));
  const [brandColor, setBrandColor] = useState(initial?.brandColor ?? '#634EF0');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (!isEdit && !slug.trim()) next.slug = 'Slug is required.';
    if (!name.trim()) next.name = 'Name is required.';
    if (!categoryId) next.category = 'Pick a category.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      slug: slug.trim(),
      name: name.trim(),
      logo: logo.trim() || '🛍️',
      categoryId,
      etaMinutes: Number.parseInt(eta, 10) || 30,
      deliveryFeeMinor: toMinor(deliveryFee),
      dealBadge: dealBadge.trim() || null,
      rating: Number.parseFloat(rating) || 0,
      brandColor: brandColor.trim() || null,
      isActive,
    });
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
      {!isEdit ? (
        <FormField label="Slug" value={slug} onChangeText={setSlug} error={errors.slug} autoCapitalize="none" placeholder="greenleaf" />
      ) : null}
      <FormField label="Name" value={name} onChangeText={setName} error={errors.name} placeholder="Greenleaf Market" />
      <View className="flex-row gap-3">
        <FormField label="Logo (emoji)" value={logo} onChangeText={setLogo} containerClassName="w-28" />
        <FormField label="Brand color" value={brandColor} onChangeText={setBrandColor} autoCapitalize="none" containerClassName="flex-1" />
      </View>

      <View className="gap-1.5">
        <Text weight="medium" className="text-meta text-muted">Category</Text>
        <View className="flex-row flex-wrap gap-2">
          {categories.data?.map((c) => (
            <PressableScale
              key={c.id}
              accessibilityRole="button"
              accessibilityState={{ selected: categoryId === c.id }}
              onPress={() => setCategoryId(c.id)}
              className={cn('rounded-pill border px-3.5 py-2', categoryId === c.id ? 'border-primary bg-primary' : 'border-line bg-surface')}
            >
              <Text weight="medium" className={cn('text-meta', categoryId === c.id ? 'text-onPrimary' : 'text-fg')}>
                {c.name}
              </Text>
            </PressableScale>
          ))}
        </View>
        {errors.category ? <Text className="text-meta text-deal">{errors.category}</Text> : null}
      </View>

      <View className="flex-row gap-3">
        <FormField label="ETA (min)" value={eta} onChangeText={setEta} keyboardType="number-pad" containerClassName="flex-1" />
        <FormField label="Delivery ($)" value={deliveryFee} onChangeText={setDeliveryFee} keyboardType="decimal-pad" containerClassName="flex-1" />
        <FormField label="Rating" value={rating} onChangeText={setRating} keyboardType="decimal-pad" containerClassName="flex-1" />
      </View>
      <FormField label="Deal badge" value={dealBadge} onChangeText={setDealBadge} placeholder="optional" />

      <View className="flex-row items-center justify-between rounded-2xl bg-surface px-4 py-3 border border-line">
        <Text className="text-body text-fg">Active</Text>
        <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: colors.primary, false: colors.line }} />
      </View>

      {serverError ? <Text className="text-meta text-deal">{serverError}</Text> : null}
      <Button title={submitLabel} block loading={submitting} onPress={submit} />
    </ScrollView>
  );
}
