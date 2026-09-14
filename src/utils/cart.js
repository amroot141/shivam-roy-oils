/**
 * Shared Cart Math & Logic Utility for Shivam Roy Oils
 * Ensures customer self-checkout and staff counter carts never drift.
 */

/**
 * Calculates the raw subtotal of items in the cart
 * @param {Array<{ unit_price: number, quantity: number }>} items
 * @returns {number} Subtotal rounded to 2 decimal places
 */
export function cartSubtotal(items = []) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.unit_price) || 0;
    const qty = Number(item.quantity) || 0;
    return acc + price * qty;
  }, 0);
  return Math.round(subtotal * 100) / 100;
}

/**
 * Calculates total discount based on customer feedback state and admin toggle.
 * CRUCIAL LOGIC:
 * - isEnabled === false (Admin toggle OFF): Returns 0.
 * - Feedback 'good' or 'bad' (from self-checkout): Unlocks product-level discount.
 * - Feedback 'none' (or staff counter checkout): Zero discount applied.
 * 
 * Supports two discount types per item:
 * - 'percent' (default): Uses discount_percent field (e.g. 8% off)
 * - 'flat': Uses discount_flat field (e.g. ₹15 off per unit)
 * 
 * @param {Array<{ unit_price: number, quantity: number, discount_type?: string, discount_percent?: number, discount_flat?: number }>} items
 * @param {'good' | 'bad' | 'none'} [feedback='none']
 * @param {boolean} [isEnabled=true]
 * @returns {number} Total discount amount rounded to 2 decimal places
 */
export function cartDiscount(items = [], feedback = 'none', isEnabled = true) {
  if (!isEnabled) return 0;
  if (!Array.isArray(items) || items.length === 0) return 0;
  // Only apply discount if feedback is 'good' or 'bad'
  if (feedback !== 'good' && feedback !== 'bad') {
    return 0;
  }

  const discount = items.reduce((acc, item) => {
    const price = Number(item.unit_price) || 0;
    const qty = Number(item.quantity) || 0;
    const type = item.discount_type || 'percent';

    let itemDiscount = 0;
    if (type === 'flat') {
      const flatAmt = Number(item.discount_flat) || 0;
      if (flatAmt <= 0) return acc;
      // Flat discount per unit, capped at unit price
      itemDiscount = Math.min(flatAmt, price) * qty;
    } else {
      // Percent discount (default)
      const pct = Number(item.discount_percent) || 0;
      if (pct <= 0) return acc;
      itemDiscount = (price * (pct / 100)) * qty;
    }
    return acc + itemDiscount;
  }, 0);

  return Math.round(discount * 100) / 100;
}

/**
 * Calculates manual discount for staff checkout.
 * Supports percentage ('percent') or fixed amount ('fixed').
 * 
 * @param {number} subtotal
 * @param {'percent' | 'fixed'} type
 * @param {number|string} value
 * @returns {number} Discount amount rounded to 2 decimal places
 */
export function calculateManualDiscount(subtotal = 0, type = 'percent', value = 0) {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const numVal = Math.max(0, Number(value) || 0);

  if (safeSubtotal <= 0 || numVal <= 0) return 0;

  if (type === 'percent') {
    const clampedPct = Math.min(100, numVal);
    const amount = (safeSubtotal * clampedPct) / 100;
    return Math.round(amount * 100) / 100;
  }

  // Fixed rupee amount (clamped so discount cannot exceed subtotal)
  const amount = Math.min(safeSubtotal, numVal);
  return Math.round(amount * 100) / 100;
}

/**
 * Calculates final total after discount
 * @param {number} subtotal
 * @param {number} discount
 * @returns {number}
 */
export function cartTotal(subtotal = 0, discount = 0) {
  const safeSubtotal = Number(subtotal) || 0;
  const safeDiscount = Number(discount) || 0;
  return Math.max(0, Math.round((safeSubtotal - safeDiscount) * 100) / 100);
}

/**
 * Counts total quantity of units across all cart items
 * @param {Array<{ quantity: number }>} items
 * @returns {number}
 */
export function cartNumItems(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
}

/**
 * Builds standard bill line items from cart items and inventory source
 * Ensures items match the Bill schema:
 * { product_id, product_name, unit, unit_price, quantity, line_total, discount_type, discount_percent, discount_flat }
 * 
 * @param {Array<{ id: string, quantity: number }>} cartItems
 * @param {Array<Object>} inventoryList
 * @returns {Array<Object>}
 */
export function buildBillItems(cartItems = [], inventoryList = []) {
  if (!Array.isArray(cartItems)) return [];

  const inventoryMap = new Map();
  if (Array.isArray(inventoryList)) {
    inventoryList.forEach(prod => {
      inventoryMap.set(prod.id, prod);
    });
  }

  return cartItems
    .filter(item => Number(item.quantity) > 0)
    .map(item => {
      const product = inventoryMap.get(item.id || item.product_id) || item;
      const unitPrice = Number(product.unit_price) || 0;
      const quantity = Number(item.quantity) || 0;
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;

      return {
        product_id: product.id || item.id,
        product_name: product.product_name || item.product_name || 'Item',
        unit: product.unit || 'bottle',
        unit_price: unitPrice,
        quantity: quantity,
        line_total: lineTotal,
        discount_type: product.discount_type || 'percent',
        discount_percent: Number(product.discount_percent) || 0,
        discount_flat: Number(product.discount_flat) || 0
      };
    });
}
