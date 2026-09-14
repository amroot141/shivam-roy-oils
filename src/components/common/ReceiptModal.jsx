import React from 'react';
import { Modal } from './Modal';
import { Printer, CheckCircle2, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';
import { printThermalReceipt } from '../../utils/printer';

export function ReceiptModal({ isOpen, onClose, bill, storeSettings }) {
  if (!bill) return null;

  const handlePrint = () => {
    printThermalReceipt({ bill, storeSettings });
  };

  const storeName = storeSettings?.receipt_store_name || storeSettings?.store_name || 'Shivam Roy Oils';
  const storeTagline = storeSettings?.receipt_tagline || storeSettings?.tagline || 'Farm-Fresh Cold Pressed Oils & Spices';
  const storePhone = storeSettings?.receipt_phone || storeSettings?.phone || '+91 98765 01234';
  const storeAddress = storeSettings?.receipt_address || storeSettings?.address || 'Shop 14, Kisan Mandi Complex, Ring Road';
  const storeGSTIN = storeSettings?.receipt_gstin || '';
  const headerNote = storeSettings?.receipt_header_note || 'Tax Invoice / Retail Bill';
  const footerNote = storeSettings?.receipt_footer_note || 'Thank you for supporting pure & organic produce! Visit again.';
  const showCustomerInfo = storeSettings?.receipt_show_customer_info !== false;
  const showDiscounts = storeSettings?.receipt_show_discounts !== false;
  const showPaymentMode = storeSettings?.receipt_show_payment_mode !== false;
  const paperWidthClass = storeSettings?.receipt_paper_width === '58mm' ? 'max-w-[300px]' : 'max-w-md';

  const storeInitial = storeName.charAt(0).toUpperCase() || 'S';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Receipt #${bill.id}`} maxWidth={paperWidthClass}>
      <div className="flex flex-col items-center">
        
        {/* Printable Bill Area */}
        <div id="printable-receipt" className={`w-full bg-stone-50/70 border border-dashed border-stone-300 rounded-2xl p-5 text-stone-800 text-sm font-mono ${paperWidthClass}`}>
          {/* Store Brand Header */}
          <div className="text-center pb-3 border-b border-dashed border-stone-300">
            <div className="inline-flex items-center justify-center w-9 h-9 bg-amber-600 text-white rounded-xl mb-1 font-sans font-bold shadow-xs">
              {storeInitial}
            </div>
            <h4 className="font-sans font-bold text-base text-stone-900 leading-tight">
              {storeName}
            </h4>
            {storeTagline && <p className="text-[11px] text-amber-700 font-sans font-medium">{storeTagline}</p>}
            <p className="text-xs text-stone-500 font-sans mt-0.5">{storeAddress}</p>
            <p className="text-xs text-stone-500 font-sans">Tel: {storePhone}</p>
            {storeGSTIN && <p className="text-[10px] text-stone-400 font-mono mt-0.5">GSTIN: {storeGSTIN}</p>}
            <div className="inline-block px-2 py-0.5 bg-stone-200/80 text-stone-700 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1.5 font-sans">
              {headerNote}
            </div>
          </div>

          {/* Bill Meta */}
          <div className="py-2.5 border-b border-dashed border-stone-300 text-xs space-y-1 font-sans">
            <div className="flex justify-between">
              <span className="text-stone-500">Bill No:</span>
              <span className="font-semibold text-stone-800 font-mono">{bill.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date:</span>
              <span>{formatDate(bill.created_at)}</span>
            </div>
            {showCustomerInfo && (
              <>
                <div className="flex justify-between">
                  <span className="text-stone-500">Customer:</span>
                  <span className="font-medium text-stone-900">{bill.customer_name || 'Walk-in'}</span>
                </div>
                {bill.phone && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Phone:</span>
                    <span>{formatPhone(bill.phone)}</span>
                  </div>
                )}
                {bill.address && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Address:</span>
                    <span className="text-right max-w-[180px] truncate">{bill.address}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Counter / Type:</span>
              <span className="uppercase text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                {bill.feedback_source === 'self' ? 'Self-Checkout' : 'Cashier Counter'}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-3 border-b border-dashed border-stone-300">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="text-stone-400 border-b border-stone-200 pb-1">
                  <th className="text-left font-medium pb-1">Item</th>
                  <th className="text-center font-medium pb-1">Qty</th>
                  <th className="text-right font-medium pb-1">Rate</th>
                  <th className="text-right font-medium pb-1">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(bill.items || []).map((item, idx) => {
                  const hasFlatDisc = item.discount_type === 'flat' && Number(item.discount_flat) > 0;
                  const hasPercentDisc = item.discount_type !== 'flat' && Number(item.discount_percent) > 0;

                  return (
                    <tr key={idx} className="py-1">
                      <td className="py-1.5 font-medium text-stone-900 max-w-[130px] pr-1">
                        {item.product_name}
                        {showDiscounts && bill.feedback !== 'none' && (hasFlatDisc || hasPercentDisc) && (
                          <span className="block text-[10px] text-emerald-600 font-semibold">
                            ({hasFlatDisc ? `₹${item.discount_flat} off` : `${item.discount_percent}% off`})
                          </span>
                        )}
                      </td>
                      <td className="text-center py-1.5 text-stone-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="text-right py-1.5 text-stone-600">
                        ₹{item.unit_price}
                      </td>
                      <td className="text-right py-1.5 font-semibold text-stone-800">
                        ₹{item.line_total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals & Calculations */}
          <div className="py-3 border-b border-dashed border-stone-300 space-y-1.5 text-xs font-sans">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal ({bill.num_items} items):</span>
              <span className="font-semibold text-stone-800">{formatCurrency(bill.subtotal)}</span>
            </div>

            {Number(bill.discount_amount) > 0 && showDiscounts ? (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} /> {bill.feedback_source === 'staff' ? 'Counter Discount:' : 'Reward Discount:'}
                </span>
                <span>- {formatCurrency(bill.discount_amount)}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
              <span>Grand Total:</span>
              <span className="text-amber-700">{formatCurrency(bill.total_amount)}</span>
            </div>
          </div>

          {/* Payment & Feedback Info */}
          {showPaymentMode && (
            <div className="pt-2.5 text-xs font-sans space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Mode:</span>
                <span className="font-semibold uppercase text-stone-800">
                  {bill.payment_method}
                </span>
              </div>

              {bill.payment_method === 'cash' && bill.cash_given && (
                <>
                  <div className="flex justify-between text-stone-600">
                    <span>Cash Tendered:</span>
                    <span>{formatCurrency(bill.cash_given)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Change Returned:</span>
                    <span>{formatCurrency(bill.change_returned || 0)}</span>
                  </div>
                </>
              )}

              {bill.feedback && bill.feedback !== 'none' && (
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-stone-500">Feedback:</span>
                  {bill.feedback === 'good' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                      <ThumbsUp size={12} /> Positive
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs">
                      <ThumbsDown size={12} /> Needs Improvement
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer message */}
          {footerNote && (
            <div className="mt-3.5 pt-2.5 text-center border-t border-dashed border-stone-300 text-[11px] text-stone-500 font-sans">
              <p>{footerNote}</p>
            </div>
          )}
        </div>

        {/* Action Buttons (Excluded from print) */}
        <div className="flex items-center gap-3 w-full mt-5 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-semibold shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Printer size={18} />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
}
