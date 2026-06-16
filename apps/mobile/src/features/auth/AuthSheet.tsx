import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Logo } from '@/components/Logo';
import { AuthForm } from './AuthForm';
import { useGate } from './gate.store';
import { useThemeColors } from '@/lib/colors';

/**
 * Global AuthSheet host. Opened from anywhere via useAuthGate().requireAuth(action);
 * on successful sign-in/up it resolves and resumes the queued action.
 * Mounted once in app/_layout.tsx.
 */
export function AuthSheet() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const ref = useRef<BottomSheet>(null);

  const open = useGate((s) => s.open);
  const message = useGate((s) => s.message);
  const hide = useGate((s) => s.hide);
  const resolve = useGate((s) => s.resolve);

  useEffect(() => {
    if (open) ref.current?.expand();
    else ref.current?.close();
  }, [open]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      enableDynamicSizing
      enablePanDownToClose
      onClose={() => {
        // If closed by gesture/backdrop while still "open" in store, cancel.
        if (useGate.getState().open) hide();
      }}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleIndicatorStyle={{ backgroundColor: colors.line }}
      backgroundStyle={{ backgroundColor: colors.surface }}
    >
      <BottomSheetView style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="px-5 pt-1">
          <View className="mb-4 flex-row items-center gap-3">
            <Logo size={40} variant="gradient" />
            <View className="flex-1">
              <Text weight="extrabold" className="text-title text-fg">
                Shopy
              </Text>
              {message ? (
                <Text className="text-meta text-muted">{message}</Text>
              ) : (
                <Text className="text-meta text-muted">Sign in to continue</Text>
              )}
            </View>
          </View>
          {open ? <AuthForm onSuccess={resolve} /> : null}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
