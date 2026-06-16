import { Role } from '@prisma/client';

/** JWT payload (access + refresh). */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/** Authenticated user attached to req.user by JwtStrategy. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
