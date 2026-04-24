/**
 * Indian-locale currency formatting utilities.
 * Formats numbers per Lakh/Crore convention used across India.
 */

/**
 * Compact Lakh/Crore formatting.
 *   9,999 -> "₹9,999"
 *   1,00,000 -> "₹1.00 L"
 *   1,50,000 -> "₹1.5 L"
 *   1,00,00,000 -> "₹1.00 Cr"
 *   1,25,00,000 -> "₹1.25 Cr"
 */
export function formatINRCompact(value, opts = {}) {
  const { withSymbol = true, decimals = 2 } = opts;
  const num = Number(value || 0);
  const prefix = withSymbol ? '₹' : '';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1_00_00_000) {
    const cr = num / 1_00_00_000;
    return `${prefix}${sign}${trimZeros(cr.toFixed(decimals))} Cr`;
  }
  if (abs >= 1_00_000) {
    const lakh = num / 1_00_000;
    return `${prefix}${sign}${trimZeros(lakh.toFixed(decimals))} L`;
  }
  if (abs >= 1_000) {
    return `${prefix}${num.toLocaleString('en-IN')}`;
  }
  return `${prefix}${num.toLocaleString('en-IN')}`;
}

/**
 * Full Indian grouping: "₹1,25,00,000" instead of "₹12,500,000".
 */
export function formatINR(value, opts = {}) {
  const { withSymbol = true } = opts;
  const num = Number(value || 0);
  const prefix = withSymbol ? '₹' : '';
  return `${prefix}${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function trimZeros(s) {
  // "1.50" -> "1.5", "1.00" -> "1"
  if (!s.includes('.')) return s;
  return s.replace(/\.?0+$/, '');
}

/**
 * Return GST-inclusive label for a price in rupees.
 *   499 -> "₹499 (incl. 18% GST)"
 */
export function withGstLabel(priceInr) {
  return `${formatINR(priceInr)} (incl. 18% GST)`;
}
