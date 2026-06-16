import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/cn';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

const weightClass: Record<Weight, string> = {
  regular: 'font-sans',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

export interface TextProps extends RNTextProps {
  weight?: Weight;
  className?: string;
}

/** Themed text — Inter family per weight, defaults to text-fg. */
export function Text({
  weight = 'regular',
  className,
  ...props
}: TextProps) {
  return (
    <RNText
      className={cn('text-fg text-body', weightClass[weight], className)}
      {...props}
    />
  );
}
