/**
 * Thermal POS Receipt Printer Utility for M/S SHIVAMROY OIL AND COMPANY
 * Handles high-precision 80mm / 58mm thermal printing & standard printer slips.
 */
import { formatCurrency, formatDate, formatPhone } from './formatters';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generates clean standalone HTML for thermal receipts
 */
export function generateThermalReceiptHTML({ bill, storeSettings = {} }) {
  if (!bill) return '';

  const storeName = storeSettings?.receipt_store_name || storeSettings?.store_name || 'M/S SHIVAMROY OIL AND COMPANY';
  const storeTagline = storeSettings?.receipt_tagline || storeSettings?.tagline || 'Farm-Fresh Cold Pressed Oils & Spices';
  const storePhone = storeSettings?.receipt_phone || storeSettings?.phone || '+91 98765 01234';
  const storeAddress = storeSettings?.receipt_address || storeSettings?.address || 'Shop 14, Kisan Mandi Complex, Ring Road';
  const storeGSTIN = storeSettings?.receipt_gstin || '';
  const storeFssaiNo = storeSettings?.receipt_fssai_no || storeSettings?.fssai_no || '';
  const storeMsmeNo = storeSettings?.receipt_msme_no || storeSettings?.msme_no || '';
  const receiptLogoUrl = storeSettings?.receipt_logo_url || storeSettings?.store_logo_url || '';
  const showLogo = storeSettings?.receipt_show_logo !== false && !!receiptLogoUrl;
  const headerNote = storeSettings?.receipt_header_note || 'TAX INVOICE / RETAIL BILL';
  const footerNote = storeSettings?.receipt_footer_note || 'Thank you for supporting pure & organic produce! Visit again.';
  const showCustomerInfo = storeSettings?.receipt_show_customer_info !== false;
  const showDiscounts = storeSettings?.receipt_show_discounts !== false;
  const showPaymentMode = storeSettings?.receipt_show_payment_mode !== false;
  const is58mm = storeSettings?.receipt_paper_width === '58mm';
  const receiptWidth = is58mm ? '58mm' : '80mm';
  const storeInitial = (storeName || 'S').charAt(0).toUpperCase();

  const numItems = bill.num_items || bill.items?.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0) || bill.items?.length || 0;

  // Build items rows
  const itemsHtml = (bill.items || []).map((item) => {
    const hasFlatDisc = item.discount_type === 'flat' && Number(item.discount_flat) > 0;
    const hasPercentDisc = item.discount_type !== 'flat' && Number(item.discount_percent) > 0;
    const discLabel = showDiscounts && bill.feedback !== 'none' && (hasFlatDisc || hasPercentDisc)
      ? `<div style="font-size: 10px; color: #166534; font-weight: 600;">(${hasFlatDisc ? `₹${item.discount_flat} off` : `${item.discount_percent}% off`})</div>`
      : '';

    return `
      <tr>
        <td style="padding: 4px 2px; text-align: left; vertical-align: top; max-width: 140px; word-break: break-word;">
          <div style="font-weight: 600; color: #000;">${escapeHtml(item.product_name || 'Product')}</div>
          ${discLabel}
        </td>
        <td style="padding: 4px 2px; text-align: center; vertical-align: top; color: #333; white-space: nowrap;">
          ${item.quantity} ${escapeHtml(item.unit || '')}
        </td>
        <td style="padding: 4px 2px; text-align: right; vertical-align: top; color: #333; white-space: nowrap;">
          ₹${item.unit_price}
        </td>
        <td style="padding: 4px 2px; text-align: right; vertical-align: top; font-weight: 700; color: #000; white-space: nowrap;">
          ₹${item.line_total}
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Receipt #${escapeHtml(bill.id)} - ${escapeHtml(storeName)}</title>
  <style>
    @page {
      size: ${receiptWidth} auto;
      margin: 0;
    }
    @media print {
      html, body {
        width: 100%;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
      }
      .receipt-wrapper {
        box-shadow: none !important;
        border: none !important;
        padding: 4mm !important;
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.35;
      color: #000;
      background: #fff;
      display: flex;
      justify-content: center;
      padding: 6px;
    }
    .receipt-wrapper {
      width: 100%;
      max-width: ${receiptWidth};
      background: #fff;
      padding: 6px 4px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .bold { font-weight: 700; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .divider {
      border-top: 1px dashed #777;
      margin: 7px 0;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
      font-size: 11px;
    }
    .meta-lbl {
      color: #555;
    }
    .meta-val {
      font-weight: 600;
      color: #000;
    }
    .store-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background-color: #d97706;
      color: #fff;
      font-weight: 800;
      font-size: 16px;
      border-radius: 8px;
      margin-bottom: 4px;
    }
    .store-name {
      font-size: 15px;
      font-weight: 800;
      color: #000;
      line-height: 1.2;
    }
    .store-tagline {
      font-size: 10.5px;
      font-weight: 600;
      color: #b45309;
      margin-top: 2px;
    }
    .store-sub {
      font-size: 11px;
      color: #555;
      margin-top: 1px;
    }
    .header-badge {
      display: inline-block;
      font-size: 9.5px;
      font-weight: 700;
      background: #eee;
      color: #222;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      margin-top: 5px;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin: 4px 0;
    }
    th {
      font-size: 10px;
      font-weight: 700;
      color: #555;
      text-transform: uppercase;
      padding-bottom: 4px;
      border-bottom: 1px solid #ccc;
    }
    .grand-total-row {
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      font-weight: 900;
      color: #000;
      padding-top: 6px;
      margin-top: 4px;
      border-top: 1px solid #000;
    }
    .footer-text {
      text-align: center;
      font-size: 10.5px;
      color: #555;
      padding-top: 6px;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <div class="receipt-wrapper">
    <!-- Header -->
    <div class="text-center">
      ${showLogo ? `
        <div style="margin-bottom: 4px;">
          <img src="${escapeHtml(receiptLogoUrl)}" alt="Store Logo" style="max-height: 48px; max-width: 140px; object-fit: contain; display: inline-block;" />
        </div>
      ` : `
        <div class="store-badge">${storeInitial}</div>
      `}
      <div class="store-name">${escapeHtml(storeName)}</div>
      ${storeTagline ? `<div class="store-tagline">${escapeHtml(storeTagline)}</div>` : ''}
      <div class="store-sub">${escapeHtml(storeAddress)}</div>
      <div class="store-sub">Tel: ${escapeHtml(storePhone)}</div>
      ${storeGSTIN ? `<div class="store-sub font-mono" style="font-size: 10px;">GSTIN: ${escapeHtml(storeGSTIN)}</div>` : ''}
      ${storeFssaiNo ? `<div class="store-sub font-mono" style="font-size: 10px;">FSSAI Lic. No: ${escapeHtml(storeFssaiNo)}</div>` : ''}
      ${storeMsmeNo ? `<div class="store-sub font-mono" style="font-size: 10px;">MSME Reg. No: ${escapeHtml(storeMsmeNo)}</div>` : ''}
      <div><span class="header-badge">${escapeHtml(headerNote)}</span></div>
    </div>

    <div class="divider"></div>

    <!-- Metadata -->
    <div class="meta-row">
      <span class="meta-lbl">Bill No:</span>
      <span class="meta-val font-mono">${escapeHtml(bill.id)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-lbl">Date:</span>
      <span class="meta-val">${formatDate(bill.created_at)}</span>
    </div>
    ${showCustomerInfo ? `
      <div class="meta-row">
        <span class="meta-lbl">Customer:</span>
        <span class="meta-val">${escapeHtml(bill.customer_name || 'Walk-in Customer')}</span>
      </div>
      ${bill.phone ? `
        <div class="meta-row">
          <span class="meta-lbl">Phone:</span>
          <span class="meta-val">${formatPhone(bill.phone)}</span>
        </div>
      ` : ''}
      ${bill.address ? `
        <div class="meta-row">
          <span class="meta-lbl">Address:</span>
          <span class="meta-val" style="max-width: 150px; text-align: right; word-break: break-word;">${escapeHtml(bill.address)}</span>
        </div>
      ` : ''}
    ` : ''}
    <div class="meta-row">
      <span class="meta-lbl">Counter / Type:</span>
      <span class="meta-val" style="font-size: 10px; text-transform: uppercase;">
        ${bill.feedback_source === 'self' ? 'Self-Checkout' : 'Cashier Counter'}
      </span>
    </div>

    <div class="divider"></div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="text-align: left;">Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Rate</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="divider"></div>

    <!-- Totals -->
    <div class="meta-row">
      <span class="meta-lbl">Subtotal (${numItems} items):</span>
      <span class="meta-val font-mono">${formatCurrency(bill.subtotal)}</span>
    </div>

    ${Number(bill.discount_amount) > 0 && showDiscounts ? `
      <div class="meta-row" style="color: #166534;">
        <span class="meta-lbl" style="color: #166534; font-weight: 600;">
          ${bill.feedback_source === 'staff' ? 'Counter Discount:' : 'Reward Discount:'}
        </span>
        <span class="font-mono bold" style="color: #166534;">- ${formatCurrency(bill.discount_amount)}</span>
      </div>
    ` : ''}

    <div class="grand-total-row">
      <span>Grand Total:</span>
      <span class="font-mono">${formatCurrency(bill.total_amount)}</span>
    </div>

    <!-- Payment details -->
    ${showPaymentMode ? `
      <div class="divider"></div>
      <div class="meta-row">
        <span class="meta-lbl">Payment Mode:</span>
        <span class="meta-val" style="text-transform: uppercase;">${escapeHtml(bill.payment_method || 'CASH')}</span>
      </div>
      ${bill.payment_method === 'cash' && bill.cash_given ? `
        <div class="meta-row">
          <span class="meta-lbl">Cash Tendered:</span>
          <span class="meta-val font-mono">${formatCurrency(bill.cash_given)}</span>
        </div>
        <div class="meta-row">
          <span class="meta-lbl" style="font-weight: 700; color: #166534;">Change Returned:</span>
          <span class="meta-val font-mono bold" style="color: #166534; font-size: 13px;">${formatCurrency(bill.change_returned || 0)}</span>
        </div>
      ` : ''}
      ${bill.feedback && bill.feedback !== 'none' ? `
        <div class="meta-row" style="margin-top: 4px;">
          <span class="meta-lbl">Customer Rating:</span>
          <span class="meta-val">${bill.feedback === 'good' ? 'Positive (★ Highly Satisfied)' : 'Constructive Feedback'}</span>
        </div>
      ` : ''}
    ` : ''}

    <!-- Footer -->
    ${footerNote ? `
      <div class="divider"></div>
      <div class="footer-text">${escapeHtml(footerNote)}</div>
    ` : ''}
  </div>
</body>
</html>`;
}

/**
 * Initiates clean, isolated receipt printing via a hidden iframe
 */
export function printThermalReceipt({ bill, storeSettings = {} }) {
  if (!bill) return;

  const html = generateThermalReceiptHTML({ bill, storeSettings });

  // Remove any previous print iframe
  const existingIframe = document.getElementById('thermal-print-iframe');
  if (existingIframe) {
    try {
      existingIframe.remove();
    } catch (e) {}
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'thermal-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // Trigger print after rendering
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (printErr) {
        console.warn('Iframe print failed, falling back to window.print():', printErr);
        window.print();
      }
    }, 250);
  } catch (err) {
    console.error('Failed to write to print iframe:', err);
    window.print();
  }
}
