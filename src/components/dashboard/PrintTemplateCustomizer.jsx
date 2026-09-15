import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Settings2, 
  Save, 
  CheckCircle2, 
  Eye, 
  Receipt, 
  Sparkles, 
  Store, 
  FileText,
  HelpCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { printThermalReceipt } from '../../utils/printer';

export function PrintTemplateCustomizer({ settings, onUpdateSettings }) {
  const [formData, setFormData] = useState({
    receipt_store_name: settings?.receipt_store_name || settings?.store_name || 'Shivam Roy Oils',
    receipt_tagline: settings?.receipt_tagline || settings?.tagline || 'Farm-Fresh Cold Pressed Oils & Spices',
    receipt_address: settings?.receipt_address || settings?.address || 'Shop 14, Kisan Mandi Complex, Ring Road',
    receipt_phone: settings?.receipt_phone || settings?.phone || '+91 98765 01234',
    receipt_gstin: settings?.receipt_gstin || '07AAAAA0000A1Z5',
    receipt_fssai_no: settings?.receipt_fssai_no || settings?.fssai_no || '10020051000123',
    receipt_msme_no: settings?.receipt_msme_no || settings?.msme_no || 'UDYAM-DL-00-1234567',
    receipt_logo_url: settings?.receipt_logo_url || settings?.store_logo_url || '',
    receipt_show_logo: settings?.receipt_show_logo !== false,
    receipt_header_note: settings?.receipt_header_note || 'Tax Invoice / Retail Bill',
    receipt_footer_note: settings?.receipt_footer_note || 'Thank you for supporting pure & organic produce! Visit again.',
    receipt_show_customer_info: settings?.receipt_show_customer_info !== false,
    receipt_show_discounts: settings?.receipt_show_discounts !== false,
    receipt_show_payment_mode: settings?.receipt_show_payment_mode !== false,
    receipt_paper_width: settings?.receipt_paper_width || '80mm'
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoUploadStatus, setLogoUploadStatus] = useState('');
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setLogoUploadStatus('error');
      setTimeout(() => setLogoUploadStatus(''), 3000);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoUploadStatus('error');
      setTimeout(() => setLogoUploadStatus(''), 3000);
      return;
    }

    setLogoUploadStatus('uploading');
    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('receipt_logo_url', event.target.result);
      setLogoUploadStatus('done');
      setTimeout(() => setLogoUploadStatus(''), 2500);
    };
    reader.onerror = () => {
      setLogoUploadStatus('error');
      setTimeout(() => setLogoUploadStatus(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save template error:', err);
      alert('Failed to save print template settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestPrint = () => {
    const sampleBill = {
      id: 'BILL-SAMPLE',
      created_at: new Date().toISOString(),
      customer_name: 'Rahul Sharma',
      phone: '9876543210',
      address: 'Plot 42, Civil Lines',
      num_items: 3,
      items: sampleItems,
      subtotal: sampleSubtotal,
      discount_amount: sampleDiscount,
      total_amount: sampleTotal,
      payment_method: 'cash',
      cash_given: 1000,
      change_returned: 266,
      feedback: 'good',
      feedback_source: 'staff'
    };
    printThermalReceipt({ bill: sampleBill, storeSettings: formData });
  };

  // Sample mock items for live preview
  const sampleItems = [
    { product_name: 'Cold Pressed Mustard Oil', quantity: 2, unit: '1L Bottle', unit_price: 180, line_total: 360, discount_type: 'percent', discount_percent: 10 },
    { product_name: 'Organic Sesame Oil', quantity: 1, unit: '500ml Bottle', unit_price: 240, line_total: 240, discount_type: 'flat', discount_flat: 20 },
    { product_name: 'Raw Cold Pressed Coconut Oil', quantity: 1, unit: '500g Jar', unit_price: 190, line_total: 190, discount_type: 'none' }
  ];
  const sampleSubtotal = 790;
  const sampleDiscount = 56;
  const sampleTotal = 734;

  const storeInitial = (formData.receipt_store_name || 'S').charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Printer size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-stone-900">
              Receipt &amp; Thermal Printing Customizer
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Customize header branding, store details, tax ID, footer notes, and paper size for POS receipt printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestPrint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            <Eye size={15} />
            <span>Test Print Sample</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Save Template'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSave} className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-stone-900 text-base flex items-center gap-2 pb-2 border-b border-stone-100">
              <Store size={17} className="text-amber-600" />
              <span>Header &amp; Business Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Receipt Store Name
                </label>
                <input
                  type="text"
                  value={formData.receipt_store_name}
                  onChange={(e) => handleChange('receipt_store_name', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. Shivam Roy Oils"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Tagline / Subheading
                </label>
                <input
                  type="text"
                  value={formData.receipt_tagline}
                  onChange={(e) => handleChange('receipt_tagline', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. Pure Cold Pressed Oils & Spices"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Store Address Line
                </label>
                <input
                  type="text"
                  value={formData.receipt_address}
                  onChange={(e) => handleChange('receipt_address', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. Shop 14, Kisan Mandi Complex, Ring Road"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Helpline / Phone
                </label>
                <input
                  type="text"
                  value={formData.receipt_phone}
                  onChange={(e) => handleChange('receipt_phone', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. +91 98765 01234"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  GSTIN / Tax ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.receipt_gstin}
                  onChange={(e) => handleChange('receipt_gstin', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. 07AAAAA0000A1Z5"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Food License Number (FSSAI)
                </label>
                <input
                  type="text"
                  value={formData.receipt_fssai_no}
                  onChange={(e) => handleChange('receipt_fssai_no', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. 10020051000123"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  MSME Registration Number
                </label>
                <input
                  type="text"
                  value={formData.receipt_msme_no}
                  onChange={(e) => handleChange('receipt_msme_no', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. UDYAM-DL-00-1234567"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="sm:col-span-2 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-amber-600" />
                    <span>Store Logo for Printed Receipts</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={formData.receipt_show_logo}
                      onChange={(e) => handleChange('receipt_show_logo', e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                    />
                    <span>Enable Logo on Receipt</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    value={formData.receipt_logo_url}
                    onChange={(e) => handleChange('receipt_logo_url', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-[11px] font-mono focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    placeholder="https://... or data:image/png..."
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="receipt-logo-file-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Upload size={13} />
                    <span>Upload Logo</span>
                  </button>
                </div>

                {logoUploadStatus === 'uploading' && (
                  <p className="text-[10px] text-amber-600 font-semibold animate-pulse">Uploading logo...</p>
                )}
                {logoUploadStatus === 'done' && (
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Logo image uploaded!
                  </p>
                )}
                {logoUploadStatus === 'error' && (
                  <p className="text-[10px] text-rose-500 font-semibold">Invalid image file (PNG/JPG/WebP &le; 2MB)</p>
                )}
              </div>
            </div>

            <h3 className="font-heading font-bold text-stone-900 text-base flex items-center gap-2 pt-3 pb-2 border-b border-stone-100">
              <FileText size={17} className="text-amber-600" />
              <span>Bill Header &amp; Footer Notes</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Top Header Badge Note
                </label>
                <input
                  type="text"
                  value={formData.receipt_header_note}
                  onChange={(e) => handleChange('receipt_header_note', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. Tax Invoice / Retail Cash Memo"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Bottom Footer Message
                </label>
                <textarea
                  rows={2}
                  value={formData.receipt_footer_note}
                  onChange={(e) => handleChange('receipt_footer_note', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. Thank you for supporting pure & organic produce! Visit again."
                />
              </div>
            </div>

            <h3 className="font-heading font-bold text-stone-900 text-base flex items-center gap-2 pt-3 pb-2 border-b border-stone-100">
              <Settings2 size={17} className="text-amber-600" />
              <span>Print Format &amp; Visibility Options</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Thermal Paper Width
                </label>
                <select
                  value={formData.receipt_paper_width}
                  onChange={(e) => handleChange('receipt_paper_width', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="80mm">80mm (Standard POS Thermal)</option>
                  <option value="58mm">58mm (Compact Mobile Thermal)</option>
                  <option value="standard">Standard Page (A4 / Letter)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.receipt_show_customer_info}
                    onChange={(e) => handleChange('receipt_show_customer_info', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <span>Show Customer Name &amp; Phone</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.receipt_show_discounts}
                    onChange={(e) => handleChange('receipt_show_discounts', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <span>Show Item Discount Breakdown</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.receipt_show_payment_mode}
                    onChange={(e) => handleChange('receipt_show_payment_mode', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <span>Show Payment Method &amp; Cash Change</span>
                </label>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Save & Update Print Template'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Thermal Receipt Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-stone-900 text-stone-200 px-4 py-2.5 rounded-t-3xl flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Eye size={14} className="text-amber-400" />
              <span>Live Thermal Print Preview ({formData.receipt_paper_width})</span>
            </span>
            <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded-full text-stone-400">
              Instant
            </span>
          </div>

          <div className="w-full bg-stone-100 p-4 rounded-b-3xl border border-stone-200 border-t-0 flex justify-center">
            {/* Printable Preview Card */}
            <div 
              id="printable-receipt" 
              className={`w-full bg-white border border-dashed border-stone-300 rounded-2xl p-4 sm:p-5 text-stone-800 text-xs font-mono shadow-sm ${
                formData.receipt_paper_width === '58mm' ? 'max-w-[280px]' : 'max-w-md'
              }`}
            >
              {/* Header */}
              <div className="text-center pb-3 border-b border-dashed border-stone-300">
                {formData.receipt_show_logo && formData.receipt_logo_url ? (
                  <img 
                    src={formData.receipt_logo_url} 
                    alt="Store Logo" 
                    className="max-h-12 max-w-[140px] object-contain mx-auto mb-1.5" 
                  />
                ) : (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-xl mb-1 font-sans font-bold text-sm">
                    {storeInitial}
                  </div>
                )}
                <h4 className="font-sans font-extrabold text-sm sm:text-base text-stone-900 leading-tight">
                  {formData.receipt_store_name || 'Store Name'}
                </h4>
                {formData.receipt_tagline && (
                  <p className="text-[10px] text-amber-700 font-sans font-semibold mt-0.5">
                    {formData.receipt_tagline}
                  </p>
                )}
                <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                  {formData.receipt_address || 'Store Address'}
                </p>
                <p className="text-[11px] text-stone-500 font-sans">
                  Tel: {formData.receipt_phone || '+91 00000 00000'}
                </p>
                {formData.receipt_gstin && (
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                    GSTIN: {formData.receipt_gstin}
                  </p>
                )}
                {formData.receipt_fssai_no && (
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                    FSSAI Lic. No: {formData.receipt_fssai_no}
                  </p>
                )}
                {formData.receipt_msme_no && (
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                    MSME Reg. No: {formData.receipt_msme_no}
                  </p>
                )}
                {formData.receipt_header_note && (
                  <div className="inline-block px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[9px] font-bold uppercase tracking-wider mt-1.5 font-sans">
                    {formData.receipt_header_note}
                  </div>
                )}
              </div>

              {/* Bill Metadata */}
              <div className="py-2.5 border-b border-dashed border-stone-300 text-[11px] space-y-0.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-stone-500">Bill No:</span>
                  <span className="font-bold text-stone-800 font-mono">BILL-DEMO-789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Date:</span>
                  <span>{formatDate(new Date().toISOString())}</span>
                </div>
                {formData.receipt_show_customer_info && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Customer:</span>
                      <span className="font-medium text-stone-900">Ramesh Sharma</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Phone:</span>
                      <span>+91 98111 22334</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Counter:</span>
                  <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                    Counter POS
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-2.5 border-b border-dashed border-stone-300">
                <table className="w-full text-[11px] font-sans">
                  <thead>
                    <tr className="text-stone-400 border-b border-stone-200 pb-1">
                      <th className="text-left font-medium pb-1">Item</th>
                      <th className="text-center font-medium pb-1">Qty</th>
                      <th className="text-right font-medium pb-1">Rate</th>
                      <th className="text-right font-medium pb-1">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {sampleItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1 font-medium text-stone-900 max-w-[110px] pr-1">
                          {item.product_name}
                          {formData.receipt_show_discounts && item.discount_type !== 'none' && (
                            <span className="block text-[9px] text-emerald-600 font-bold">
                              ({item.discount_type === 'flat' ? `₹${item.discount_flat} off` : `${item.discount_percent}% off`})
                            </span>
                          )}
                        </td>
                        <td className="text-center py-1 text-stone-600">
                          {item.quantity}
                        </td>
                        <td className="text-right py-1 text-stone-600">
                          ₹{item.unit_price}
                        </td>
                        <td className="text-right py-1 font-bold text-stone-800">
                          ₹{item.line_total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="py-2.5 border-b border-dashed border-stone-300 space-y-1 text-[11px] font-sans">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal (3 items):</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(sampleSubtotal)}</span>
                </div>

                {formData.receipt_show_discounts && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles size={11} /> Store Discount:
                    </span>
                    <span>- {formatCurrency(sampleDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-black text-stone-950 pt-1.5 border-t border-stone-200">
                  <span>Total Due:</span>
                  <span className="text-amber-700 font-extrabold">{formatCurrency(sampleTotal)}</span>
                </div>
              </div>

              {/* Payment details */}
              {formData.receipt_show_payment_mode && (
                <div className="pt-2 text-[11px] font-sans space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment Mode:</span>
                    <span className="font-bold uppercase text-stone-800">Cash</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Cash Tendered:</span>
                    <span>₹1,000.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Change Returned:</span>
                    <span>₹266.00</span>
                  </div>
                </div>
              )}

              {/* Footer Note */}
              {formData.receipt_footer_note && (
                <div className="mt-3 pt-2 text-center border-t border-dashed border-stone-300 text-[10px] text-stone-500 font-sans">
                  <p>{formData.receipt_footer_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
