import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { StaffProductGrid } from '../components/staff/StaffProductGrid';
import { StaffCartSummary } from '../components/staff/StaffCartSummary';
import { ReceiptModal } from '../components/common/ReceiptModal';
import { buildBillItems } from '../utils/cart';
import { Store, ShieldCheck } from 'lucide-react';

export function StaffPage() {
  const { inventory, settings, createBill, loading } = useStore();
  const [cart, setCart] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [printedBill, setPrintedBill] = useState(null);

  const handleUpdateQty = (product, delta) => {
    const current = cart[product.id] || 0;
    const updated = Math.max(0, current + delta);
    const maxStock = Number(product.stock_quantity) || 0;

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

  const handleClearCart = () => {
    setCart({});
  };

  const handleCompleteBill = async (billMeta) => {
    setSubmitting(true);
    try {
      const cartItemsList = Object.entries(cart).map(([id, qty]) => {
        const prod = inventory.find(p => p.id === id);
        return {
          id,
          product_id: id,
          quantity: qty,
          unit_price: prod?.unit_price || 0,
          discount_percent: prod?.discount_percent || 0
        };
      });

      const billData = {
        customer_name: billMeta.customer_name,
        phone: billMeta.phone,
        address: billMeta.address,
        items: buildBillItems(cartItemsList, inventory),
        num_items: billMeta.num_items,
        subtotal: billMeta.subtotal,
        discount_amount: billMeta.discount_amount || 0,
        total_amount: billMeta.total_amount,
        payment_method: billMeta.payment_method,
        cash_given: billMeta.cash_given,
        change_returned: billMeta.change_returned,
        feedback: 'none',
        feedback_source: 'staff'
      };

      const created = await createBill(billData);
      setPrintedBill(created);
      handleClearCart();
    } catch (err) {
      console.error('Staff checkout error:', err);
      alert('Failed to complete staff bill: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-500">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-100/70 p-4 sm:p-6 flex flex-col">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-stone-900 text-amber-400 rounded-xl shadow-xs">
            <Store size={18} />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-stone-900 text-lg sm:text-xl leading-tight">
              Staff Cashier Counter
            </h1>
            <p className="text-xs text-stone-500">
              High-speed retail counter interface • Manual discounts &amp; instant billing
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-stone-200 text-xs text-stone-600 shadow-xs">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Staff POS Active</span>
        </div>
      </div>

      {/* 2-Column Responsive Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        {/* Product Catalog Grid (Left 7 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 h-[calc(100vh-11rem)] min-h-[480px]">
          <StaffProductGrid
            inventory={inventory}
            cart={cart}
            onUpdateQty={handleUpdateQty}
          />
        </div>

        {/* Live Cart & Cashier Summary (Right 5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 h-[calc(100vh-11rem)] min-h-[480px]">
          <StaffCartSummary
            inventory={inventory}
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onClearCart={handleClearCart}
            onCompleteBill={handleCompleteBill}
            submitting={submitting}
          />
        </div>
      </div>

      {/* Receipt View & Print Modal */}
      <ReceiptModal
        isOpen={!!printedBill}
        onClose={() => setPrintedBill(null)}
        bill={printedBill}
        storeSettings={settings}
      />

    </div>
  );
}
