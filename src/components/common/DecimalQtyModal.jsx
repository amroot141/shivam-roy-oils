import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Modal for entering an exact (possibly decimal) quantity for a product.
 * Uses a text input with inputMode="decimal" so users can fully clear and retype.
 */
export function DecimalQtyModal({ isOpen, onClose, product, currentQty = 1, onSaveQty }) {
  // Store as raw string — allows full clear + retype without type="number" restrictions
  const [rawInput, setRawInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRawInput(currentQty > 0 ? String(currentQty) : '');
    }
  }, [isOpen, currentQty]);

  if (!product) return null;

  // Parse only for calculations — never block typing
  const numQty = Math.max(0, parseFloat(rawInput) || 0);
  const maxStock = Number(product.stock_quantity) || 9999;
  const lineTotal = Math.round((Number(product.unit_price) || 0) * numQty * 100) / 100;

  const handleSave = (e) => {
    e.preventDefault();
    if (numQty > maxStock && !product.is_custom) {
      alert(`Only ${maxStock} ${product.unit} available in stock!`);
      return;
    }
    onSaveQty(product, numQty);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customize Quantity for ${product.product_name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500">Unit Price:</span>
            <span className="font-bold text-stone-900">{formatCurrency(product.unit_price)} / {product.unit}</span>
          </div>
          {!product.is_custom && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Available Stock:</span>
              <span className="font-bold text-emerald-700">{maxStock} {product.unit}</span>
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
            Enter Exact Quantity ({product.unit})
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={rawInput}
            onChange={(e) => {
              const v = e.target.value;
              // Allow: empty string, digits, one decimal point
              if (v === '' || /^\d*\.?\d*$/.test(v)) {
                setRawInput(v);
              }
            }}
            onFocus={(e) => e.target.select()}
            placeholder="e.g. 5.62"
            autoFocus
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-base font-extrabold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          />

          {/* Quick decimal presets */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto">
            <span className="text-[10px] text-stone-400 font-semibold">Presets:</span>
            {['0.5', '1.0', '2.5', '5.0', '5.62', '10.0'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setRawInput(val)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                  rawInput === val
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {val} {product.unit}
              </button>
            ))}
          </div>
        </div>

        {/* Live Line Total Calculation */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[11px] text-amber-900/80 block font-medium">Updated Line Total</span>
            <span className="text-stone-700 font-bold text-[11px]">
              {numQty} {product.unit} × {formatCurrency(product.unit_price)}
            </span>
          </div>
          <span className="text-lg font-black text-amber-900 font-heading">
            {formatCurrency(lineTotal)}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
          >
            <Check size={14} />
            <span>Update Quantity</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
