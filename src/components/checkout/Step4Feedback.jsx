import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  Download, 
  ShoppingBag, 
  Check,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';
import { downloadBillReceipt } from '../../utils/cart';

export function Step4Feedback({ 
  feedback = 'good', 
  onSelectFeedback, 
  bill, 
  storeSettings = {}, 
  onReset,
  submitting = false
}) {
  const [downloaded, setDownloaded] = useState(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d97706', '#fbbf24', '#10b981', '#f59e0b']
      });
    } catch {
      // safe fallback
    }
  };

  const handleFeedbackClick = (sentiment) => {
    if (onSelectFeedback) {
      onSelectFeedback(sentiment);
    }
    triggerConfetti();
  };

  const handleDownload = () => {
    if (!bill) return;
    downloadBillReceipt(bill, storeSettings);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const storeName = storeSettings?.store_name || 'Shivam Roy Oils';
  const storeAddress = storeSettings?.address || 'Shop 14, Kisan Mandi Complex, Ring Road';
  const storePhone = storeSettings?.phone || '+91 98765 01234';

  if (submitting || !bill) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="font-heading font-bold text-lg text-stone-900">Finalizing Your Bill...</h3>
        <p className="text-xs text-stone-500 mt-1">Please wait while we record your order.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      
      {/* 1. Success Banner */}
      <div className="text-center no-print">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-600 rounded-3xl mb-3 shadow-md shadow-emerald-500/20">
          <CheckCircle2 size={32} className="stroke-[2.5]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Payment &amp; Checkout Complete!
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Thank you, <strong className="text-stone-800">{bill.customer_name || 'Valued Customer'}</strong>! Your bill is ready below.
        </p>
      </div>

      {/* 2. Customer Feedback Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs no-print">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={18} className="text-rose-500 fill-rose-500" />
          <h3 className="font-heading font-bold text-stone-900 text-sm sm:text-base">
            How was your shopping experience?
          </h3>
        </div>
        <p className="text-xs text-stone-500 mb-4">
          Your feedback helps us continuously improve our cold-pressed quality and counter speed.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Good Feedback */}
          <button
            type="button"
            onClick={() => handleFeedbackClick('good')}
            className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              feedback === 'good'
                ? 'border-emerald-500 bg-emerald-50/80 ring-4 ring-emerald-500/20 shadow-sm scale-101'
                : 'border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              feedback === 'good' ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              <ThumbsUp size={16} />
            </div>
            <div className="text-left">
              <span className="block font-bold text-xs text-stone-900 leading-tight">Good Shopping</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Positive</span>
            </div>
          </button>

          {/* Constructive / Needs Work */}
          <button
            type="button"
            onClick={() => handleFeedbackClick('bad')}
            className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              feedback === 'bad'
                ? 'border-amber-500 bg-amber-50/80 ring-4 ring-amber-500/20 shadow-sm scale-101'
                : 'border-stone-200 hover:border-amber-300 hover:bg-amber-50/30'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              feedback === 'bad' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              <ThumbsDown size={16} />
            </div>
            <div className="text-left">
              <span className="block font-bold text-xs text-stone-900 leading-tight">Needs Work</span>
              <span className="text-[10px] text-amber-800 font-semibold">Constructive</span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Download & Print Action Buttons */}
      <div className="grid grid-cols-2 gap-3 no-print">
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 active:scale-98 transition-all cursor-pointer"
        >
          {downloaded ? (
            <>
              <Check size={16} className="text-emerald-300 stroke-[3]" />
              <span>Bill Downloaded!</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Download Bill</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all cursor-pointer"
        >
          <Printer size={16} />
          <span>Print Bill</span>
        </button>
      </div>

      {/* 4. Complete Bill & Receipt Display */}
      <div 
        id="printable-receipt"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md relative overflow-hidden"
      >
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500" />

        {/* Store Title */}
        <div className="text-center pb-4 border-b border-dashed border-stone-300">
          <h3 className="font-heading font-extrabold text-lg text-stone-900">
            {storeName}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {storeAddress}
          </p>
          {storePhone && (
            <p className="text-[11px] text-stone-400 mt-0.5">
              Phone: {storePhone}
            </p>
          )}
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
            <span className="text-stone-400">Customer Name:</span>
            <span className="font-medium text-stone-800">{bill.customer_name || 'Walk-in Customer'}</span>
          </div>
          {bill.phone && (
            <div className="flex justify-between">
              <span className="text-stone-400">Phone:</span>
              <span className="font-medium text-stone-800">{formatPhone(bill.phone)}</span>
            </div>
          )}
          {bill.address && (
            <div className="flex justify-between">
              <span className="text-stone-400">Address:</span>
              <span className="font-medium text-stone-800 text-right max-w-[200px] truncate">{bill.address}</span>
            </div>
          )}
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
                      {(hasFlatDisc || hasPercentDisc) && (
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
                <Sparkles size={13} /> Store Discount Savings:
              </span>
              <span>- {formatCurrency(bill.discount_amount)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-stone-400">
              <span>Discount Savings:</span>
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
            <span className="text-stone-400">Payment Mode:</span>
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
            <span className="text-stone-400">Customer Feedback:</span>
            {feedback === 'good' ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                <ThumbsUp size={12} /> Positive
              </span>
            ) : feedback === 'bad' ? (
              <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                <ThumbsDown size={12} /> Constructive
              </span>
            ) : (
              <span className="text-stone-400">Recorded</span>
            )}
          </div>
        </div>

      </div>

      {/* 5. Start New Checkout Button */}
      <div className="pt-2 no-print">
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition-all active:scale-98 cursor-pointer"
        >
          <ShoppingBag size={18} />
          <span>Start New Checkout</span>
        </button>
      </div>

    </div>
  );
}
