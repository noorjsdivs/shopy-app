import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { glow } from '@/lib/shadow';
import { useThemeColors, brandGradient } from '@/lib/colors';

interface MetricCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}

/** Glossy stat card for the admin dashboard. */
export function MetricCard({ icon, label, value, highlight, className }: MetricCardProps) {
  const { colors } = useThemeColors();

  if (highlight) {
    return (
      <LinearGradient
        colors={brandGradient(colors)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={glow}
        className={cn('rounded-2xl p-4 border border-line', className)}
      >
        <Ionicons name={icon} size={22} color="#fff" />
        <Text weight="extrabold" className="mt-2 text-display text-white">
          {value}
        </Text>
        <Text className="text-meta text-white">{label}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={glow} className={cn('rounded-2xl bg-surface p-4 border border-line', className)}>
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-primarySoft">
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text weight="extrabold" className="mt-2 text-h text-fg">
        {value}
      </Text>
      <Text className="text-meta text-muted">{label}</Text>
    </View>
  );
}
