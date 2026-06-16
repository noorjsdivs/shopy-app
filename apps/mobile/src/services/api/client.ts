import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/lib/env';
import { tokenStore } from '@/services/storage/tokens';

/**
 * Axios instance for the Shopy API.
 * - request: attaches `Authorization: Bearer <access>` from SecureStore.
 * - response: on 401 it calls /auth/refresh ONCE, retries the request, and on
 *   failure clears the session and notifies the registered handler.
 */
// eslint-disable-next-line import/no-named-as-default-member
export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Decouple the client from the auth store (avoids a circular import).
let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(handler: (() => void) | null): void {
  onAuthFailure = handler;
}

api.interceptors.request.use(async (config) => {
  const token = await tokenStore.getAccess();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStore.getRefresh();
  if (!refreshToken) return null;
  try {
    const res = await axios.post<{ accessToken: string }>(
      `${env.apiUrl}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const accessToken = res.data.accessToken;
    await tokenStore.setAccess(accessToken);
    return accessToken;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      // Coalesce concurrent refreshes into one network call.
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;

      if (newToken) {
        const headers = AxiosHeaders.from(original.headers);
        headers.set('Authorization', `Bearer ${newToken}`);
        original.headers = headers;
        return api(original);
      }

      await tokenStore.clear();
      onAuthFailure?.();
    }

    return Promise.reject(error);
  },
);
