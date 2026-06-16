import { View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Text } from './Text';
import { formatPrice } from '@/lib/money';

interface Point {
  date: string;
  revenueMinor: number;
}

/** Simple revenue-by-day bar chart (no chart lib needed). */
export function MiniBarChart({ data }: { data: Point[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenueMinor));
  return (
    <View className="rounded-2xl bg-surface p-4 border border-line">
      <Text weight="bold" className="text-title text-fg">
        Revenue · last 7 days
      </Text>
      <View className="mt-4 h-32 flex-row items-end justify-between gap-2">
        {data.map((d) => {
          const h = Math.max(4, Math.round((d.revenueMinor / max) * 110));
          return (
            <View key={d.date} className="flex-1 items-center gap-1.5">
              <Text className="text-[9px] text-faint">
                {d.revenueMinor > 0 ? formatPrice(d.revenueMinor).replace('.00', '') : ''}
              </Text>
              <View
                className="w-full rounded-t-md bg-primary"
                style={{ height: h }}
                accessibilityLabel={`${d.date}: ${formatPrice(d.revenueMinor)}`}
              />
              <Text className="text-[10px] text-muted">
                {format(parseISO(d.date), 'EEE')}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
