/** Money formatting — integer minor units in, display string out. Never floats. */

export function formatMoney(minor: number, currency = 'USD'): string {
  const major = minor / 100;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(major);
  } catch {
    return `$${major.toFixed(2)}`;
  }
}

/** "$3.99" style without currency-code edge cases, for tight UI. */
export function formatPrice(minor: number): string {
  return `$${(minor / 100).toFixed(2)}`;
}
