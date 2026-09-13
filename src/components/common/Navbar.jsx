import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Store, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { LoginModal } from '../auth/LoginModal';
import { ForgotPasswordModal } from '../auth/ForgotPasswordModal';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navLinks = [
    { name: 'Self-Checkout', path: '/checkout', icon: ShoppingBag, public: true, badge: 'Customer' },
    { name: 'Counter POS', path: '/staff', icon: Store, public: true, badge: 'Staff' },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, public: false, badge: 'Admin' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Store Info */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <span className="font-heading text-xl">S</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-lg text-stone-900 tracking-tight leading-tight flex items-center gap-1">
                    Shivam Roy<span className="text-amber-600"> Oils</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 ml-1">
                      POS
                    </span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium hidden sm:inline-block">
                    {settings?.store_name || 'Organic Provisions'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/60">
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-amber-700 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-950 hover:bg-white/50'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-amber-600' : 'text-stone-400'} />
                    <span>{link.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive ? 'bg-amber-50 text-amber-700' : 'bg-stone-200/80 text-stone-500'
                    }`}>
                      {link.badge}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Items */}
            <div className="hidden md:flex items-center gap-3">
              {/* Auth Indicator / Profile or Login Modal Button */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-amber-50/70 border border-amber-200/60 px-2.5 py-1 rounded-xl">
                    <ShieldCheck size={14} className="text-amber-600" />
                    <span className="font-semibold text-stone-900">{user?.name}</span>
                    <span className="text-[10px] text-amber-700 uppercase bg-amber-100 px-1 py-0.2 rounded font-bold">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Admin Login</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 focus:outline-hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-amber-50 text-amber-800 font-bold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-amber-600' : 'text-stone-400'} />
                    <span>{link.name}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                    {link.badge}
                  </span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 py-2 cursor-pointer"
                >
                  <LogOut size={14} />
                  Sign Out ({user?.role})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLoginModal(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 py-2 cursor-pointer"
                >
                  <LogIn size={14} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

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
    </>
  );
}
