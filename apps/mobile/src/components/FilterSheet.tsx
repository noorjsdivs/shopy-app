import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { Button } from './Button';
import { PressableScale } from './PressableScale';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

export interface DeptFilters {
  sort: 'popular' | 'price-asc' | 'price-desc' | 'name';
  dietary: string[];
  maxPriceMinor?: number;
  onDealOnly: boolean;
}

const SORTS: { key: DeptFilters['sort']; label: string }[] = [
  { key: 'popular', label: 'Popular' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name A–Z' },
];
const DIETARY = ['Organic', 'Vegan', 'Gluten-free', 'Keto', 'Low-sugar', 'High-protein'];
const PRICE_CAPS: { label: string; value?: number }[] = [
  { label: 'Any' },
  { label: '≤ $5', value: 500 },
  { label: '≤ $10', value: 1000 },
  { label: '≤ $20', value: 2000 },
];

interface FilterSheetProps {
  open: boolean;
  value: DeptFilters;
  onApply: (filters: DeptFilters) => void;
  onClose: () => void;
}

export function FilterSheet({ open, value, onApply, onClose }: FilterSheetProps) {
  const { colors } = useThemeColors();
  const ref = useRef<BottomSheet>(null);

  useEffect(() => {
    if (open) ref.current?.expand();
    else ref.current?.close();
  }, [open]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      enableDynamicSizing
      enablePanDownToClose
      onClose={() => {
        if (open) onClose();
      }}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.line }}
      backgroundStyle={{ backgroundColor: colors.surface }}
    >
      <BottomSheetView>
        {/* Remount on each open so the draft initializes fresh from `value`. */}
        {open ? <FilterContent value={value} onApply={onApply} /> : null}
      </BottomSheetView>
    </BottomSheet>
  );
}

function FilterContent({
  value,
  onApply,
}: {
  value: DeptFilters;
  onApply: (filters: DeptFilters) => void;
}) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<DeptFilters>(value);

  const toggleDietary = (tag: string) =>
    setDraft((d) => ({
      ...d,
      dietary: d.dietary.includes(tag)
        ? d.dietary.filter((t) => t !== tag)
        : [...d.dietary, tag],
    }));

  return (
    <View className="gap-5 px-5 pt-1" style={{ paddingBottom: insets.bottom + 16 }}>
      <Text weight="extrabold" className="text-h text-fg">
        Filters
      </Text>

      <Group title="Sort by">
        {SORTS.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            active={draft.sort === s.key}
            onPress={() => setDraft((d) => ({ ...d, sort: s.key }))}
          />
        ))}
      </Group>

      <Group title="Dietary">
        {DIETARY.map((t) => (
          <Chip key={t} label={t} active={draft.dietary.includes(t)} onPress={() => toggleDietary(t)} />
        ))}
      </Group>

      <Group title="Max price">
        {PRICE_CAPS.map((p) => (
          <Chip
            key={p.label}
            label={p.label}
            active={draft.maxPriceMinor === p.value}
            onPress={() => setDraft((d) => ({ ...d, maxPriceMinor: p.value }))}
          />
        ))}
      </Group>

      <Group title="Deals">
        <Chip
          label="On deal only"
          active={draft.onDealOnly}
          onPress={() => setDraft((d) => ({ ...d, onDealOnly: !d.onDealOnly }))}
        />
      </Group>

      <View className="flex-row gap-3 pt-1">
        <Button
          title="Reset"
          variant="secondary"
          onPress={() =>
            setDraft({ sort: 'popular', dietary: [], maxPriceMinor: undefined, onDealOnly: false })
          }
          className="flex-1"
        />
        <Button title="Apply" onPress={() => onApply(draft)} className="flex-1" />
      </View>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text weight="semibold" className="text-title text-fg">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
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
