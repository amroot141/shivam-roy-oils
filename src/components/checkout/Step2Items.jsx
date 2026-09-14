import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Search, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft,
  PackageCheck,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { UnitBadge } from '../common/Badge';
import { DecimalQtyModal } from '../common/DecimalQtyModal';
import { formatCurrency } from '../../utils/formatters';
import { cartSubtotal, cartNumItems, cartDiscount, cartTotal } from '../../utils/cart';

export function Step2Items({ 
  inventory = [], 
  cart = {}, 
  setCart, 
  isDiscountEnabled = true, 
  onNext, 
  onPrev 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [editingQtyProduct, setEditingQtyProduct] = useState(null);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnit = selectedUnit === 'all' || item.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  const getItemQty = (id) => cart[id] || 0;

  const handleUpdateQty = (product, delta) => {
    const current = getItemQty(product.id);
    const updated = Math.max(0, Math.round((current + delta) * 100) / 100);
    const maxStock = Number(product.stock_quantity) || 9999;

    if (updated > maxStock) {
      alert(`Only ${maxStock} ${product.unit} available in stock!`);
      return;
    }

    if (updated === 0) {
      const nextCart = { ...cart };
      delete nextCart[product.id];
      setCart(nextCart);
    } else {
      setCart({
        ...cart,
        [product.id]: updated
      });
    }
  };

  const handleSetExactQty = (product, exactQty) => {
    const safeQty = Math.max(0, Math.round((Number(exactQty) || 0) * 100) / 100);
    if (safeQty === 0) {
      const nextCart = { ...cart };
      delete nextCart[product.id];
      setCart(nextCart);
    } else {
      setCart({
        ...cart,
        [product.id]: safeQty
      });
    }
  };

  // Compute live cart subtotal, discount, and exact payable amount
  const cartItemsList = Object.entries(cart).map(([id, qty]) => {
    const prod = inventory.find(p => p.id === id);
    return {
      id,
      quantity: qty,
      unit_price: prod?.unit_price || 0,
      discount_type: prod?.discount_type || 'percent',
      discount_percent: prod?.discount_percent || 0,
      discount_flat: prod?.discount_flat || 0
    };
  });

  const subtotal = cartSubtotal(cartItemsList);
  const totalCount = cartNumItems(cartItemsList);
  const totalDiscount = cartDiscount(cartItemsList, 'good', isDiscountEnabled);
  const payableTotal = cartTotal(subtotal, totalDiscount);

  const unitsList = ['all', 'bottle', 'kg', 'liter', 'piece'];

  return (
    <div className="max-w-4xl mx-auto py-6 pb-28">
      
      {/* Search & Unit Filters Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pure oils, seeds, spices..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Unit Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {unitsList.map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setSelectedUnit(u)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedUnit === u
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredInventory.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300">
          <AlertCircle size={40} className="mx-auto text-stone-300 mb-2" />
          <h4 className="text-stone-700 font-bold">No products match your filter</h4>
          <p className="text-xs text-stone-400 mt-1">Try searching with a different keyword or unit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInventory.map(product => {
            const qty = getItemQty(product.id);
            const isOutOfStock = (Number(product.stock_quantity) || 0) <= 0;
            const unitPrice = Number(product.unit_price) || 0;
            const discountType = product.discount_type || 'percent';
            const hasFlatDisc = discountType === 'flat' && Number(product.discount_flat) > 0;
            const hasPercentDisc = discountType !== 'flat' && Number(product.discount_percent) > 0;
            const hasDiscount = (hasFlatDisc || hasPercentDisc) && isDiscountEnabled;
            const discAmt = hasFlatDisc 
              ? Math.min(Number(product.discount_flat) || 0, unitPrice)
              : hasPercentDisc
              ? (unitPrice * (Number(product.discount_percent) || 0) / 100)
              : 0;
            const effectiveUnitPrice = Math.max(0, Math.round((unitPrice - discAmt) * 100) / 100);

            return (
              <div 
                key={product.id}
                className={`bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  qty > 0 
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md' 
                    : 'border-stone-200 shadow-xs hover:border-stone-300'
                }`}
              >
                <div>
                  {/* Top Badges — stock count hidden from customers */}
                  <div className="flex items-center gap-2 mb-2">
                    <UnitBadge unit={product.unit} />
                    {hasDiscount && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Sparkles size={10} className="text-emerald-600" />
                        {hasFlatDisc ? `₹${product.discount_flat} OFF` : `${product.discount_percent}% OFF`}
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <h3 className="font-heading font-bold text-stone-900 text-base leading-snug">
                    {product.product_name}
                  </h3>

                  {/* Discount Promo Tag */}
                  {hasDiscount && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mt-2">
                      <Sparkles size={12} className="text-emerald-600" />
                      <span>Instant discount applied on this item!</span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Price & Quantity Stepper */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Unit Price</span>
                    {hasDiscount ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-stone-400 line-through">
                            {formatCurrency(unitPrice)}
                          </span>
                        </div>
                        <span className="text-lg font-black text-emerald-700 font-heading">
                          {formatCurrency(effectiveUnitPrice)}
                          <span className="text-xs font-normal text-stone-500 font-sans"> / {product.unit}</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-extrabold text-stone-900">
                        {formatCurrency(unitPrice)}
                        <span className="text-xs font-normal text-stone-500"> / {product.unit}</span>
                      </span>
                    )}
                  </div>

                  {/* Counter Steppers with Decimal Edit */}
                  {isOutOfStock ? (
                    <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                      Unavailable
                    </span>
                  ) : qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(product, 1)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-2xl font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(product, -1)}
                        className="w-7 h-7 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 text-stone-700 flex items-center justify-center font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Minus size={13} />
                      </button>
                      
                      {/* Clickable quantity badge opens decimal popup */}
                      <button
                        type="button"
                        onClick={() => setEditingQtyProduct(product)}
                        className="px-2 py-0.5 rounded-lg bg-white hover:bg-amber-50 border border-amber-200 text-stone-900 font-extrabold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Click to type exact decimal quantity e.g. 5.62"
                      >
                        <span>{qty}</span>
                        <Edit3 size={11} className="text-amber-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateQty(product, 1)}
                        disabled={qty >= product.stock_quantity}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold shadow-xs transition-colors ${
                          qty >= product.stock_quantity
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
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
      )}

      {/* Sticky Bottom Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-xl py-3 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={onPrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                  {totalCount} item{totalCount !== 1 ? 's' : ''}
                </span>
                {totalDiscount > 0 && (
                  <span className="text-xs text-stone-400 line-through">
                    {formatCurrency(subtotal)}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-stone-500 font-medium">To Pay:</span>
                  <span className="text-xl font-black text-amber-700">
                    {formatCurrency(payableTotal)}
                  </span>
                </div>
              </div>
              {totalDiscount > 0 && (
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles size={11} /> You save {formatCurrency(totalDiscount)} with store discount!
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={totalCount === 0}
            onClick={onNext}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm shadow-md transition-all ${
              totalCount > 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer active:scale-98 shadow-amber-600/20'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Proceed to Payment ({formatCurrency(payableTotal)})</span>
            <ArrowRight size={18} />
          </button>

        </div>
      </div>

      {/* Decimal Quantity Customization Modal */}
      <DecimalQtyModal
        isOpen={!!editingQtyProduct}
        onClose={() => setEditingQtyProduct(null)}
        product={editingQtyProduct}
        currentQty={editingQtyProduct ? getItemQty(editingQtyProduct.id) : 1}
        onSaveQty={handleSetExactQty}
      />

    </div>
  );
}
