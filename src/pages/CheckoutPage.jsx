import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { StepProgressBar } from '../components/checkout/StepProgressBar';
import { Step1Details } from '../components/checkout/Step1Details';
import { Step2Items } from '../components/checkout/Step2Items';
import { Step3Payment } from '../components/checkout/Step3Payment';
import { Step4Feedback } from '../components/checkout/Step4Feedback';
import { CheckoutReceipt } from '../components/checkout/CheckoutReceipt';
import { cartSubtotal, cartDiscount, cartTotal, buildBillItems } from '../utils/cart';

export function CheckoutPage() {
  const { inventory, settings, createBill, loading } = useStore();
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

  // Payment State
  const [paymentInfo, setPaymentInfo] = useState({
    payment_method: 'upi',
    cash_given: '',
    change_returned: 0
  });

  // Feedback State: 'good' | 'bad' | 'none'
  const [feedback, setFeedback] = useState('good'); // Default prompt to encourage positive feedback

  // Convert cart to items list
  const cartItemsList = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const prod = inventory.find(p => p.id === id);
      return {
        id,
        product_id: id,
        product_name: prod?.product_name || 'Product',
        unit: prod?.unit || 'bottle',
        unit_price: prod?.unit_price || 0,
        discount_percent: prod?.discount_percent || 0,
        quantity: qty,
        line_total: (prod?.unit_price || 0) * qty
      };
    });

  const subtotal = cartSubtotal(cartItemsList);

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
      const billDiscount = cartDiscount(cartItemsList, feedback, isDiscountEnabled);
      const finalTotal = cartTotal(subtotal, billDiscount);

      const billData = {
        customer_name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        items: buildBillItems(cartItemsList, inventory),
        num_items: cartItemsList.reduce((acc, i) => acc + i.quantity, 0),
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
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to complete checkout: ' + err.message);
    } finally {
      setSubmitting(false);
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

  // If checkout has finished, render success receipt
  if (completedBill) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-stone-50/60 px-4 py-8">
        <CheckoutReceipt
          bill={completedBill}
          storeSettings={settings}
          onReset={handleResetCheckout}
        />
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
            settings={settings}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}

        {currentStep === 4 && (
          <Step4Feedback
            feedback={feedback}
            setFeedback={setFeedback}
            cartItemsList={cartItemsList}
            paymentInfo={paymentInfo}
            isDiscountEnabled={isDiscountEnabled}
            onSubmitBill={handleSubmitBill}
            onPrev={handlePrev}
            submitting={submitting}
          />
        )}
      </div>

    </div>
  );
}
