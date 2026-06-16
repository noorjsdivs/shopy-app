import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from './Text';
import { EmptyState } from './EmptyState';
import { PressableScale } from './PressableScale';
import { useThemeColors } from '@/lib/colors';

/** Honest placeholder for screens built in a later phase. */
export function ComingSoon({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  const router = useRouter();
  const { colors } = useThemeColors();
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pt-1">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          className="h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt"
        >
          <Ionicons name="chevron-back" size={22} color={colors.fg} />
        </PressableScale>
        <Text weight="extrabold" className="text-h text-fg">
          {title}
        </Text>
      </View>
      <EmptyState icon="construct-outline" title={title} message={note} />
    </SafeAreaView>
  );
}
