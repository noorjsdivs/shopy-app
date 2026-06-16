import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/colors';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  onClear?: () => void;
  className?: string;
}

/** Search input. When `onPress` + `editable={false}`, acts as a tappable bar. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search stores and products',
  onPress,
  editable = true,
  autoFocus,
  onClear,
  className,
}: SearchBarProps) {
  const { colors } = useThemeColors();
  const Wrapper = editable ? View : Pressable;
  return (
    <Wrapper
      onPress={onPress}
      accessibilityRole={editable ? undefined : 'search'}
      className={cn(
        'h-12 flex-row items-center gap-2 rounded-pill border border-line bg-surface px-4',
        className,
      )}
    >
      <Ionicons name="search" size={18} color={colors.muted} />
      <TextInput
        className="flex-1 text-body text-fg"
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        autoFocus={autoFocus}
        pointerEvents={editable ? 'auto' : 'none'}
        returnKeyType="search"
      />
      {value && value.length > 0 && onClear ? (
        <Ionicons
          name="close-circle"
          size={18}
          color={colors.muted}
          onPress={onClear}
        />
      ) : null}
    </Wrapper>
  );
}
