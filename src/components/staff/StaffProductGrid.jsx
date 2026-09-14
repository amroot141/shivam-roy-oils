import React, { useState } from 'react';
import { Search, Plus, Minus, AlertTriangle, CheckCircle, Package, Edit3 } from 'lucide-react';
import { UnitBadge, StockBadge } from '../common/Badge';
import { DecimalQtyModal } from '../common/DecimalQtyModal';
import { formatCurrency } from '../../utils/formatters';

export function StaffProductGrid({ inventory = [], cart = {}, onUpdateQty, onSetExactQty }) {
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [editingQtyProduct, setEditingQtyProduct] = useState(null);

  const filtered = inventory.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(search.toLowerCase());
    const matchesUnit = selectedUnit === 'all' || item.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  const units = ['all', 'bottle', 'kg', 'liter', 'piece'];

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-5 overflow-hidden">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-4 border-b border-stone-100">
        <div className="relative w-full sm:w-72">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Quick search products..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {units.map(u => (
            <button
              key={u}
              type="button"
              onClick={() => setSelectedUnit(u)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedUnit === u
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto py-3 pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(product => {
          const qty = cart[product.id] || 0;
          const isOut = !product.is_custom && (Number(product.stock_quantity) || 0) <= 0;
          const maxStock = Number(product.stock_quantity) || 9999;

          return (
            <div
              key={product.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                qty > 0
                  ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <UnitBadge unit={product.unit} />
                  {product.is_custom ? (
                    <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200">
                      Custom
                    </span>
                  ) : (
                    <span className={`text-[11px] font-semibold ${maxStock <= 10 ? 'text-amber-700' : 'text-stone-500'}`}>
                      Stock: {maxStock}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                  {product.product_name}
                </h4>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                <span className="text-sm font-extrabold text-stone-950">
                  {formatCurrency(product.unit_price)}
                </span>

                {isOut ? (
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">
                    Out
                  </span>
                ) : qty === 0 ? (
                  <button
                    type="button"
                    onClick={() => onUpdateQty(product, 1)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-stone-200 shadow-xs">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(product, -1)}
                      className="w-7 h-7 rounded-lg hover:bg-stone-100 text-stone-700 flex items-center justify-center font-bold transition-colors cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setEditingQtyProduct(product)}
                      className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100 border border-stone-300 font-extrabold text-xs text-stone-900 flex items-center gap-0.5 cursor-pointer"
                      title="Set exact decimal quantity e.g. 5.62"
                    >
                      <span>{qty}</span>
                      <Edit3 size={10} className="text-amber-600" />
                    </button>

                    <button
                      type="button"
                      disabled={!product.is_custom && qty >= maxStock}
                      onClick={() => onUpdateQty(product, 1)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-colors ${
                        !product.is_custom && qty >= maxStock
                          ? 'text-stone-300 cursor-not-allowed'
                          : 'hover:bg-amber-500 hover:text-white text-stone-900 cursor-pointer'
                      }`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DecimalQtyModal
        isOpen={!!editingQtyProduct}
        onClose={() => setEditingQtyProduct(null)}
        product={editingQtyProduct}
        currentQty={editingQtyProduct ? (cart[editingQtyProduct.id] || 1) : 1}
        onSaveQty={(prod, exactVal) => {
          if (typeof onSetExactQty === 'function') {
            onSetExactQty(prod, exactVal);
          }
        }}
      />

    </div>
  );
}
