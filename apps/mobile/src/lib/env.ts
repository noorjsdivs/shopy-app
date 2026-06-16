import { Platform } from 'react-native';
import { z } from 'zod';

/**
 * Resolves the API base URL. Prefers EXPO_PUBLIC_API_URL; otherwise falls back
 * to a sensible per-platform default (TECH-STACK §7):
 *   iOS sim       -> http://localhost:4000/api
 *   Android emu   -> http://10.0.2.2:4000/api
 *   physical dev  -> set EXPO_PUBLIC_API_URL to your LAN IP.
 */
const platformDefault = Platform.select({
  ios: 'http://localhost:4000/api',
  android: 'http://10.0.2.2:4000/api',
  default: 'http://localhost:4000/api',
});

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? platformDefault;

const apiUrl = z
  .string()
  .url()
  .parse(rawApiUrl);

export const env = {
  apiUrl,
} as const;
