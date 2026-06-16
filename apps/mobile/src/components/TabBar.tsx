import { useEffect, type ComponentProps } from 'react';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { useThemeColors } from '@/lib/colors';
import { useCart, selectCount } from '@/store/cart';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  index: { label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  search: { label: 'Search', icon: 'search-outline', activeIcon: 'search' },
  categories: { label: 'Categories', icon: 'grid-outline', activeIcon: 'grid' },
  cart: { label: 'Cart', icon: 'cart-outline', activeIcon: 'cart' },
  account: { label: 'Account', icon: 'person-outline', activeIcon: 'person' },
};

function CartBadge({ count }: { count: number }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (count > 0 && !reduced) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 120 }),
        withTiming(1, { duration: 120 }),
      );
    }
  }, [count, reduced, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  if (count <= 0) return null;
  return (
    <Animated.View
      style={style}
      className="absolute -right-2.5 -top-1.5 min-w-[18px] items-center justify-center rounded-full bg-primary px-1"
    >
      <Text weight="bold" className="text-[10px] leading-[14px] text-onPrimary">
        {count > 99 ? '99+' : count}
      </Text>
    </Animated.View>
  );
}

type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const cartCount = useCart(selectCount);

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0) }}
      className="flex-row border-t border-line bg-surface"
    >
      {state.routes.map((route, index) => {
        const config = TABS[route.name];
        if (!config) return null;
        const focused = state.index === index;
        const color = focused ? colors.primary : colors.muted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <PressableScale
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={config.label}
            onPress={onPress}
            className="flex-1 items-center justify-center pt-2.5 pb-1"
          >
            <View>
              <Ionicons
                name={focused ? config.activeIcon : config.icon}
                size={24}
                color={color}
              />
              {route.name === 'cart' ? <CartBadge count={cartCount} /> : null}
            </View>
            <Text
              weight={focused ? 'semibold' : 'regular'}
              className="mt-1 text-[11px]"
              style={{ color }}
            >
              {config.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
