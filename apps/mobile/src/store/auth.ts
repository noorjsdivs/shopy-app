import { create } from 'zustand';
import type { AuthResponse, PublicUser } from '@shopy/shared';
import { tokenStore } from '@/services/storage/tokens';
import { fetchMe } from '@/services/api/auth';

type AuthStatus = 'loading' | 'authed' | 'guest';

interface AuthState {
  user: PublicUser | null;
  status: AuthStatus;
  /** Restore session on app start (reads tokens, fetches /auth/me). */
  restore: () => Promise<void>;
  /** Persist tokens + user after login/register. */
  setSession: (res: AuthResponse) => Promise<void>;
  /** Clear tokens + user. */
  signOut: () => Promise<void>;
  /** Called by the API client when refresh fails. */
  handleAuthFailure: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  restore: async () => {
    const access = await tokenStore.getAccess();
    if (!access) {
      set({ user: null, status: 'guest' });
      return;
    }
    try {
      const user = await fetchMe();
      set({ user, status: 'authed' });
    } catch {
      await tokenStore.clear();
      set({ user: null, status: 'guest' });
    }
  },

  setSession: async (res) => {
    await tokenStore.save({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    });
    set({ user: res.user, status: 'authed' });
  },

  signOut: async () => {
    await tokenStore.clear();
    set({ user: null, status: 'guest' });
  },

  handleAuthFailure: () => {
    set({ user: null, status: 'guest' });
  },
}));

export const selectIsAuthed = (s: AuthState): boolean => s.status === 'authed';
export const selectIsAdmin = (s: AuthState): boolean => s.user?.role === 'ADMIN';
