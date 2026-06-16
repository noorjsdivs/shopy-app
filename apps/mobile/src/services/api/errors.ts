import { AxiosError } from 'axios';

interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}

/** Extract a human-readable message from an API/axios error. */
export function getApiErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (err instanceof AxiosError) {
    const body = err.response?.data as ApiErrorBody | undefined;
    if (body?.message) {
      return Array.isArray(body.message) ? body.message[0] : body.message;
    }
    if (err.code === 'ERR_NETWORK') {
      return 'Cannot reach the server. Check your connection.';
    }
  }
  return fallback;
}

/** Specific check for the simulated payment decline (402). */
export function isPaymentDeclined(err: unknown): boolean {
  if (err instanceof AxiosError) {
    const body = err.response?.data as ApiErrorBody | undefined;
    return err.response?.status === 402 || body?.error === 'payment_declined';
  }
  return false;
}
