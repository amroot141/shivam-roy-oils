import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  ShoppingBag,
  Gift,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../../utils/formatters';
import { cartSubtotal, cartDiscount, cartTotal } from '../../utils/cart';

export function Step4Feedback({ 
  feedback, 
  setFeedback, 
  cartItemsList = [], 
  paymentInfo, 
  onSubmitBill, 
  onPrev,
  submitting = false
}) {
  const [unlocked, setUnlocked] = useState(feedback === 'good' || feedback === 'bad');

  const subtotal = cartSubtotal(cartItemsList);
  const discount = cartDiscount(cartItemsList, feedback);
  const total = cartTotal(subtotal, discount);

  // Recalculate change returned based on the post-discount total
  const adjustedChange = paymentInfo.payment_method === 'cash' && paymentInfo.cash_given
    ? Math.max(0, Math.round((Number(paymentInfo.cash_given) - total) * 100) / 100)
    : 0;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d97706', '#fbbf24', '#10b981', '#f59e0b']
      });
    } catch {
      // safe fallback
    }
  };

  const handleSelectFeedback = (sentiment) => {
    setFeedback(sentiment);
    if (sentiment === 'good' || sentiment === 'bad') {
      setUnlocked(true);
      triggerConfetti();
    } else {
      setUnlocked(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl mb-3 shadow-inner">
            <Gift size={24} className="animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 font-heading">
            Feedback &amp; Instant Savings
          </h2>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Rate your store shopping experience today to unlock instant product-level discounts on your bill!
          </p>
        </div>

        {/* Feedback Selection Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Good Feedback */}
          <button
            type="button"
            onClick={() => handleSelectFeedback('good')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
              feedback === 'good'
                ? 'border-emerald-500 bg-emerald-50/70 ring-4 ring-emerald-500/20 shadow-md scale-102'
                : 'border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              feedback === 'good' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-stone-100 text-stone-600'
            }`}>
              <ThumbsUp size={24} />
            </div>
            <span className="font-bold text-sm text-stone-900">Good Shopping</span>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
              Unlocks Full Discount
            </span>
          </button>

          {/* Bad Feedback */}
          <button
            type="button"
            onClick={() => handleSelectFeedback('bad')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
              feedback === 'bad'
                ? 'border-amber-500 bg-amber-50/70 ring-4 ring-amber-500/20 shadow-md scale-102'
                : 'border-stone-200 hover:border-amber-300 hover:bg-amber-50/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              feedback === 'bad' ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 text-stone-600'
            }`}>
              <ThumbsDown size={24} />
            </div>
            <span className="font-bold text-sm text-stone-900">Needs Work</span>
            <span className="text-[11px] text-amber-800 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-full">
              Unlocks Full Discount
            </span>
          </button>
        </div>



        {/* Dynamic Discount Unlock Banner */}
        {unlocked && discount > 0 ? (
          <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md mb-6 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles size={22} className="text-yellow-200" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-100 block">
                  Reward Unlocked!
                </span>
                <p className="font-extrabold text-base">
                  You saved {formatCurrency(discount)} on this visit!
                </p>
              </div>
            </div>
            <span className="text-2xl font-black text-yellow-300">
              - {formatCurrency(discount)}
            </span>
          </div>
        ) : (
          <div className="p-3 bg-stone-100 text-stone-600 text-xs rounded-2xl mb-6 flex items-center gap-2">
            <HelpCircle size={16} className="text-stone-400 shrink-0" />
            <span>Select &quot;Good Shopping&quot; or &quot;Needs Work&quot; to unlock product discounts!</span>
          </div>
        )}

        {/* Itemized Total Summary */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-2 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal ({cartItemsList.length} items):</span>
            <span className="font-semibold text-stone-900">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-stone-600">
            <span className="flex items-center gap-1.5">
              <span>Feedback Discount:</span>
              {unlocked ? (
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                  APPLIED
                </span>
              ) : (
                <span className="text-[11px] bg-stone-200 text-stone-600 px-1.5 py-0.2 rounded">
                  LOCKED
                </span>
              )}
            </span>
            <span className={unlocked && discount > 0 ? 'text-emerald-600 font-bold text-base' : 'text-stone-400'}>
              {unlocked && discount > 0 ? `- ${formatCurrency(discount)}` : '₹0'}
            </span>
          </div>

          <div className="flex justify-between text-stone-600 text-xs pt-1">
            <span>Payment Mode:</span>
            <span className="uppercase font-semibold text-stone-800">{paymentInfo.payment_method}</span>
          </div>

          {paymentInfo.payment_method === 'cash' && (
            <div className="flex justify-between text-xs text-stone-600">
              <span>Adjusted Change Returned:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(adjustedChange)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-stone-200 flex justify-between items-center">
            <span className="text-base font-extrabold text-stone-950 font-heading">
              Final Payable Amount:
            </span>
            <span className="text-2xl font-black text-amber-700">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onPrev}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onSubmitBill}
            disabled={submitting || (feedback !== 'good' && feedback !== 'bad')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-extrabold text-base shadow-lg transition-all ${
              submitting || (feedback !== 'good' && feedback !== 'bad')
                ? 'bg-stone-400 cursor-not-allowed shadow-none opacity-80'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-600/30 active:scale-98 cursor-pointer'
            }`}
          >
            <CheckCircle2 size={20} />
            <span>{submitting ? 'Generating Bill...' : 'Complete & Generate Receipt'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
