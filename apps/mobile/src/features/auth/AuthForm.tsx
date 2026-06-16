import { useState } from 'react';
import { View } from 'react-native';
import { z } from 'zod';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { authApi, getApiErrorMessage } from '@/services/api';
import { useAuth } from '@/store/auth';

type Mode = 'sign-in' | 'sign-up';

const emailSchema = z.string().email('Enter a valid email.');

interface AuthFormProps {
  defaultMode?: Mode;
  onSuccess: () => void;
}

export function AuthForm({ defaultMode = 'sign-in', onSuccess }: AuthFormProps) {
  const setSession = useAuth((s) => s.setSession);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === 'sign-up';

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    const emailRes = emailSchema.safeParse(email.trim());
    if (!emailRes.success) next.email = emailRes.error.issues[0].message;
    if (isSignUp) {
      if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    } else if (password.length < 1) {
      next.password = 'Enter your password.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = isSignUp
        ? await authApi.register(email.trim(), password, name.trim() || undefined)
        : await authApi.login(email.trim(), password);
      await setSession(res);
      onSuccess();
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="gap-4">
      <View>
        <Text weight="extrabold" className="text-h text-fg">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </Text>
        <Text className="mt-1 text-body text-muted">
          {isSignUp
            ? 'Quick sign-up — just email and a password.'
            : 'Sign in to check out and track orders.'}
        </Text>
      </View>

      {isSignUp ? (
        <FormField
          label="Name (optional)"
          placeholder="Sam Shopper"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          textContentType="name"
        />
      ) : null}

      <FormField
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
      />

      <FormField
        label="Password"
        placeholder={isSignUp ? 'At least 8 characters' : 'Your password'}
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        textContentType={isSignUp ? 'newPassword' : 'password'}
      />

      {serverError ? (
        <Text className="text-meta text-deal" accessibilityLiveRegion="polite">
          {serverError}
        </Text>
      ) : null}

      <Button
        title={isSignUp ? 'Create account' : 'Sign in'}
        onPress={onSubmit}
        loading={loading}
        block
      />

      <View className="flex-row items-center justify-center gap-1">
        <Text className="text-meta text-muted">
          {isSignUp ? 'Already have an account?' : 'New to Shopy?'}
        </Text>
        <Text
          weight="semibold"
          className="text-meta text-primary"
          onPress={() => {
            setErrors({});
            setServerError(null);
            setMode(isSignUp ? 'sign-in' : 'sign-up');
          }}
        >
          {isSignUp ? 'Sign in' : 'Create account'}
        </Text>
      </View>

      {__DEV__ ? (
        <Text className="text-center text-[11px] text-faint">
          Demo: customer@shopy.dev / shop1234 · admin@shopy.dev / admin1234
        </Text>
      ) : null}
    </View>
  );
}
