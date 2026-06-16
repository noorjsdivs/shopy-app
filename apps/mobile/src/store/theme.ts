import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (pref: ThemePreference) => void;
  setHydrated: () => void;
}

export const useThemePref = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      hydrated: false,
      setPreference: (preference) => set({ preference }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'shopy-theme',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
