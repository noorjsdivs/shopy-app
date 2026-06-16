import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface AuthorizeInput {
  amountMinor: number;
  currency: string;
  method: 'demo-card';
  forceDecline?: boolean;
}

export type AuthorizeResult =
  | { ok: true; authId: string }
  | { ok: false; declineReason: string };

/**
 * Simulated payments. NEVER collects or transmits real card data.
 * A decline is produced only via `forceDecline` (the client maps demo card
 * 4000…0002 to forceDecline so the UI can exercise the decline path).
 */
@Injectable()
export class PaymentsService {
  authorize(input: AuthorizeInput): AuthorizeResult {
    if (input.forceDecline) {
      return { ok: false, declineReason: 'card_declined' };
    }
    return { ok: true, authId: `auth_${randomUUID()}` };
  }
}
