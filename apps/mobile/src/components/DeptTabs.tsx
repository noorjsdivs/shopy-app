import { useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { cn } from '@/lib/cn';

interface Dept {
  slug: string;
  name: string;
}

interface DeptTabsProps {
  departments: Dept[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

const PILL_WIDTH = 116; // approx, for keeping the active tab visible

/** Sticky horizontal department tabs with an animated active pill (scroll-spy). */
export function DeptTabs({ departments, activeSlug, onSelect }: DeptTabsProps) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    const idx = departments.findIndex((d) => d.slug === activeSlug);
    if (idx >= 0) {
      ref.current?.scrollTo({ x: Math.max(0, idx * PILL_WIDTH - 80), animated: true });
    }
  }, [activeSlug, departments]);

  return (
    <View className="border-b border-line bg-bg">
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
      >
        {departments.map((d) => {
          const active = d.slug === activeSlug;
          return (
            <PressableScale
              key={d.slug}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={d.name}
              onPress={() => onSelect(d.slug)}
              className={cn(
                'rounded-pill px-4 py-2',
                active ? 'bg-primary' : 'bg-surfaceAlt',
              )}
            >
              <Text
                weight={active ? 'semibold' : 'medium'}
                className={cn('text-meta', active ? 'text-onPrimary' : 'text-fg')}
              >
                {d.name}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}
