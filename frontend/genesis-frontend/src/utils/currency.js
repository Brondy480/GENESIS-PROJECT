/**
 * Genesis Platform — Currency Utility
 * All monetary values are in Central African Franc (XAF / FCFA)
 */

/**
 * Format a number as FCFA currency.
 * e.g. 10000 → "10,000 FCFA"
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "0 FCFA";
  return `${Number(amount).toLocaleString()} FCFA`;
};

/**
 * Short alias for formatCurrency.
 */
export const fcfa = formatCurrency;

/**
 * Currency code for API/backend use.
 */
export const CURRENCY_CODE = "XAF";

/**
 * Currency symbol for short inline use.
 */
export const CURRENCY_SYMBOL = "FCFA";
