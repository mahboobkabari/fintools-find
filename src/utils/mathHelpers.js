/**
 * Calculate percentage share safely without division-by-zero.
 *
 * @param {number} part
 * @param {number} total
 * @returns {number} Integer percentage (0–100)
 */
export function calculatePercentage(part, total) {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((part / total) * 100)));
}

/**
 * Clamp a number between min and max bounds.
 *
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  const num = Number(val) || 0;
  return Math.min(max, Math.max(min, num));
}

/**
 * Round a number to a specified number of decimal places.
 *
 * @param {number} val
 * @param {number} [decimals=2]
 * @returns {number}
 */
export function roundToDecimals(val, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
