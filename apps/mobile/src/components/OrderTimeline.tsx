import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import type { OrderStatus } from '@shopy/shared';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface TimelineEvent {
  status: OrderStatus;
  note?: string | null;
  createdAt: string;
}

const LABELS: Record<OrderStatus, string> = {
  RECEIVED: 'Order received',
  PROCESSING: 'Preparing your order',
  PACKED: 'Packed',
  SHIPPED: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

/** Vertical status timeline (chronological); the latest event is highlighted. */
export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  const { colors } = useThemeColors();
  return (
    <View>
      {events.map((e, i) => {
        const isLast = i === events.length - 1;
        const cancelled = e.status === 'CANCELLED';
        return (
          <View key={`${e.status}-${e.createdAt}`} className="flex-row">
            {/* Rail */}
            <View className="items-center">
              <View
                className={cn(
                  'h-7 w-7 items-center justify-center rounded-full',
                  cancelled ? 'bg-deal' : 'bg-primary',
                )}
              >
                <Ionicons
                  name={cancelled ? 'close' : 'checkmark'}
                  size={16}
                  color={colors.onPrimary}
                />
              </View>
              {!isLast ? <View className="w-0.5 flex-1 bg-line" /> : null}
            </View>
            {/* Content */}
            <View className={isLast ? 'flex-1 pb-1 pl-3' : 'flex-1 pb-6 pl-3'}>
              <Text weight="semibold" className="text-body text-fg">
                {LABELS[e.status]}
              </Text>
              <Text className="text-meta text-muted">
                {format(parseISO(e.createdAt), 'MMM d, h:mm a')}
              </Text>
              {e.note ? (
                <Text className="mt-0.5 text-meta text-faint">{e.note}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
