import { clamp } from './mathHelpers.js';

/**
 * Sanitize numeric user inputs into safe numbers bounded within min/max.
 *
 * @param {any} input
 * @param {number} [defaultVal=0]
 * @param {number} [min=0]
 * @param {number} [max=100000000]
 * @returns {number}
 */
export function sanitizeNumber(input, defaultVal = 0, min = 0, max = 100000000) {
  if (input === null || input === undefined || input === '') {
    return defaultVal;
  }
  const parsed = Number(input);
  if (isNaN(parsed)) {
    return defaultVal;
  }
  return clamp(parsed, min, max);
}
