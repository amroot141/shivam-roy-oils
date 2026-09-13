import React, { useState } from 'react';
import { User, Phone, MapPin, ArrowRight } from 'lucide-react';

export function Step1Details({ customerInfo, setCustomerInfo, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!customerInfo.name || !customerInfo.name.trim()) {
      errs.name = 'Full name is required';
    }
    const cleanPhone = String(customerInfo.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Valid 10-digit mobile number is required';
    }
    if (!customerInfo.address || !customerInfo.address.trim()) {
      errs.address = 'Delivery / street address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-heading">
              Customer Information
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Please provide your details for digital invoicing and store loyalty rewards.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => {
                  setCustomerInfo({ ...customerInfo, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="e.g. Aarav Sharma"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                  errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                maxLength={10}
                value={customerInfo.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCustomerInfo({ ...customerInfo, phone: val });
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
                placeholder="10-digit mobile (e.g. 9876543210)"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all ${
                  errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.phone}</p>
            )}
            <p className="text-[11px] text-stone-400 mt-1">
              Used as your store ID for repeat rewards and discounts.
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Address / Locality <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 pointer-events-none text-stone-400">
                <MapPin size={18} />
              </div>
              <textarea
                rows={3}
                value={customerInfo.address}
                onChange={(e) => {
                  setCustomerInfo({ ...customerInfo, address: e.target.value });
                  if (errors.address) setErrors({ ...errors, address: null });
                }}
                placeholder="Street address, apartment, locality..."
                className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none ${
                  errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                }`}
              />
            </div>
            {errors.address && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.address}</p>
            )}
          </div>

          {/* Next Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold shadow-md shadow-amber-600/20 hover:shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              <span>Continue to Select Items</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
