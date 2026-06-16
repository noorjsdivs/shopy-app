import { useCallback } from 'react';
import { useAuth } from '@/store/auth';
import { useGate } from './gate.store';

/**
 * The auth-anywhere gate. `requireAuth(action)` runs the action immediately if
 * the user is signed in; otherwise it opens the AuthSheet and resumes the
 * action automatically once they sign in or register. (CLAUDE "Guest & auth-anywhere".)
 */
export function useAuthGate() {
  const show = useGate((s) => s.show);

  const requireAuth = useCallback(
    (action: () => void, message?: string) => {
      if (useAuth.getState().status === 'authed') {
        action();
      } else {
        show(action, message);
      }
    },
    [show],
  );

  return { requireAuth };
}
