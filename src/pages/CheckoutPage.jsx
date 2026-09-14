import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { StepProgressBar } from '../components/checkout/StepProgressBar';
import { Step1Details } from '../components/checkout/Step1Details';
import { Step2Items } from '../components/checkout/Step2Items';
import { Step3Payment } from '../components/checkout/Step3Payment';
import { Step4Feedback } from '../components/checkout/Step4Feedback';
import { cartSubtotal, cartDiscount, cartTotal, buildBillItems } from '../utils/cart';

export function CheckoutPage() {
  const { inventory, settings, createBill, updateBillFeedback, loading } = useStore();
  const isDiscountEnabled = settings?.self_checkout_discount_enabled !== false;

  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [completedBill, setCompletedBill] = useState(null);

  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Cart: { [productId]: quantity }
  const [cart, setCart] = useState({});
  // Custom loose products added during self-checkout
  const [customProducts, setCustomProducts] = useState([]);

  // Payment State
  const [paymentInfo, setPaymentInfo] = useState({
    payment_method: 'upi',
    cash_given: '',
    change_returned: 0
  });

  // Feedback State: 'good' | 'bad' | 'none'
  const [feedback, setFeedback] = useState('good'); // Default positive prompt

  const allInventory = [...inventory, ...customProducts];

  // Convert cart to items list
  const cartItemsList = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const prod = allInventory.find(p => p.id === id);
      return {
        id,
        product_id: id,
        product_name: prod?.product_name || 'Product',
        unit: prod?.unit || 'bottle',
        unit_price: prod?.unit_price || 0,
        discount_percent: prod?.discount_percent || 0,
        discount_flat: prod?.discount_flat || 0,
        discount_type: prod?.discount_type || 'percent',
        quantity: qty,
        line_total: Math.round((prod?.unit_price || 0) * qty * 100) / 100
      };
    });

  const subtotal = cartSubtotal(cartItemsList);
  const discount = cartDiscount(cartItemsList, 'good', isDiscountEnabled);
  const total = cartTotal(subtotal, discount);

  const goToStep = (step) => {
    setCurrentStep(step);
    if (step > maxStepReached) {
      setMaxStepReached(step);
    }
  };

  const handleNext = () => {
    goToStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const handleSubmitBill = async () => {
    setSubmitting(true);
    try {
      const billDiscount = cartDiscount(cartItemsList, 'good', isDiscountEnabled);
      const finalTotal = cartTotal(subtotal, billDiscount);

      const billData = {
        customer_name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        items: buildBillItems(cartItemsList, allInventory),
        num_items: cartItemsList.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0),
        subtotal,
        discount_amount: billDiscount,
        total_amount: finalTotal,
        payment_method: paymentInfo.payment_method,
        cash_given: paymentInfo.payment_method === 'cash' ? (Number(paymentInfo.cash_given) || null) : null,
        change_returned: paymentInfo.payment_method === 'cash' 
          ? Math.max(0, Math.round(((Number(paymentInfo.cash_given) || 0) - finalTotal) * 100) / 100)
          : null,
        feedback,
        feedback_source: 'self'
      };

      const created = await createBill(billData);
      setCompletedBill(created);
      return created;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to complete checkout: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedToStep4 = async () => {
    goToStep(4);
    if (!completedBill && !submitting) {
      await handleSubmitBill();
    }
  };

  const handleSelectFeedback = async (sentiment) => {
    setFeedback(sentiment);
    if (completedBill) {
      setCompletedBill(prev => ({ ...prev, feedback: sentiment }));
      if (updateBillFeedback) {
        await updateBillFeedback(completedBill.id, sentiment);
      }
    }
  };

  const handleResetCheckout = () => {
    setCompletedBill(null);
    setCurrentStep(1);
    setMaxStepReached(1);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setCart({});
    setPaymentInfo({ payment_method: 'upi', cash_given: '', change_returned: 0 });
    setFeedback('good');
  };

  // Auto-submit bill when reaching step 4 if not yet generated
  useEffect(() => {
    if (currentStep === 4 && !completedBill && !submitting && cartItemsList.length > 0) {
      handleSubmitBill();
    }
  }, [currentStep, completedBill, submitting, cartItemsList.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-500">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-semibold text-sm">Loading Shivam Roy Oils Store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50/60 pb-16">
      
      {/* 4-Step Sticky Progress Bar */}
      <StepProgressBar
        currentStep={currentStep}
        onStepClick={goToStep}
        maxStepReached={maxStepReached}
      />

      {/* Step Views */}
      <div className="px-4 sm:px-6">
        {currentStep === 1 && (
          <Step1Details
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <Step2Items
            inventory={inventory}
            customProducts={customProducts}
            setCustomProducts={setCustomProducts}
            cart={cart}
            setCart={setCart}
            isDiscountEnabled={isDiscountEnabled}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}

        {currentStep === 3 && (
          <Step3Payment
            paymentInfo={paymentInfo}
            setPaymentInfo={setPaymentInfo}
            subtotal={subtotal}
            discount={discount}
            total={total}
            settings={settings}
            onNext={handleProceedToStep4}
            onPrev={handlePrev}
          />
        )}

        {currentStep === 4 && (
          <Step4Feedback
            feedback={feedback}
            onSelectFeedback={handleSelectFeedback}
            bill={completedBill}
            storeSettings={settings}
            onReset={handleResetCheckout}
            submitting={submitting}
          />
        )}
      </div>

    </div>
  );
}
