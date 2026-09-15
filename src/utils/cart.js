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
export function cartDiscount(items = [], feedback = 'good', isEnabled = true) {
  let enabled = true;
  let feedbackVal = 'good';

  if (typeof isEnabled === 'boolean') {
    enabled = isEnabled;
    if (typeof feedback === 'string') {
      feedbackVal = feedback;
    }
  } else if (typeof feedback === 'boolean') {
    enabled = feedback;
  } else if (typeof feedback === 'string') {
    feedbackVal = feedback;
  }

  if (!enabled || feedbackVal === 'none') return 0;
  if (!Array.isArray(items) || items.length === 0) return 0;

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

/**
 * Builds standard or custom UPI deep link for merchant payment.
 * Supports custom deep link templates with dynamic placeholders ({amount}, {vpa}, {store_name}).
 * 
 * @param {Object} settings - Store settings object
 * @param {number} amount - Bill total amount
 * @returns {string} Fully resolved UPI URL
 */
export function buildUpiDeepLink(settings = {}, amount = 0) {
  const upiVpa = (settings?.upi_vpa || 'shivamroyoilco@upi').trim();
  const storeName = (settings?.store_name || 'M/S SHIVAMROY OIL AND COMPANY').trim();
  const formattedAmt = (Math.max(0, Number(amount) || 0)).toFixed(2);

  const customTemplate = (settings?.custom_upi_deep_link || '').trim();

  if (customTemplate) {
    let customLink = customTemplate
      .replace(/\{amount\}/g, formattedAmt)
      .replace(/\{vpa\}/g, encodeURIComponent(upiVpa))
      .replace(/\{store_name\}/g, encodeURIComponent(storeName));
    
    // If it's a standard upi:// scheme without am=, append &am=amount automatically
    if (customLink.startsWith('upi://') && !customLink.includes('am=')) {
      const sep = customLink.includes('?') ? '&' : '?';
      customLink += `${sep}am=${formattedAmt}`;
    }

    return customLink;
  }

  // Default Standard UPI Deep Link
  return `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(storeName)}&am=${formattedAmt}&cu=INR&tn=${encodeURIComponent(`Payment to ${storeName}`)}`;
}

/**
 * Generates and triggers download of a styled, printable HTML invoice for the bill.
 * @param {Object} bill
 * @param {Object} storeSettings
 */
export function downloadBillReceipt(bill, storeSettings = {}) {
  if (!bill) return;
  const storeName = storeSettings?.receipt_store_name || storeSettings?.store_name || 'M/S SHIVAMROY OIL AND COMPANY';
  const address = storeSettings?.receipt_address || storeSettings?.address || 'Shop 14, Kisan Mandi Complex, Ring Road';
  const phone = storeSettings?.receipt_phone || storeSettings?.phone || '+91 98765 01234';
  const gstin = storeSettings?.receipt_gstin || storeSettings?.gstin || '';
  const fssaiNo = storeSettings?.receipt_fssai_no || storeSettings?.fssai_no || '';
  const msmeNo = storeSettings?.receipt_msme_no || storeSettings?.msme_no || '';
  const logoUrl = storeSettings?.receipt_logo_url || storeSettings?.store_logo_url || '';
  const showLogo = storeSettings?.receipt_show_logo !== false && !!logoUrl;
  const billId = bill.id || `BILL-${Date.now()}`;
  const dateStr = bill.created_at ? new Date(bill.created_at).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');

  const itemsRows = (bill.items || []).map((item) => {
    const hasFlatDisc = item.discount_type === 'flat' && Number(item.discount_flat) > 0;
    const hasPercentDisc = item.discount_type !== 'flat' && Number(item.discount_percent) > 0;
    const discountInfo = hasFlatDisc ? ` (₹${item.discount_flat} off)` : hasPercentDisc ? ` (${item.discount_percent}% off)` : '';

    return `
      <tr>
        <td style="padding: 9px 8px; border-bottom: 1px solid #e7e5e4;">
          <strong>${item.product_name || 'Product'}</strong>
          ${discountInfo ? `<span style="color: #059669; font-size: 11px; display: block;">${discountInfo}</span>` : ''}
        </td>
        <td style="padding: 9px 8px; text-align: center; border-bottom: 1px solid #e7e5e4;">${item.quantity} ${item.unit || ''}</td>
        <td style="padding: 9px 8px; text-align: right; border-bottom: 1px solid #e7e5e4;">₹${item.unit_price}</td>
        <td style="padding: 9px 8px; text-align: right; font-weight: bold; border-bottom: 1px solid #e7e5e4;">₹${item.line_total}</td>
      </tr>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invoice - ${billId} - ${storeName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fafaf9; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 20px; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { text-align: center; border-bottom: 1px dashed #d6d3d1; padding-bottom: 16px; }
    .store-title { font-size: 22px; font-weight: 800; color: #b45309; margin: 0 0 4px 0; }
    .store-info { font-size: 12px; color: #78716c; margin: 2px 0; }
    .bill-badge { display: inline-block; background: #f5f5f4; font-family: monospace; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-top: 8px; color: #44403c; }
    .meta { font-size: 12px; padding: 14px 0; border-bottom: 1px dashed #d6d3d1; }
    .meta-row { display: flex; justify-content: space-between; margin: 4px 0; }
    .meta-lbl { color: #a8a29e; }
    .meta-val { font-weight: 600; color: #292524; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 16px 0; }
    th { text-align: left; padding: 8px; color: #78716c; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #d6d3d1; }
    .totals { border-top: 1px dashed #d6d3d1; padding-top: 12px; font-size: 13px; }
    .tot-row { display: flex; justify-content: space-between; margin: 5px 0; }
    .savings { background: #ecfdf5; color: #059669; font-weight: 700; padding: 6px 10px; border-radius: 10px; margin: 6px 0; }
    .grand { font-size: 18px; font-weight: 900; color: #b45309; border-top: 1px solid #e7e5e4; padding-top: 10px; margin-top: 8px; }
    .footer { text-align: center; font-size: 11px; color: #a8a29e; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #d6d3d1; }
    @media print {
      body { background: white; padding: 0; }
      .card { border: none; box-shadow: none; max-width: 100%; padding: 12px; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      ${showLogo ? `<img src="${logoUrl}" alt="Store Logo" style="max-height: 52px; max-width: 160px; object-fit: contain; margin-bottom: 6px; display: inline-block;" />` : ''}
      <h1 class="store-title">${storeName}</h1>
      <div class="store-info">${address}</div>
      <div class="store-info">Phone: ${phone}</div>
      ${gstin ? `<div class="store-info" style="font-family: monospace;">GSTIN: ${gstin}</div>` : ''}
      ${fssaiNo ? `<div class="store-info" style="font-family: monospace;">FSSAI Lic. No: ${fssaiNo}</div>` : ''}
      ${msmeNo ? `<div class="store-info" style="font-family: monospace;">MSME Reg. No: ${msmeNo}</div>` : ''}
      <div class="bill-badge">${billId}</div>
    </div>
    <div class="meta">
      <div class="meta-row"><span class="meta-lbl">Date & Time:</span><span class="meta-val">${dateStr}</span></div>
      <div class="meta-row"><span class="meta-lbl">Customer:</span><span class="meta-val">${bill.customer_name || 'Walk-in Customer'}</span></div>
      ${bill.phone ? `<div class="meta-row"><span class="meta-lbl">Phone:</span><span class="meta-val">${bill.phone}</span></div>` : ''}
      ${bill.address ? `<div class="meta-row"><span class="meta-lbl">Address:</span><span class="meta-val">${bill.address}</span></div>` : ''}
    </div>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Rate</th>
          <th style="text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
    <div class="totals">
      <div class="tot-row"><span>Subtotal:</span><span>₹${bill.subtotal}</span></div>
      ${bill.discount_amount > 0 ? `<div class="tot-row savings"><span>Discount Applied:</span><span>- ₹${bill.discount_amount}</span></div>` : ''}
      <div class="tot-row grand"><span>Final Paid:</span><span>₹${bill.total_amount}</span></div>
      <div class="tot-row" style="font-size:11px; color:#78716c; margin-top:6px;"><span>Payment Method:</span><span style="font-weight:700; text-transform:uppercase;">${bill.payment_method}</span></div>
      ${bill.payment_method === 'cash' && bill.cash_given ? `
        <div class="tot-row" style="font-size:11px; color:#78716c;"><span>Cash Given:</span><span>₹${bill.cash_given}</span></div>
        <div class="tot-row" style="font-size:11px; color:#059669; font-weight:700;"><span>Change Returned:</span><span>₹${bill.change_returned || 0}</span></div>
      ` : ''}
    </div>
    <div class="footer">
      <p>Thank you for your purchase with ${storeName}!</p>
      <p style="margin-top: 4px;">Visit us again soon.</p>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${storeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${billId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
