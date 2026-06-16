import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

const BAG_BODY =
  'M372 360 H652 A72 72 0 0 1 724 432 V688 A72 72 0 0 1 652 760 H372 ' +
  'A72 72 0 0 1 300 688 V432 A72 72 0 0 1 372 360 Z';
const HANDLE = 'M384 372 C384 268 640 268 640 372';
const S_GLYPH =
  'M480 518 C480 490 499 476 525 476 C547 476 560 490 566 509 L544 528 ' +
  'C541 516 534 509 523 509 C512 509 504 516 504 529 C504 543 513 548 531 556 ' +
  'C557 567 569 582 569 613 C569 646 550 664 523 664 C499 664 483 648 477 627 ' +
  'L501 611 C504 624 512 631 525 631 C537 631 547 624 547 609 C547 594 537 588 520 580 ' +
  'C496 569 480 554 480 518 Z';

type LogoVariant = 'gradient' | 'mono';

interface LogoProps {
  size?: number;
  variant?: LogoVariant;
  /** For mono variant: glyph color. Defaults to brand primary. */
  color?: string;
}

/** The Shopy brandmark (a shopping bag whose cutout reads as an "S"). */
export function Logo({ size = 48, variant = 'gradient', color }: LogoProps) {
  const { colors } = useThemeColors();

  if (variant === 'mono') {
    const fill = color ?? colors.primary;
    return (
      <Svg width={size} height={size} viewBox="0 0 1024 1024">
        <Path d={`${BAG_BODY} ${S_GLYPH}`} fill={fill} fillRule="evenodd" />
        <Path
          d={HANDLE}
          fill="none"
          stroke={fill}
          strokeWidth={46}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <LinearGradient id="logoBrand" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.primary} />
          <Stop offset="1" stopColor={colors.primaryTint} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="1024" height="1024" rx="220" fill="url(#logoBrand)" />
      <Path d={BAG_BODY} fill="#ffffff" />
      <Path d={S_GLYPH} fill={colors.primary} />
      <Path d={HANDLE} fill="none" stroke="#ffffff" strokeWidth={46} strokeLinecap="round" />
    </Svg>
  );
}

interface WordmarkProps {
  size?: number;
  className?: string;
  onGradient?: boolean;
}

/** "Shopy" wordmark + brandmark lockup. */
export function Wordmark({ size = 40, className, onGradient }: WordmarkProps) {
  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <Logo size={size} variant={onGradient ? 'mono' : 'gradient'} color={onGradient ? '#fff' : undefined} />
      <Text
        weight="extrabold"
        className={cn('text-h', onGradient ? 'text-white' : 'text-fg')}
        style={{ fontSize: size * 0.6 }}
      >
        Shopy
      </Text>
    </View>
  );
}
