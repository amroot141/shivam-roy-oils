import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Store, 
  LayoutDashboard, 
  LogIn, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { LoginModal } from '../components/auth/LoginModal';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useStore();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleDashboardClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-amber-50/40 via-stone-50 to-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold mb-4 shadow-xs">
          <Sparkles size={14} className="text-amber-600 animate-pulse" />
          <span>Pure Oils, Cold-Pressed Provisions &amp; Smart POS</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 font-heading tracking-tight leading-tight">
          M/S SHIVAMROY<span className="text-amber-600"> OIL AND COMPANY</span>
        </h1>
        <p className="text-lg sm:text-xl text-stone-600 font-medium mt-3 max-w-2xl mx-auto">
          Lightweight Point of Sale, Inventory Management, and Customer Self-Checkout built with dynamic feedback discounts.
        </p>
      </div>

      {/* 3 Quick Action Portals */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 w-full">
        
        {/* Portal 1: Customer Self-Checkout */}
        <Link
          to="/checkout"
          className="group bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform shadow-xs">
              <ShoppingBag size={24} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Store QR Portal
            </span>
            <h3 className="text-xl font-bold text-stone-900 font-heading mt-2">
              Customer Self-Checkout
            </h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              Scan store QR on your mobile. Select items, review your shopping experience, and <strong>unlock product-level discounts!</strong>
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>Launch Self-Checkout</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Portal 2: Staff Counter POS */}
        <Link
          to="/staff"
          className="group bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:shadow-xl hover:border-stone-400 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform shadow-xs">
              <Store size={24} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
              Counter Cashier
            </span>
            <h3 className="text-xl font-bold text-stone-900 font-heading mt-2">
              Staff Counter POS
            </h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              Rapid keyboard-friendly cashier counter with quick cash change calculations and printable thermal bills.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-900">
            <span>Open Cashier Counter</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Portal 3: Admin Dashboard */}
        <div
          onClick={handleDashboardClick}
          className="group bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:shadow-xl hover:border-amber-500 transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform shadow-xs">
              <LayoutDashboard size={24} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              Admin &amp; Analytics
            </span>
            <h3 className="text-xl font-bold text-stone-900 font-heading mt-2">
              Admin Dashboard
            </h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              Real-time sales charts, inventory manager CRUD, store QR generator, and <strong>Customer Feedback Analytics</strong>.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>{isAuthenticated ? 'Open Dashboard' : 'Sign In to Access'}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Quick Action Button for Admin Sign In Popup */}
      <div className="max-w-md mx-auto w-full text-center">
        {isAuthenticated ? (
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">{user.name}</p>
                <p className="text-xs text-stone-500 uppercase">{user.role} active</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Lock size={16} className="text-amber-400" />
            <span>Staff &amp; Admin Sign In (Popup)</span>
          </button>
        )}
      </div>

      {/* Login Popup Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onOpenForgotPassword={() => setShowForgotModal(true)}
      />

      {/* Forgot Password Popup Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </div>
  );
}
