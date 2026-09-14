import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Printer, 
  User, 
  Phone, 
  MapPin, 
  Banknote, 
  QrCode, 
  AlertCircle,
  Receipt,
  Tag,
  X
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { cartSubtotal, cartNumItems, calculateManualDiscount, cartTotal } from '../../utils/cart';

export function StaffCartSummary({ 
  inventory = [], 
  cart = {}, 
  onUpdateQty, 
  onClearCart, 
  onCompleteBill,
  submitting = false 
}) {
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('Store Counter');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashGiven, setCashGiven] = useState('');
  const [discountType, setDiscountType] = useState('percent'); // 'percent' | 'fixed'
  const [discountValue, setDiscountValue] = useState('');

  // Items list
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const prod = inventory.find(p => p.id === id);
    return {
      id,
      product_name: prod?.product_name || 'Product',
      unit: prod?.unit || 'unit',
      unit_price: prod?.unit_price || 0,
      quantity: qty,
      line_total: (prod?.unit_price || 0) * qty
    };
  });

  const subtotal = cartSubtotal(cartItems);
  const numItems = cartNumItems(cartItems);

  // Staff counter manual discount calculation
  const discount = calculateManualDiscount(subtotal, discountType, discountValue);
  const total = cartTotal(subtotal, discount);

  const cashNum = parseFloat(cashGiven) || 0;
  const changeReturned = paymentMethod === 'cash' && cashNum >= total
    ? Math.max(0, Math.round((cashNum - total) * 100) / 100)
    : 0;

  const handleQuickCash = (amt) => {
    setCashGiven(String(amt));
  };

  const handleClearAll = () => {
    setDiscountValue('');
    onClearCart();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Please add at least one item to the cart!');
      return;
    }

    if (paymentMethod === 'cash') {
      if (cashNum < total) {
        alert(`Cash tendered (₹${cashNum}) is less than total amount (₹${total})!`);
        return;
      }
    }

    onCompleteBill({
      customer_name: customerName || 'Walk-in Customer',
      phone: customerPhone,
      address: customerAddress,
      payment_method: paymentMethod,
      cash_given: paymentMethod === 'cash' ? cashNum : null,
      change_returned: paymentMethod === 'cash' ? changeReturned : null,
      feedback: 'none',
      feedback_source: 'staff',
      discount_amount: discount,
      subtotal,
      total_amount: total,
      num_items: numItems
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-5 overflow-hidden">
      
      {/* Header with Clear Cart */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Receipt size={18} className="text-amber-600" />
          <h3 className="font-heading font-bold text-stone-900 text-sm sm:text-base">
            Counter Cart ({numItems} items)
          </h3>
        </div>
        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Items Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 divide-y divide-stone-100 min-h-[140px] max-h-[200px]">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <span className="text-xs">No items added to counter cart.</span>
            <span className="text-[11px] text-stone-300 mt-0.5">Click &quot;Add&quot; from the product catalog.</span>
          </div>
        ) : (
          cartItems.map((item) => {
            const original = inventory.find(p => p.id === item.id);
            const maxStock = original?.stock_quantity || 999;
            return (
              <div key={item.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-900 truncate">{item.product_name}</p>
                  <p className="text-stone-400 text-[11px]">
                    ₹{item.unit_price} × {item.quantity} {item.unit}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(original, -1)}
                      className="w-5 h-5 flex items-center justify-center text-stone-700 hover:bg-white rounded cursor-pointer"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-5 text-center font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.quantity >= maxStock}
                      onClick={() => onUpdateQty(original, 1)}
                      className={`w-5 h-5 flex items-center justify-center rounded cursor-pointer ${
                        item.quantity >= maxStock ? 'text-stone-300' : 'text-stone-700 hover:bg-white'
                      }`}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                  <span className="w-16 text-right font-bold text-stone-900">
                    {formatCurrency(item.line_total)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Staff Manual Discount Controls */}
      <div className="p-2.5 bg-amber-50/40 rounded-2xl border border-amber-200/80 my-1 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-stone-800 font-bold text-[11px]">
            <Tag size={12} className="text-amber-600" />
            <span>Staff Manual Discount</span>
          </div>
          <div className="flex items-center bg-stone-200/70 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setDiscountType('percent')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                discountType === 'percent'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              % Percent
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('fixed')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                discountType === 'fixed'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ₹ Fixed
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
              {discountType === 'percent' ? '%' : '₹'}
            </span>
            <input
              type="number"
              min="0"
              max={discountType === 'percent' ? 100 : subtotal}
              step="any"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percent' ? 'Discount % (e.g. 10)' : 'Discount in ₹ (e.g. 50)'}
              className="w-full pl-6 pr-2 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>
          {discountValue !== '' && Number(discountValue) > 0 && (
            <button
              type="button"
              onClick={() => setDiscountValue('')}
              className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Clear Discount"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Quick Discount Presets */}
        <div className="flex items-center gap-1 overflow-x-auto pt-0.5">
          <span className="text-[10px] text-stone-400 shrink-0 font-medium">Quick:</span>
          {(discountType === 'percent' ? [5, 10, 15, 20] : [20, 50, 100, 200]).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setDiscountValue(String(val))}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
                String(discountValue) === String(val)
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {discountType === 'percent' ? `${val}%` : `₹${val}`}
            </button>
          ))}
          {discountValue !== '' && (
            <button
              type="button"
              onClick={() => setDiscountValue('')}
              className="px-1.5 py-0.5 rounded-lg text-[10px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Customer Info Inputs */}
      <div className="space-y-2 py-2 border-t border-stone-100">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              placeholder="Walk-in Customer"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              placeholder="10-digit mobile"
            />
          </div>
        </div>
      </div>

      {/* Payment Selector & Cash Calculator */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              paymentMethod === 'cash'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Banknote size={14} /> Cash
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('upi')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              paymentMethod === 'upi'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <QrCode size={14} /> UPI
          </button>
        </div>

        {paymentMethod === 'cash' && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                placeholder="Cash Tendered (₹)"
                className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
                <span className="text-[10px] text-emerald-700 block leading-tight font-medium">Change:</span>
                <span className="text-xs font-black text-emerald-800">
                  {formatCurrency(changeReturned)}
                </span>
              </div>
            </div>

            {/* Quick cash pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {[total, 100, 200, 500, 2000]
                .filter((v, i, a) => v >= total && a.indexOf(v) === i)
                .slice(0, 4)
                .map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickCash(val)}
                    className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-[10px] font-semibold text-stone-700 rounded-lg cursor-pointer transition-colors shrink-0"
                  >
                    {val === total ? 'Exact' : '₹' + val}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Bill Totals & Submit Print Action */}
      <div className="pt-3 mt-2 border-t border-stone-200">
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Subtotal ({numItems} items):</span>
            <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
              <span className="flex items-center gap-1">
                <span>Manual Discount:</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                  {discountType === 'percent' ? `${discountValue}%` : 'FIXED'}
                </span>
              </span>
              <span>- {formatCurrency(discount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-stone-100">
            <span className="text-xs text-stone-700 font-bold">Total Amount Due:</span>
            <span className="text-xl font-extrabold text-stone-950 font-heading">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={cartItems.length === 0 || submitting}
          onClick={handleSubmit}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
            cartItems.length > 0 && !submitting
              ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer active:scale-98 shadow-amber-600/20'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
        >
          <Printer size={17} />
          <span>{submitting ? 'Generating...' : 'Complete & Print Bill'}</span>
        </button>
      </div>

    </div>
  );
}
