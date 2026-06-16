import { Redirect, Stack } from 'expo-router';
import { useAuth, selectIsAdmin } from '@/store/auth';

/** Role guard: only ADMIN users may enter the admin area. */
export default function AdminLayout() {
  const status = useAuth((s) => s.status);
  const isAdmin = useAuth(selectIsAdmin);

  // Render the navigator unconditionally (so typed routes resolve) and redirect
  // non-admins away. The redirect fires before any admin screen is shown.
  return (
    <>
      {status !== 'loading' && !isAdmin ? <Redirect href="/" /> : null}
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
