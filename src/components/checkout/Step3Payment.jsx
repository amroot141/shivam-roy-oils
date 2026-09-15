import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Banknote, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { buildUpiDeepLink } from '../../utils/cart';

export function Step3Payment({ 
  paymentInfo, 
  setPaymentInfo, 
  subtotal, 
  discount = 0,
  total,
  settings, 
  onNext, 
  onPrev 
}) {
  const [cashError, setCashError] = useState('');

  // Discounted total payable amount
  const currentTotal = total !== undefined ? total : Math.max(0, Math.round((subtotal - discount) * 100) / 100);

  // Construct UPI deep link URL (supports custom template override if set in settings)
  const upiVpa = settings?.upi_vpa || 'shivamroyoils@upi';
  const upiDeepLink = buildUpiDeepLink(settings, currentTotal);

  const handleCashGivenChange = (val) => {
    const num = parseFloat(val) || 0;
    setPaymentInfo({
      ...paymentInfo,
      cash_given: val,
      change_returned: Math.max(0, Math.round((num - currentTotal) * 100) / 100)
    });

    if (num < currentTotal) {
      setCashError(`Cash given must be at least ${formatCurrency(currentTotal)}`);
    } else {
      setCashError('');
    }
  };

  const handleSelectQuickCash = (amount) => {
    handleCashGivenChange(amount);
  };

  const handleProceed = () => {
    if (paymentInfo.payment_method === 'cash') {
      const num = parseFloat(paymentInfo.cash_given) || 0;
      if (num < currentTotal) {
        setCashError(`Cash given must be at least ${formatCurrency(currentTotal)}`);
        return;
      }
    }
    onNext();
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-stone-900 font-heading">
            Select Payment Method
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Choose your preferred checkout method.
          </p>
          
          <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-200 text-xs text-amber-900 font-semibold flex-wrap justify-center">
            <span>Subtotal: <strong>{formatCurrency(subtotal)}</strong></span>
            {discount > 0 && (
              <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold">
                Save -{formatCurrency(discount)}
              </span>
            )}
            <span>Payable: <strong className="text-sm font-extrabold text-amber-700">{formatCurrency(currentTotal)}</strong></span>
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setPaymentInfo({ ...paymentInfo, payment_method: 'upi' })}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              paymentInfo.payment_method === 'upi'
                ? 'bg-white text-stone-900 shadow-sm scale-100'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <QrCode size={18} className={paymentInfo.payment_method === 'upi' ? 'text-amber-600' : ''} />
            <span>UPI QR Scan</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentInfo({ ...paymentInfo, payment_method: 'cash' })}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              paymentInfo.payment_method === 'cash'
                ? 'bg-white text-stone-900 shadow-sm scale-100'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Banknote size={18} className={paymentInfo.payment_method === 'cash' ? 'text-emerald-600' : ''} />
            <span>Counter Cash</span>
          </button>
        </div>

        {/* Option 1: UPI View */}
        {paymentInfo.payment_method === 'upi' ? (
          <div className="flex flex-col items-center text-center p-5 bg-gradient-to-b from-amber-50/50 to-stone-50 rounded-2xl border border-amber-100">
            <div className="bg-white p-3 rounded-2xl shadow-md border border-stone-200 inline-block mb-3">
              {settings?.upi_qr_image_url ? (
                <img
                  src={settings.upi_qr_image_url}
                  alt="Merchant Store UPI QR Code"
                  className="w-48 h-48 object-contain rounded-xl"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-stone-100 rounded-xl text-xs text-stone-400">
                  QR Code Unavailable
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Merchant UPI VPA:</span>
              <p className="text-sm font-mono font-bold text-stone-800 bg-white px-3 py-1 rounded-xl border border-stone-200 inline-block">
                {upiVpa}
              </p>
            </div>

            {/* Pay via UPI App Deep Link */}
            <a
              href={upiDeepLink}
              className="flex items-center justify-center gap-2 w-full mt-4 py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-violet-600/20 active:scale-[0.98] transition-all"
            >
              <Smartphone size={18} />
              <span>Pay ₹{currentTotal.toFixed(2)} via UPI App</span>
              <ExternalLink size={14} />
            </a>
            <p className="text-[10px] text-stone-400 mt-1.5">
              Opens Google Pay, PhonePe, Paytm or your default UPI app
            </p>

            <div className="flex items-center gap-2 text-xs text-stone-500 mt-3 bg-white/80 px-3 py-2 rounded-xl border border-stone-200">
              <Smartphone size={16} className="text-amber-600" />
              <span>Compatible with Google Pay, PhonePe, Paytm, BHIM &amp; Banking apps</span>
            </div>
          </div>
        ) : (
          /* Option 2: Cash View */
          <div className="space-y-4 p-5 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Cash Tendered / Given (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold">₹</span>
                <input
                  type="number"
                  step="any"
                  min={currentTotal}
                  value={paymentInfo.cash_given}
                  onChange={(e) => handleCashGivenChange(e.target.value)}
                  placeholder={`Min ${currentTotal}`}
                  className="w-full pl-8 pr-4 py-3 rounded-2xl bg-white border border-stone-300 text-base font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              {cashError && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle size={13} /> {cashError}
                </p>
              )}
            </div>

            {/* Quick cash denomination chips */}
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                Quick Denominations:
              </span>
              <div className="flex flex-wrap gap-2">
                {[currentTotal, Math.ceil(currentTotal / 100) * 100, 500, 1000, 2000]
                  .filter((v, i, a) => v >= currentTotal && a.indexOf(v) === i)
                  .slice(0, 4)
                  .map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectQuickCash(val)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-200 text-xs font-semibold text-stone-700 border border-stone-300 shadow-xs cursor-pointer transition-colors"
                    >
                      {val === currentTotal ? 'Exact (₹' + val + ')' : '₹' + val}
                    </button>
                  ))}
              </div>
            </div>

            {/* Change calculation box */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 block font-medium">Change to be Returned:</span>
                <span className="text-xl font-extrabold text-emerald-900">
                  {formatCurrency(paymentInfo.change_returned || 0)}
                </span>
              </div>
              <Banknote size={32} className="text-emerald-600/60" />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold shadow-md shadow-amber-600/20 active:scale-98 cursor-pointer transition-all text-sm"
          >
            <span>Proceed to Feedback &amp; Download Bill</span>
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
