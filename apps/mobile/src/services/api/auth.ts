import {
  AuthResponseSchema,
  PublicUserSchema,
  type AuthResponse,
  type PublicUser,
} from '@shopy/shared';
import { api } from './client';

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await api.post('/auth/login', { email, password });
  return AuthResponseSchema.parse(res.data);
}

export async function register(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  const res = await api.post('/auth/register', { email, password, name });
  return AuthResponseSchema.parse(res.data);
}

export async function fetchMe(): Promise<PublicUser> {
  const res = await api.get('/auth/me');
  return PublicUserSchema.parse(res.data);
}
