import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { Navbar } from './components/common/Navbar';

// Eager-load LandingPage (tiny, always needed first)
import { LandingPage } from './pages/LandingPage';

// Lazy-load heavy routes — each gets its own JS chunk, loaded on demand
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage }))
);
const StaffPage = lazy(() =>
  import('./pages/StaffPage').then(m => ({ default: m.StaffPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage }))
);

// Minimal full-screen spinner shown only during chunk download (first visit to a route)
function PageLoader() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-stone-50">
      <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LandingPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/staff" element={<StaffPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
