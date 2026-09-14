import React from 'react';
import { Modal } from './Modal';
import { Printer, CheckCircle2, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';

export function ReceiptModal({ isOpen, onClose, bill, storeSettings }) {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const storeName = storeSettings?.store_name || 'Shivam Roy Oils';
  const storePhone = storeSettings?.phone || '+91 98765 01234';
  const storeAddress = storeSettings?.address || 'Shop 14, Kisan Mandi Complex, Ring Road';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Receipt #${bill.id}`} maxWidth="max-w-md">
      <div className="flex flex-col items-center">
        
        {/* Printable Bill Area */}
        <div id="printable-receipt" className="w-full bg-stone-50/70 border border-dashed border-stone-300 rounded-2xl p-5 text-stone-800 text-sm font-mono">
          {/* Store Brand Header */}
          <div className="text-center pb-4 border-b border-dashed border-stone-300">
            <div className="inline-flex items-center justify-center w-9 h-9 bg-amber-600 text-white rounded-xl mb-1.5 font-sans font-bold shadow-xs">
              S
            </div>
            <h4 className="font-sans font-bold text-base text-stone-900 leading-tight">
              {storeName}
            </h4>
            <p className="text-xs text-stone-500 font-sans mt-0.5">{storeAddress}</p>
            <p className="text-xs text-stone-500 font-sans">Tel: {storePhone}</p>
          </div>

          {/* Bill Meta */}
          <div className="py-3 border-b border-dashed border-stone-300 text-xs space-y-1 font-sans">
            <div className="flex justify-between">
              <span className="text-stone-500">Bill No:</span>
              <span className="font-semibold text-stone-800 font-mono">{bill.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date:</span>
              <span>{formatDate(bill.created_at)}</span>
            </div>
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
                <span className="text-right max-w-[200px] truncate">{bill.address}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Source:</span>
              <span className="uppercase text-[11px] font-semibold text-amber-700">
                {bill.feedback_source === 'self' ? 'Self-Checkout' : 'Counter POS'}
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
                {(bill.items || []).map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1.5 font-medium text-stone-900 max-w-[130px] pr-1">
                      {item.product_name}
                      {bill.feedback !== 'none' && Number(item.discount_percent) > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-semibold">
                          ({item.discount_percent}% off applied)
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Calculations */}
          <div className="py-3 border-b border-dashed border-stone-300 space-y-1.5 text-xs font-sans">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal ({bill.num_items} items):</span>
              <span className="font-semibold text-stone-800">{formatCurrency(bill.subtotal)}</span>
            </div>

            {Number(bill.discount_amount) > 0 ? (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} /> {bill.feedback_source === 'staff' ? 'Counter Discount:' : 'Feedback Discount:'}
                </span>
                <span>- {formatCurrency(bill.discount_amount)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-stone-400 text-[11px]">
                <span>Discount:</span>
                <span>₹0 (None)</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
              <span>Grand Total:</span>
              <span className="text-amber-700">{formatCurrency(bill.total_amount)}</span>
            </div>
          </div>

          {/* Payment & Feedback Info */}
          <div className="pt-3 text-xs font-sans space-y-1">
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

            <div className="flex justify-between items-center pt-2">
              <span className="text-stone-500">Customer Feedback:</span>
              {bill.feedback === 'good' ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                  <ThumbsUp size={12} /> Good Experience
                </span>
              ) : bill.feedback === 'bad' ? (
                <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs">
                  <ThumbsDown size={12} /> Needs Improvement
                </span>
              ) : (
                <span className="text-stone-400 text-xs">No feedback</span>
              )}
            </div>
          </div>

          {/* Footer message */}
          <div className="mt-4 pt-3 text-center border-t border-dashed border-stone-300 text-[11px] text-stone-400 font-sans">
            <p>Thank you for supporting pure &amp; organic produce!</p>
            <p className="font-medium text-amber-800/80">www.shivamroyoils.in</p>
          </div>
        </div>

        {/* Action Buttons (Excluded from print) */}
        <div className="flex items-center gap-3 w-full mt-5 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-semibold shadow-md transition-all active:scale-98"
          >
            <Printer size={18} />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
}
