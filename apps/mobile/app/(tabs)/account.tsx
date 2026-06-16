import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Screen,
  Text,
  Button,
  Logo,
  PressableScale,
  Badge,
} from '@/components';
import { useAuth, selectIsAdmin } from '@/store/auth';
import { useThemePref, type ThemePreference } from '@/store/theme';
import { useAuthGate } from '@/features/auth';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

export default function AccountScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const { requireAuth } = useAuthGate();
  const user = useAuth((s) => s.user);
  const isAdmin = useAuth(selectIsAdmin);
  const signOut = useAuth((s) => s.signOut);
  const preference = useThemePref((s) => s.preference);
  const setPreference = useThemePref((s) => s.setPreference);

  return (
    <Screen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 20 }}
      >
        <Text weight="extrabold" className="text-display text-fg">
          Account
        </Text>

        {/* Profile / guest card */}
        <View className="flex-row items-center gap-3 rounded-2xl bg-surface p-4 border border-line">
          <Logo size={48} variant="gradient" />
          <View className="flex-1">
            {user ? (
              <>
                <View className="flex-row items-center gap-2">
                  <Text weight="bold" className="text-title text-fg">
                    {user.name ?? 'Shopy member'}
                  </Text>
                  {isAdmin ? <Badge label="Admin" tone="primary" /> : null}
                </View>
                <Text className="text-meta text-muted">{user.email}</Text>
              </>
            ) : (
              <>
                <Text weight="bold" className="text-title text-fg">
                  You’re browsing as a guest
                </Text>
                <Text className="text-meta text-muted">
                  Sign in to check out and track orders.
                </Text>
              </>
            )}
          </View>
        </View>

        {!user ? (
          <Button
            title="Sign in or create account"
            block
            onPress={() => requireAuth(() => {}, 'Sign in to your Shopy account')}
          />
        ) : null}

        {/* Admin entry — only for ADMIN */}
        {isAdmin ? (
          <Row
            icon="speedometer-outline"
            label="Admin Dashboard"
            tint={colors.primary}
            onPress={() => router.push('/admin')}
          />
        ) : null}

        {/* Account rows */}
        {user ? (
          <View className="overflow-hidden rounded-2xl bg-surface border border-line">
            <Row icon="receipt-outline" label="Your orders" onPress={() => router.push('/orders')} divider />
            <Row icon="location-outline" label="Addresses" divider />
            <Row icon="card-outline" label="Payment methods" />
          </View>
        ) : null}

        {/* Appearance */}
        <View>
          <Text weight="semibold" className="mb-2 text-title text-fg">
            Appearance
          </Text>
          <View className="flex-row gap-2 rounded-pill bg-surfaceAlt p-1">
            {(['system', 'light', 'dark'] as ThemePreference[]).map((opt) => (
              <PressableScale
                key={opt}
                accessibilityRole="button"
                accessibilityState={{ selected: preference === opt }}
                onPress={() => setPreference(opt)}
                className={cn(
                  'flex-1 items-center rounded-pill py-2',
                  preference === opt ? 'bg-surface border border-line' : '',
                )}
              >
                <Text
                  weight={preference === opt ? 'semibold' : 'regular'}
                  className={cn('text-meta capitalize', preference === opt ? 'text-primary' : 'text-muted')}
                >
                  {opt}
                </Text>
              </PressableScale>
            ))}
          </View>
        </View>

        {user ? (
          <Button title="Sign out" variant="secondary" block onPress={() => void signOut()} />
        ) : null}

        <Text className="text-center text-meta text-faint">Shopy v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

function Row({
  icon,
  label,
  onPress,
  divider,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  divider?: boolean;
  tint?: string;
}) {
  const { colors } = useThemeColors();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 bg-surface px-4 py-3.5',
        divider ? 'border-b border-line' : '',
        tint ? 'rounded-2xl border border-line' : '',
      )}
    >
      <Ionicons name={icon} size={20} color={tint ?? colors.fg} />
      <Text weight={tint ? 'semibold' : 'regular'} className="flex-1 text-body text-fg">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.faint} />
    </PressableScale>
  );
}
