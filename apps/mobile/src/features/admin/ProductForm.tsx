import { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import type { AdminProduct } from '@shopy/shared';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { PressableScale } from '@/components/PressableScale';
import { useAdminStores } from './hooks';
import { useStore } from '@/features/catalog/hooks';
import type { ProductInput } from '@/services/api/admin';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface ProductFormProps {
  initial?: AdminProduct;
  submitLabel: string;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (input: ProductInput) => void;
}

const toDollars = (minor?: number | null) =>
  minor != null ? (minor / 100).toFixed(2) : '';
const toMinor = (s: string): number | undefined => {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) : undefined;
};

export function ProductForm({
  initial,
  submitLabel,
  submitting,
  serverError,
  onSubmit,
}: ProductFormProps) {
  const { colors } = useThemeColors();
  const stores = useAdminStores();

  const [storeId, setStoreId] = useState(initial?.storeId ?? '');
  const [storeSlug, setStoreSlug] = useState(initial?.store?.slug ?? '');
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState(toDollars(initial?.priceMinor));
  const [compareAt, setCompareAt] = useState(toDollars(initial?.compareAtMinor));
  const [size, setSize] = useState(initial?.size ?? '');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [tagsStr, setTagsStr] = useState((initial?.tags ?? []).join(', '));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [byWeight, setByWeight] = useState(initial?.byWeight ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const storeQuery = useStore(storeSlug);
  const departments = storeQuery.data?.departments ?? [];

  const pickStore = (id: string, slug: string) => {
    setStoreId(id);
    setStoreSlug(slug);
    setDepartmentId('');
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (!storeId) next.store = 'Pick a store.';
    if (!departmentId) next.department = 'Pick a department.';
    if (!name.trim()) next.name = 'Name is required.';
    const priceMinor = toMinor(price);
    if (priceMinor == null || priceMinor <= 0) next.price = 'Enter a valid price.';
    if (!image.trim()) next.image = 'Image URL is required.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      storeId,
      departmentId,
      name: name.trim(),
      priceMinor: priceMinor!,
      compareAtMinor: toMinor(compareAt) ?? null,
      size: size.trim() || null,
      brand: brand.trim() || null,
      description: description.trim() || null,
      byWeight,
      image: image.trim(),
      tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
      isActive,
    });
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
    >
      {/* Store picker */}
      <View className="gap-1.5">
        <Text weight="medium" className="text-meta text-muted">
          Store
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {stores.data?.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              active={storeId === s.id}
              onPress={() => pickStore(s.id, s.slug)}
            />
          ))}
        </View>
        {errors.store ? <Text className="text-meta text-deal">{errors.store}</Text> : null}
      </View>

      {/* Department picker */}
      {storeId ? (
        <View className="gap-1.5">
          <Text weight="medium" className="text-meta text-muted">
            Department
          </Text>
          {storeQuery.isLoading ? (
            <Text className="text-meta text-faint">Loading departments…</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {departments.map((d) => (
                <Chip
                  key={d.id}
                  label={d.name}
                  active={departmentId === d.id}
                  onPress={() => setDepartmentId(d.id)}
                />
              ))}
            </View>
          )}
          {errors.department ? (
            <Text className="text-meta text-deal">{errors.department}</Text>
          ) : null}
        </View>
      ) : null}

      <FormField label="Name" value={name} onChangeText={setName} error={errors.name} placeholder="Organic Strawberries" />
      <View className="flex-row gap-3">
        <FormField
          label="Price ($)"
          value={price}
          onChangeText={setPrice}
          error={errors.price}
          keyboardType="decimal-pad"
          placeholder="5.99"
          containerClassName="flex-1"
        />
        <FormField
          label="Compare-at ($)"
          value={compareAt}
          onChangeText={setCompareAt}
          keyboardType="decimal-pad"
          placeholder="optional"
          containerClassName="flex-1"
        />
      </View>
      <View className="flex-row gap-3">
        <FormField label="Size" value={size} onChangeText={setSize} placeholder="1 lb" containerClassName="flex-1" />
        <FormField label="Brand" value={brand} onChangeText={setBrand} placeholder="optional" containerClassName="flex-1" />
      </View>
      <FormField label="Image URL" value={image} onChangeText={setImage} error={errors.image} autoCapitalize="none" placeholder="https://…" />
      <FormField label="Tags (comma-separated)" value={tagsStr} onChangeText={setTagsStr} placeholder="Organic, Vegan" />
      <FormField label="Description" value={description} onChangeText={setDescription} placeholder="optional" multiline />

      <View className="flex-row items-center justify-between rounded-2xl bg-surface px-4 py-3 border border-line">
        <Text className="text-body text-fg">Sold by weight</Text>
        <Switch value={byWeight} onValueChange={setByWeight} trackColor={{ true: colors.primary, false: colors.line }} />
      </View>
      <View className="flex-row items-center justify-between rounded-2xl bg-surface px-4 py-3 border border-line">
        <Text className="text-body text-fg">Active (visible in store)</Text>
        <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: colors.primary, false: colors.line }} />
      </View>

      {serverError ? <Text className="text-meta text-deal">{serverError}</Text> : null}

      <Button title={submitLabel} block loading={submitting} onPress={submit} />
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={cn('rounded-pill border px-3.5 py-2', active ? 'border-primary bg-primary' : 'border-line bg-surface')}
    >
      <Text weight="medium" className={cn('text-meta', active ? 'text-onPrimary' : 'text-fg')}>
        {label}
      </Text>
    </PressableScale>
  );
}
