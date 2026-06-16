import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, Logo, PressableScale } from '@/components';
import { AuthForm } from '@/features/auth';
import { useThemeColors } from '@/lib/colors';

export default function SignInScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();

  const onSuccess = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingTop: 8 }}
        >
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt"
          >
            <Ionicons name="chevron-back" size={22} color={colors.fg} />
          </PressableScale>
          <View className="mb-6 items-center">
            <Logo size={64} variant="gradient" />
          </View>
          <AuthForm defaultMode="sign-in" onSuccess={onSuccess} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
