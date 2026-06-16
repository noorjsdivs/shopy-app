import { View } from 'react-native';
import type { OrderStatus } from '@shopy/shared';
import { Text } from './Text';
import { cn } from '@/lib/cn';

const CONFIG: Record<OrderStatus, { label: string; bg: string; fg: string }> = {
  RECEIVED: { label: 'Received', bg: 'bg-primarySoft', fg: 'text-primary' },
  PROCESSING: { label: 'Processing', bg: 'bg-warningSoft', fg: 'text-warning' },
  PACKED: { label: 'Packed', bg: 'bg-primarySoft', fg: 'text-primary' },
  SHIPPED: { label: 'Shipped', bg: 'bg-primarySoft', fg: 'text-primary' },
  DELIVERED: { label: 'Delivered', bg: 'bg-successSoft', fg: 'text-success' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-dealSoft', fg: 'text-deal' },
};

export function StatusPill({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const c = CONFIG[status];
  return (
    <View className={cn('self-start rounded-pill px-3 py-1', c.bg, className)}>
      <Text weight="semibold" className={cn('text-meta', c.fg)}>
        {c.label}
      </Text>
    </View>
  );
}
