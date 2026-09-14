import React, { useState, useEffect, useRef } from 'react';
import { Settings, QrCode, Save, CheckCircle2, Image as ImageIcon, Tag, Upload, Smartphone, Copy, ExternalLink, Check, Link } from 'lucide-react';
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
  const [uploadStatus, setUploadStatus] = useState(''); // '', 'uploading', 'done', 'error'
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Build the UPI deep link from current form values
  const upiDeepLink = upiVpa.trim()
    ? `upi://pay?pa=${encodeURIComponent(upiVpa.trim())}&pn=${encodeURIComponent(storeName.trim() || 'Store')}&cu=INR&tn=${encodeURIComponent(`Payment to ${storeName.trim() || 'Store'}`)}`
    : '';

  const handleCopyLink = () => {
    if (!upiDeepLink) return;
    navigator.clipboard.writeText(upiDeepLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    setUploadStatus('uploading');
    const reader = new FileReader();
    reader.onload = (event) => {
      setUpiQrUrl(event.target.result);
      setUploadStatus('done');
      setTimeout(() => setUploadStatus(''), 2500);
    };
    reader.onerror = () => {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus(''), 3000);
    };
    reader.readAsDataURL(file);

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
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
              placeholder="e.g. storename@upi or 9876501234@paytm"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* UPI Deep Link Preview & Test */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1">
                <Link size={11} />
                UPI App Deep Link (Auto-Generated)
              </label>
              {upiDeepLink && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">Active</span>
              )}
            </div>

            {upiDeepLink ? (
              <>
                {/* Copyable link field */}
                <div className="flex items-center gap-1.5">
                  <input
                    readOnly
                    value={upiDeepLink}
                    className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-[10px] font-mono text-stone-600 truncate focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Test / Open link button */}
                <a
                  href={upiDeepLink}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-violet-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Smartphone size={14} />
                  <span>Test: Open UPI App (Google Pay / PhonePe / Paytm)</span>
                  <ExternalLink size={11} />
                </a>
                <p className="text-[10px] text-stone-400 text-center">
                  This link is shown to customers on the self-checkout payment screen. Save settings to apply changes.
                </p>
              </>
            ) : (
              <div className="text-[11px] text-stone-400 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                Enter a UPI VPA above to generate the merchant deep link.
              </div>
            )}
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

            {/* Upload QR Image Button */}
            <div className="flex items-center gap-2 mt-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                id="qr-file-upload"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-800 transition-colors cursor-pointer"
              >
                <Upload size={13} />
                <span>Upload QR Image</span>
              </button>
              <span className="text-[10px] text-stone-400">PNG, JPG, WebP · Max 2 MB</span>
              {uploadStatus === 'uploading' && (
                <span className="text-[10px] text-amber-600 font-semibold animate-pulse">Uploading...</span>
              )}
              {uploadStatus === 'done' && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 size={11} /> Uploaded!
                </span>
              )}
              {uploadStatus === 'error' && (
                <span className="text-[10px] text-rose-500 font-semibold">Invalid file (check type/size)</span>
              )}
            </div>
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
