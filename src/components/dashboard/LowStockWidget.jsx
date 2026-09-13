import React, { useState } from 'react';
import { AlertTriangle, Plus, CheckCircle, Package } from 'lucide-react';
import { UnitBadge } from '../common/Badge';

export function LowStockWidget({ inventory = [], onAdjustStock }) {
  const [restockingId, setRestockingId] = useState(null);

  const lowStockItems = inventory.filter(item => (Number(item.stock_quantity) || 0) <= 10);

  const handleQuickRestock = async (product, amount) => {
    setRestockingId(product.id);
    try {
      await onAdjustStock(product.id, amount);
    } finally {
      setRestockingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-500" />
            <h3 className="font-heading font-bold text-stone-900 text-base sm:text-lg">
              Low Stock Alerts ({lowStockItems.length})
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-stone-400">
            Threshold: &le;10 units
          </span>
        </div>

        <div className="py-2 divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-stone-400 flex flex-col items-center justify-center">
              <CheckCircle size={32} className="text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-stone-700">All shelves well stocked!</p>
              <p className="text-[11px] text-stone-400 mt-0.5">No products require immediate restock.</p>
            </div>
          ) : (
            lowStockItems.map(item => {
              const isOut = Number(item.stock_quantity) <= 0;
              return (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <UnitBadge unit={item.unit} />
                      <span className={`font-black text-xs ${isOut ? 'text-rose-600' : 'text-amber-700'}`}>
                        {item.stock_quantity} left
                      </span>
                    </div>
                    <p className="font-bold text-stone-900 truncate">{item.product_name}</p>
                  </div>

                  {/* Restock Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={restockingId === item.id}
                      onClick={() => handleQuickRestock(item, 10)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      disabled={restockingId === item.id}
                      onClick={() => handleQuickRestock(item, 25)}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      +25
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
