/**
 * Cart economics — mirrors the server's apps/api/src/common/economics.ts and
 * SEED-DATA §9. The server recomputes these at order time; the client total is
 * display-only and must reconcile. All values are integer minor units.
 */

export const FREE_DELIVERY_THRESHOLD_MINOR = 3500; // $35
export const SERVICE_FEE_RATE = 0.05; // 5%
export const SERVICE_FEE_MIN_MINOR = 199; // $1.99 floor
export const BASE_DELIVERY_FEE_MINOR = 399; // $3.99 below threshold

export interface CartTotals {
  subtotalMinor: number;
  serviceFeeMinor: number;
  deliveryFeeMinor: number;
  tipMinor: number;
  totalMinor: number;
  amountToFreeDeliveryMinor: number;
  freeDeliveryProgress: number; // 0..1
}

export function serviceFee(subtotalMinor: number): number {
  if (subtotalMinor <= 0) return 0;
  return Math.max(SERVICE_FEE_MIN_MINOR, Math.round(subtotalMinor * SERVICE_FEE_RATE));
}

export function deliveryFee(subtotalMinor: number, slotFeeMinor = 0): number {
  if (subtotalMinor <= 0) return 0;
  return (
    (subtotalMinor >= FREE_DELIVERY_THRESHOLD_MINOR ? 0 : BASE_DELIVERY_FEE_MINOR) +
    slotFeeMinor
  );
}

export function computeTotals(
  subtotalMinor: number,
  tipMinor = 0,
  slotFeeMinor = 0,
): CartTotals {
  const service = serviceFee(subtotalMinor);
  const delivery = deliveryFee(subtotalMinor, slotFeeMinor);
  const amountToFree = Math.max(0, FREE_DELIVERY_THRESHOLD_MINOR - subtotalMinor);
  return {
    subtotalMinor,
    serviceFeeMinor: service,
    deliveryFeeMinor: delivery,
    tipMinor,
    totalMinor: subtotalMinor + service + delivery + tipMinor,
    amountToFreeDeliveryMinor: amountToFree,
    freeDeliveryProgress:
      subtotalMinor <= 0
        ? 0
        : Math.min(1, subtotalMinor / FREE_DELIVERY_THRESHOLD_MINOR),
  };
}
