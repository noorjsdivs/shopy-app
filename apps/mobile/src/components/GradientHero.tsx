import { useEffect, useRef, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useReducedMotion } from 'react-native-reanimated';
import type { HeroBanner } from '@shopy/shared';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { glow } from '@/lib/shadow';
import { useThemeColors, toneGradient } from '@/lib/colors';

interface GradientHeroProps {
  banners: HeroBanner[];
  onPressBanner?: (banner: HeroBanner) => void;
}

const AUTO_MS = 4500;
const HERO_HEIGHT = 220;

export function GradientHero({ banners, onPressBanner }: GradientHeroProps) {
  const { width } = useWindowDimensions();
  const { colors } = useThemeColors();
  const reduced = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const slideWidth = width - 32; // px-4 each side
  const gap = 12;

  useEffect(() => {
    if (reduced || banners.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * (slideWidth + gap), animated: true });
        return next;
      });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [reduced, banners.length, slideWidth]);

  if (banners.length === 0) return null;

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth + gap}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, gap }}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / (slideWidth + gap)));
        }}
      >
        {banners.map((banner) => (
          <PressableScale
            key={banner.id}
            accessibilityRole="button"
            accessibilityLabel={`${banner.title.replace(/\n/g, ' ')}. ${banner.subtitle}`}
            onPress={() => onPressBanner?.(banner)}
            style={[{ width: slideWidth, height: HERO_HEIGHT }, glow]}
            className="overflow-hidden rounded-3xl border border-line"
          >
            {/* Full-bleed background image */}
            <Image
              source={{ uri: banner.image }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              contentFit="cover"
              transition={300}
            />
            {/* Brand tone tint (keeps it on-brand over any photo) */}
            <LinearGradient
              colors={toneGradient(banner.tone, colors)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.42 }}
            />
            {/* Legibility scrim (dark at the bottom for the text) */}
            <LinearGradient
              colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.78)']}
              locations={[0, 0.45, 1]}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            {/* Content */}
            <View className="flex-1 justify-end p-5">
              <Text weight="extrabold" className="text-display leading-tight text-white">
                {banner.title}
              </Text>
              <Text className="mt-1.5 text-body text-white">{banner.subtitle}</Text>
              <View className="mt-3.5 flex-row items-center gap-1.5 self-start rounded-pill bg-white px-4 py-2">
                <Text weight="bold" className="text-meta text-fg">
                  {banner.cta}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={colors.fg} />
              </View>
            </View>
          </PressableScale>
        ))}
      </ScrollView>

      {banners.length > 1 ? (
        <View className="mt-3 flex-row justify-center gap-1.5">
          {banners.map((b, i) => (
            <View
              key={b.id}
              className={cn(
                'h-1.5 rounded-full',
                i === index ? 'w-5 bg-primary' : 'w-1.5 bg-line',
              )}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
