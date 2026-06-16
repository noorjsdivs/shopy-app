import { TextInput, View, type TextInputProps } from 'react-native';
import { Text } from './Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  containerClassName?: string;
}

/** Labeled text input with inline error, tied to the input for a11y. */
export function FormField({
  label,
  error,
  containerClassName,
  ...inputProps
}: FormFieldProps) {
  const { colors } = useThemeColors();
  return (
    <View className={cn('gap-1.5', containerClassName)}>
      <Text weight="medium" className="text-meta text-muted">
        {label}
      </Text>
      <TextInput
        className={cn(
          'h-12 rounded-xl border bg-surface px-4 text-body text-fg',
          error ? 'border-deal' : 'border-line',
        )}
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
        {...inputProps}
      />
      {error ? (
        <Text className="text-meta text-deal" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
