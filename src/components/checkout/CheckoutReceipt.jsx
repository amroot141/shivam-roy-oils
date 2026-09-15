import React from 'react';
import { 
  CheckCircle, 
  Printer, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  ThumbsUp, 
  ThumbsDown,
  ShoppingBag
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';
import { printThermalReceipt } from '../../utils/printer';

export function CheckoutReceipt({ bill, storeSettings, onReset }) {
  if (!bill) return null;

  const handlePrint = () => {
    printThermalReceipt({ bill, storeSettings });
  };

  const storeName = storeSettings?.store_name || 'M/S SHIVAMROY OIL AND COMPANY';

  return (
    <div className="max-w-xl mx-auto py-6">
      
      {/* Success Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mb-3 shadow-md shadow-emerald-500/20">
          <CheckCircle size={36} className="stroke-[2.5]" />
        </div>
        <h2 className="text-3xl font-extrabold text-stone-900 font-heading">
          Checkout Successful!
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Thank you, <strong className="text-stone-800">{bill.customer_name}</strong>! Your bill has been generated.
        </p>
      </div>

      {/* Printable Receipt Card */}
      <div 
        id="printable-receipt" 
        className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md mb-6 relative overflow-hidden"
      >
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500" />

        {/* Store Title */}
        <div className="text-center pb-4 border-b border-dashed border-stone-300">
          <h3 className="font-heading font-extrabold text-lg text-stone-900">
            {storeName}
          </h3>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            {storeSettings?.address || 'Shop 14, Kisan Mandi Complex, Ring Road'}
          </p>
          <div className="inline-block bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-mono font-bold mt-2">
            Bill #{bill.id}
          </div>
        </div>

        {/* Customer & Timestamp Meta */}
        <div className="py-3 border-b border-dashed border-stone-300 text-xs space-y-1 text-stone-600">
          <div className="flex justify-between">
            <span className="text-stone-400">Date &amp; Time:</span>
            <span>{formatDate(bill.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Customer Phone:</span>
            <span className="font-medium text-stone-800">{formatPhone(bill.phone)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Address:</span>
            <span className="font-medium text-stone-800 text-right max-w-[200px] truncate">{bill.address}</span>
          </div>
        </div>

        {/* Items List */}
        <div className="py-4 border-b border-dashed border-stone-300">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-stone-400 font-medium pb-2 border-b border-stone-100 text-left">
                <th className="pb-1.5">Item</th>
                <th className="text-center pb-1.5">Qty</th>
                <th className="text-right pb-1.5">Rate</th>
                <th className="text-right pb-1.5">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(bill.items || []).map((item, idx) => {
                const hasFlatDisc = item.discount_type === 'flat' && Number(item.discount_flat) > 0;
                const hasPercentDisc = item.discount_type !== 'flat' && Number(item.discount_percent) > 0;

                return (
                  <tr key={idx}>
                    <td className="py-2 text-stone-900 font-medium max-w-[150px]">
                      {item.product_name}
                      {bill.feedback !== 'none' && (hasFlatDisc || hasPercentDisc) && (
                        <span className="block text-[10px] text-emerald-600 font-semibold">
                          ({hasFlatDisc ? `₹${item.discount_flat} off` : `${item.discount_percent}% off`} applied)
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center text-stone-600">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 text-right text-stone-600">
                      ₹{item.unit_price}
                    </td>
                    <td className="py-2 text-right font-bold text-stone-900">
                      ₹{item.line_total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & Discounts */}
        <div className="py-4 border-b border-dashed border-stone-300 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal:</span>
            <span className="font-bold text-stone-900">{formatCurrency(bill.subtotal)}</span>
          </div>

          {Number(bill.discount_amount) > 0 ? (
            <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <span className="flex items-center gap-1">
                <Sparkles size={13} /> Feedback Reward Discount:
              </span>
              <span>- {formatCurrency(bill.discount_amount)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-stone-400">
              <span>Feedback Discount:</span>
              <span>₹0.00</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-black text-stone-950 pt-2 border-t border-stone-200">
            <span>Final Paid:</span>
            <span className="text-amber-700">{formatCurrency(bill.total_amount)}</span>
          </div>
        </div>

        {/* Payment and Feedback Meta */}
        <div className="pt-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-stone-400">Payment Type:</span>
            <span className="font-bold uppercase text-stone-800">{bill.payment_method}</span>
          </div>

          {bill.payment_method === 'cash' && bill.cash_given && (
            <>
              <div className="flex justify-between text-stone-600">
                <span className="text-stone-400">Cash Received:</span>
                <span>{formatCurrency(bill.cash_given)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Change Returned:</span>
                <span>{formatCurrency(bill.change_returned || 0)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-stone-400">Feedback Submitted:</span>
            {bill.feedback === 'good' ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                <ThumbsUp size={12} /> Positive
              </span>
            ) : bill.feedback === 'bad' ? (
              <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                <ThumbsDown size={12} /> Constructive
              </span>
            ) : (
              <span className="text-stone-400">None</span>
            )}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <Printer size={18} />
          <span>Print Receipt</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all active:scale-98 cursor-pointer"
        >
          <ShoppingBag size={18} />
          <span>Start New Checkout</span>
        </button>
      </div>

    </div>
  );
}
