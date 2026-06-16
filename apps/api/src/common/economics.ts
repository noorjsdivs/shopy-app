/**
 * Cart economics — the single source of truth for order pricing, mirrored on the
 * mobile client (apps/mobile/src/lib/cart.ts). All values are integer minor units.
 * See _props/SEED-DATA.md §9.
 */

export const FREE_DELIVERY_THRESHOLD_MINOR = 3500; // $35
export const SERVICE_FEE_RATE = 0.05; // 5% of subtotal
export const SERVICE_FEE_MIN_MINOR = 199; // $1.99 floor
export const BASE_DELIVERY_FEE_MINOR = 399; // $3.99 below threshold (0 at/above)

export interface CartTotals {
  subtotalMinor: number;
  serviceFeeMinor: number;
  deliveryFeeMinor: number;
  tipMinor: number;
  totalMinor: number;
}

export function serviceFeeMinor(subtotalMinor: number): number {
  if (subtotalMinor <= 0) return 0;
  return Math.max(SERVICE_FEE_MIN_MINOR, Math.round(subtotalMinor * SERVICE_FEE_RATE));
}

export function deliveryFeeMinor(subtotalMinor: number, slotFeeMinor = 0): number {
  if (subtotalMinor <= 0) return 0;
  return (subtotalMinor >= FREE_DELIVERY_THRESHOLD_MINOR ? 0 : BASE_DELIVERY_FEE_MINOR) + slotFeeMinor;
}

/** Compute full order economics from a subtotal + tip (+ optional slot fee). */
export function computeTotals(
  subtotalMinor: number,
  tipMinor = 0,
  slotFeeMinor = 0,
): CartTotals {
  const service = serviceFeeMinor(subtotalMinor);
  const delivery = deliveryFeeMinor(subtotalMinor, slotFeeMinor);
  return {
    subtotalMinor,
    serviceFeeMinor: service,
    deliveryFeeMinor: delivery,
    tipMinor,
    totalMinor: subtotalMinor + service + delivery + tipMinor,
  };
}
