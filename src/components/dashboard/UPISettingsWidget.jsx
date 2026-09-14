import React, { useState, useEffect } from 'react';
import { Settings, QrCode, Save, CheckCircle2, Image as ImageIcon, Tag } from 'lucide-react';
import { DEFAULT_UPI_QR } from '../../services/db';

export function UPISettingsWidget({ settings, onUpdateSettings }) {
  const [upiVpa, setUpiVpa] = useState(settings?.upi_vpa || 'shivamroyoils@upi');
  const [upiQrUrl, setUpiQrUrl] = useState(settings?.upi_qr_image_url || '');
  const [storeName, setStoreName] = useState(settings?.store_name || '');
  const [selfCheckoutDiscountEnabled, setSelfCheckoutDiscountEnabled] = useState(
    settings?.self_checkout_discount_enabled !== false
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      if (settings.upi_vpa !== undefined) setUpiVpa(settings.upi_vpa);
      if (settings.upi_qr_image_url !== undefined) setUpiQrUrl(settings.upi_qr_image_url);
      if (settings.store_name !== undefined) setStoreName(settings.store_name);
      if (settings.self_checkout_discount_enabled !== undefined) {
        setSelfCheckoutDiscountEnabled(settings.self_checkout_discount_enabled !== false);
      }
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateSettings({
        upi_vpa: upiVpa.trim(),
        upi_qr_image_url: upiQrUrl.trim() || DEFAULT_UPI_QR,
        store_name: storeName.trim(),
        self_checkout_discount_enabled: selfCheckoutDiscountEnabled
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaultQR = () => {
    setUpiQrUrl(DEFAULT_UPI_QR);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-amber-600" />
            <h3 className="font-heading font-bold text-stone-900 text-base sm:text-lg">
              UPI &amp; Merchant Settings
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            Payment Config
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-3 py-3 text-xs">
          {/* Store Name */}
          <div>
            <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
              Store Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Merchant UPI ID */}
          <div>
            <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
              Merchant UPI VPA Address
            </label>
            <input
              type="text"
              value={upiVpa}
              onChange={(e) => setUpiVpa(e.target.value)}
              placeholder="e.g. storename@upi"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* UPI Static QR Code Image Link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-stone-500">
                Static Merchant QR Image Link
              </label>
              <button
                type="button"
                onClick={handleResetDefaultQR}
                className="text-[10px] text-amber-700 font-bold hover:underline cursor-pointer"
              >
                Use Built-in SVG
              </button>
            </div>
            <textarea
              rows={2}
              value={upiQrUrl}
              onChange={(e) => setUpiQrUrl(e.target.value)}
              placeholder="https://... or data:image/svg+xml;..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-[11px] font-mono resize-none focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* QR Preview Thumbnail */}
          <div className="flex items-center gap-3 p-2.5 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="w-12 h-12 bg-white rounded-xl border border-stone-200 p-1 flex items-center justify-center shrink-0">
              {upiQrUrl ? (
                <img src={upiQrUrl} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon size={18} className="text-stone-300" />
              )}
            </div>
            <div>
              <span className="font-bold text-stone-800 block text-[11px]">QR Preview</span>
              <span className="text-[10px] text-stone-400">Displayed to customers during UPI checkout</span>
            </div>
          </div>

          {/* Self-Checkout Discount Global Toggle */}
          <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-3">
            <div className="pr-1 flex-1">
              <div className="flex items-center gap-1.5">
                <Tag size={13} className="text-amber-600 shrink-0" />
                <span className="font-bold text-stone-900 text-xs">Self-Checkout Discount</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  selfCheckoutDiscountEnabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-600'
                }`}>
                  {selfCheckoutDiscountEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-[10.5px] text-stone-500 mt-0.5 leading-snug">
                {selfCheckoutDiscountEnabled
                  ? 'Kiosk automatically calculates & unlocks feedback discounts for customers.'
                  : 'Disabled: Customer self-checkout charges standard retail price without discounts.'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={selfCheckoutDiscountEnabled}
              onClick={() => setSelfCheckoutDiscountEnabled(!selfCheckoutDiscountEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                selfCheckoutDiscountEnabled ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  selfCheckoutDiscountEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all active:scale-98 cursor-pointer mt-2"
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save UPI Settings'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
