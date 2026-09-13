import React from 'react';
import { User, ShoppingCart, CreditCard, MessageSquareHeart, Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Details', icon: User },
  { id: 2, label: 'Items', icon: ShoppingCart },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Feedback', icon: MessageSquareHeart }
];

export function StepProgressBar({ currentStep, onStepClick, maxStepReached = 1 }) {
  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs py-3 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          
          {/* Background Connecting Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-stone-200 w-full z-0 rounded-full" />
          
          {/* Active Fill Line */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 z-0 rounded-full"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isClickable = step.id <= maxStepReached;
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(step.id)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    isCompleted
                      ? 'bg-amber-600 text-white shadow-sm ring-4 ring-amber-100 hover:scale-105 cursor-pointer'
                      : isCurrent
                      ? 'bg-stone-900 text-amber-400 ring-4 ring-amber-400/30 scale-110 shadow-md cursor-pointer'
                      : 'bg-stone-100 text-stone-400 border border-stone-300 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check size={18} className="stroke-[3]" /> : <Icon size={18} />}
                </button>
                <span className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                  isCurrent ? 'text-amber-800 font-bold' : isCompleted ? 'text-stone-700' : 'text-stone-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
