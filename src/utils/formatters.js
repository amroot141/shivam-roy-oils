/**
 * Formatting helpers for Shivam Roy Oils
 */

/**
 * Formats a number as Indian Rupee currency (₹)
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount = 0) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(num);
}

/**
 * Formats an ISO date/timestamp to readable local format
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

/**
 * Formats a 10-digit Indian phone number (e.g. +91 98765 43210)
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone = '') {
  const clean = String(phone).replace(/\D/g, '');
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return phone;
}

/**
 * Formats unit labels with proper pluralization
 * @param {string} unit
 * @param {number} qty
 * @returns {string}
 */
export function formatUnit(unit = 'bottle', qty = 1) {
  const normalized = String(unit).toLowerCase();
  if (qty > 1) {
    if (normalized === 'bottle') return 'bottles';
    if (normalized === 'piece') return 'pieces';
    if (normalized === 'liter') return 'liters';
    if (normalized === 'kg') return 'kg';
  }
  return normalized;
}
