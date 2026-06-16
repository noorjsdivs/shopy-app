import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SecureStore is unavailable on web; fall back to AsyncStorage there.
const useSecure = Platform.OS !== 'web';

const ACCESS_KEY = 'shopy_access_token';
const REFRESH_KEY = 'shopy_refresh_token';

async function getItem(key: string): Promise<string | null> {
  return useSecure ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key);
}
async function setItem(key: string, value: string): Promise<void> {
  if (useSecure) await SecureStore.setItemAsync(key, value);
  else await AsyncStorage.setItem(key, value);
}
async function deleteItem(key: string): Promise<void> {
  if (useSecure) await SecureStore.deleteItemAsync(key);
  else await AsyncStorage.removeItem(key);
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const tokenStore = {
  getAccess: () => getItem(ACCESS_KEY),
  getRefresh: () => getItem(REFRESH_KEY),
  async save({ accessToken, refreshToken }: TokenPair): Promise<void> {
    await Promise.all([
      setItem(ACCESS_KEY, accessToken),
      setItem(REFRESH_KEY, refreshToken),
    ]);
  },
  async setAccess(accessToken: string): Promise<void> {
    await setItem(ACCESS_KEY, accessToken);
  },
  async clear(): Promise<void> {
    await Promise.all([deleteItem(ACCESS_KEY), deleteItem(REFRESH_KEY)]);
  },
};
