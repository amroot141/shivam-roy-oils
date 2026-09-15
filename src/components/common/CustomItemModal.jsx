import React, { useState } from 'react';
import { Modal } from './Modal';
import { Sparkles, Calculator, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function CustomItemModal({ isOpen, onClose, onAddCustomItem }) {
  const [name, setName] = useState('Pure Cold Pressed Oil (Loose)');
  const [unit, setUnit] = useState('liter');
  const [unitPrice, setUnitPrice] = useState('210');
  const [quantity, setQuantity] = useState('5.62');
  const [error, setError] = useState('');

  const numPrice = Math.max(0, parseFloat(unitPrice) || 0);
  const numQty = Math.max(0, parseFloat(quantity) || 0);
  const lineTotal = Math.round(numPrice * numQty * 100) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    if (numPrice <= 0) {
      setError('Unit price must be greater than 0');
      return;
    }
    if (numQty <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    const customProduct = {
      id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      product_name: name.trim(),
      unit: unit,
      stock_quantity: 9999,
      unit_price: numPrice,
      discount_type: 'percent',
      discount_percent: 0,
      discount_flat: 0,
      is_custom: true
    };

    onAddCustomItem(customProduct, numQty);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom / Loose Item (e.g. 5.62L)"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
            Custom Item Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Loose Sarson Oil (Customer Bottle)"
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
              Unit Type
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 uppercase"
            >
              <option value="liter">Liter (L)</option>
              <option value="kg">Kg (Kilogram)</option>
              <option value="bottle">Bottle</option>
              <option value="piece">Piece</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
              Unit Price (₹ / {unit}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="e.g. 210"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
            Exact Quantity ({unit}) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            min="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 5.62"
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-extrabold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          />
          
          {/* Quick decimal presets */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto">
            <span className="text-[10px] text-stone-400 font-semibold">Presets:</span>
            {['0.5', '1.0', '2.5', '5.0', '5.62', '10.0'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setQuantity(val)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                  quantity === val
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {val} {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Live Math Summary Card */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[11px] text-amber-900/80 block font-medium">Calculated Item Total</span>
            <span className="text-stone-700 font-bold text-[11px]">
              {numQty} {unit} × {formatCurrency(numPrice)}
            </span>
          </div>
          <span className="text-lg font-black text-amber-900 font-heading">
            {formatCurrency(lineTotal)}
          </span>
        </div>

        {error && <p className="text-rose-500 text-xs font-semibold">{error}</p>}

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
            className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/20 active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Custom Item</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
