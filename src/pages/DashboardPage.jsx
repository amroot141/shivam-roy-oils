import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { analyticsService } from '../services/analyticsService';

import { StatCards } from '../components/dashboard/StatCards';
import { SalesTrendChart } from '../components/dashboard/SalesTrendChart';
import { TopProductsChart } from '../components/dashboard/TopProductsChart';
import { PaymentPieChart } from '../components/dashboard/PaymentPieChart';
import { StockBarChart } from '../components/dashboard/StockBarChart';
import { CustomerLoyaltyWidget } from '../components/dashboard/CustomerLoyaltyWidget';
import { LowStockWidget } from '../components/dashboard/LowStockWidget';
import { StoreQRWidget } from '../components/dashboard/StoreQRWidget';
import { UPISettingsWidget } from '../components/dashboard/UPISettingsWidget';
import { InventoryTable } from '../components/dashboard/InventoryTable';
import { RecentBillsTable } from '../components/dashboard/RecentBillsTable';
import { DataExportModal } from '../components/dashboard/DataExportModal';
import { DataExportWidget } from '../components/dashboard/DataExportWidget';
import { PrintTemplateCustomizer } from '../components/dashboard/PrintTemplateCustomizer';
import { UserRolesAndSecurityWidget } from '../components/dashboard/UserRolesAndSecurityWidget';

import { 
  LayoutDashboard, 
  BarChart3, 
  Package, 
  Receipt, 
  Settings, 
  ShoppingBag,
  Store,
  RefreshCw,
  Download,
  Printer,
  ShieldCheck,
  Users
} from 'lucide-react';

export function DashboardPage() {
  const { isAuthenticated, user, usersList } = useAuth();
  const { 
    inventory, 
    bills, 
    settings, 
    loading, 
    refresh, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    adjustStock, 
    updateSettings 
  } = useStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'inventory' | 'bills' | 'loyalty' | 'templates' | 'users'
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // If not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-500">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Compute analytics datasets
  const todayStats = analyticsService.getTodayStats(bills, inventory, settings?.low_stock_threshold || 10);
  const trendData = analyticsService.getLast7DaysTrend(bills);
  const topProductsData = analyticsService.getTopProductsByRevenue(bills, 5);
  const paymentBreakdownData = analyticsService.getPaymentBreakdown(bills);
  const stockLevelsData = analyticsService.getStockLevels(inventory);
  const customerLoyaltyData = analyticsService.getCustomerFeedbackAnalytics(bills);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50/70 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
              Admin Portal
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">Welcome back, {user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-heading tracking-tight">
            Store Command Center
          </h1>
        </div>

        {/* Header Tabs & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white p-1 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-1 text-xs flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              Inventory ({inventory.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bills')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'bills'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              Bills ({bills.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('loyalty')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'loyalty'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              Loyalty
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'templates'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              <Printer size={13} />
              <span>Print Template</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'users'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              <Users size={13} />
              <span>Users &amp; Security</span>
            </button>
          </div>

          {/* Export Data Modal Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Export store data to CSV or JSON"
          >
            <Download size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={refresh}
            className="p-2 bg-white hover:bg-stone-100 text-stone-600 rounded-2xl border border-stone-200 shadow-xs transition-colors cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 1. Top Stat Cards (Always visible) */}
      <StatCards stats={todayStats} />

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Recharts Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: 7-Day Sales & Discounts Area Chart */}
            <SalesTrendChart data={trendData} />

            {/* Chart 2: Top Products by Revenue */}
            <TopProductsChart data={topProductsData} />

            {/* Chart 3: Payment Breakdown (UPI vs Cash Donut) */}
            <PaymentPieChart data={paymentBreakdownData} />

            {/* Chart 4: Stock Levels Remaining Bar Chart */}
            <StockBarChart data={stockLevelsData} />
          </div>

          {/* Repeat Customer Feedback Analytics Widget */}
          <CustomerLoyaltyWidget customerData={customerLoyaltyData} />

          {/* Management Widgets: Export Widget, Low Stock Alerts, Store QR, UPI Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataExportWidget
              onOpenModal={() => setIsExportModalOpen(true)}
            />

            <LowStockWidget
              inventory={inventory}
              onAdjustStock={adjustStock}
            />

            <StoreQRWidget
              storeSettings={settings}
            />

            <UPISettingsWidget
              settings={settings}
              onUpdateSettings={updateSettings}
            />
          </div>

          {/* Quick Peek: Recent Bills Table */}
          <RecentBillsTable
            bills={bills}
            storeSettings={settings}
          />
        </div>
      )}

      {/* TAB 2: INVENTORY CRUD */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <InventoryTable
            inventory={inventory}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onAdjustStock={adjustStock}
          />
        </div>
      )}

      {/* TAB 3: RECENT BILLS */}
      {activeTab === 'bills' && (
        <div className="space-y-6">
          <RecentBillsTable
            bills={bills}
            storeSettings={settings}
          />
        </div>
      )}

      {/* TAB 4: REPEAT CUSTOMER LOYALTY & FEEDBACK */}
      {activeTab === 'loyalty' && (
        <div className="space-y-6">
          <CustomerLoyaltyWidget customerData={customerLoyaltyData} />
        </div>
      )}

      {/* TAB 5: PRINT TEMPLATE CUSTOMIZER */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <PrintTemplateCustomizer
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        </div>
      )}

      {/* TAB 6: USERS, ROLES & SECURITY */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <UserRolesAndSecurityWidget />
        </div>
      )}

      {/* Interactive Data Export Modal */}
      <DataExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        inventory={inventory}
        bills={bills}
        settings={settings}
        customerData={customerLoyaltyData}
      />

    </div>
  );
}
