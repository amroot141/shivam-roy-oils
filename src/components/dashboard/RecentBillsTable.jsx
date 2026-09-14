import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Eye, 
  ThumbsUp, 
  ThumbsDown, 
  CreditCard, 
  Banknote, 
  QrCode,
  ExternalLink,
  Download,
  Tag,
  Trash2,
  AlertTriangle,
  Lock,
  X,
  ShieldCheck,
  Calendar,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';
import { FeedbackBadge } from '../common/Badge';
import { ReceiptModal } from '../common/ReceiptModal';
import { exportHelper } from '../../utils/exportHelper';
import { useAuth } from '../../context/AuthContext';

// Helper to format Date object into local YYYY-MM-DD
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ── Delete Bill Confirmation Modal ────────────────────────────────────────────
function DeleteBillModal({ bill, onConfirm, onClose }) {
  const { getUsers } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!bill) return null;

  const handleDelete = async () => {
    if (!password.trim()) {
      setError('Please enter your admin password.');
      return;
    }
    setError('');
    setDeleting(true);

    // Verify admin password against any admin-role user
    const users = getUsers();
    const adminUser = users.find(u => u.role === 'admin' && u.password === password.trim());
    if (!adminUser) {
      setDeleting(false);
      setError('Incorrect admin password. Access denied.');
      return;
    }

    await onConfirm(bill.id);
    setDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Delete Bill</h3>
              <p className="text-xs text-stone-500">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Bill Summary */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 font-medium">Bill No.</span>
              <span className="font-mono font-bold text-stone-900">{bill.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 font-medium">Customer</span>
              <span className="font-bold text-stone-900">{bill.customer_name || 'Walk-in'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 font-medium">Date</span>
              <span className="font-medium text-stone-700">{formatDate(bill.created_at)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-stone-200 pt-2 mt-2">
              <span className="text-stone-500 font-medium">Total Amount</span>
              <span className="font-black text-stone-900">{formatCurrency(bill.total_amount)}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 font-medium">
              This bill will be permanently deleted from sales records and cannot be restored. Stock levels will not be adjusted.
            </p>
          </div>

          {/* Admin Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Lock size={12} className="text-stone-500" />
              Admin Password to Confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleDelete()}
              placeholder="Enter admin password..."
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 bg-stone-50"
            />
            {error && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                <ShieldCheck size={12} />
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-colors cursor-pointer disabled:opacity-60"
          >
            <Trash2 size={14} />
            {deleting ? 'Deleting...' : 'Delete Bill'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function RecentBillsTable({ bills = [], storeSettings, onDeleteBill }) {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all'); // 'all', 'today', 'yesterday', 'last7', 'thisMonth', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const todayStr = getLocalDateString(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = getLocalDateString(y);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === 'last7') {
      const past = new Date();
      past.setDate(past.getDate() - 6);
      setStartDate(getLocalDateString(past));
      setEndDate(getLocalDateString(now));
    } else if (preset === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(getLocalDateString(startOfMonth));
      setEndDate(getLocalDateString(now));
    } else if (preset === 'custom') {
      if (!startDate) setStartDate(getLocalDateString(now));
    }
  };

  const handleCustomDateChange = (type, val) => {
    setDatePreset('custom');
    if (type === 'start') {
      setStartDate(val);
    } else {
      setEndDate(val);
    }
  };

  const handleClearDateFilter = () => {
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
  };

  const filteredBills = bills.filter(bill => {
    const term = search.toLowerCase();
    const matchesSearch = 
      bill.id.toLowerCase().includes(term) ||
      (bill.customer_name && bill.customer_name.toLowerCase().includes(term)) ||
      (bill.phone && bill.phone.includes(term));

    const matchesPayment = paymentFilter === 'all' || bill.payment_method === paymentFilter;
    const matchesFeedback = feedbackFilter === 'all' || bill.feedback === feedbackFilter;

    // Date filtering
    let matchesDate = true;
    if (startDate || endDate) {
      if (!bill.created_at) {
        matchesDate = false;
      } else {
        const bDate = new Date(bill.created_at);
        if (isNaN(bDate.getTime())) {
          matchesDate = false;
        } else {
          if (startDate) {
            const [sy, sm, sd] = startDate.split('-').map(Number);
            const startLimit = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
            if (bDate < startLimit) matchesDate = false;
          }
          if (endDate) {
            const [ey, em, ed] = endDate.split('-').map(Number);
            const endLimit = new Date(ey, em - 1, ed, 23, 59, 59, 999);
            if (bDate > endLimit) matchesDate = false;
          } else if (startDate && !endDate) {
            const [sy, sm, sd] = startDate.split('-').map(Number);
            const endLimit = new Date(sy, sm - 1, sd, 23, 59, 59, 999);
            if (bDate > endLimit) matchesDate = false;
          }
        }
      }
    }

    return matchesSearch && matchesPayment && matchesFeedback && matchesDate;
  });

  // Sales calculations for the filtered set
  const totalSales = filteredBills.reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0);
  const totalDiscounts = filteredBills.reduce((acc, b) => acc + (Number(b.discount_amount) || 0), 0);
  const cashSales = filteredBills
    .filter(b => b.payment_method === 'cash')
    .reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0);
  const upiSales = filteredBills
    .filter(b => b.payment_method === 'upi')
    .reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0);
  const avgBill = filteredBills.length > 0 ? Math.round(totalSales / filteredBills.length) : 0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <h3 className="font-heading font-extrabold text-stone-900 text-lg sm:text-xl flex items-center gap-2">
            <Receipt size={20} className="text-amber-600" />
            <span>Recent Bills &amp; Transactions</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {filteredBills.length}{filteredBills.length !== bills.length ? ` of ${bills.length}` : ''} total
            </span>
          </h3>
          <p className="text-xs text-stone-500">
            Audit store sales, customer feedback responses, and reprint receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportHelper.exportDiscounts(filteredBills, 'csv')}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl border border-stone-300 transition-colors cursor-pointer"
            title="Export feedback discounts report"
          >
            <Tag size={13} className="text-amber-600" />
            <span>Export Discounts ({filteredBills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => exportHelper.exportSales(filteredBills, 'csv')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            title="Export filtered sales bills to CSV"
          >
            <Download size={13} />
            <span>Export Sales CSV ({filteredBills.length})</span>
          </button>
        </div>
      </div>

      {/* Dynamic Sales & Performance Summary for Selected Period */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 p-3.5 my-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-stone-50 border border-amber-200/70 shadow-2xs">
        {/* Total Sales */}
        <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-amber-100 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Total Sales</span>
            <TrendingUp size={14} className="text-amber-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-amber-700">
            {formatCurrency(totalSales)}
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 font-medium">
            {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'} in period
          </p>
        </div>

        {/* Cash Sales */}
        <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">Cash Sales</span>
            <Banknote size={14} className="text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-700">
            {formatCurrency(cashSales)}
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 font-medium">
            {filteredBills.filter(b => b.payment_method === 'cash').length} cash bills
          </p>
        </div>

        {/* UPI Sales */}
        <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900">UPI / QR Sales</span>
            <QrCode size={14} className="text-amber-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-stone-900">
            {formatCurrency(upiSales)}
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 font-medium">
            {filteredBills.filter(b => b.payment_method === 'upi').length} UPI bills
          </p>
        </div>

        {/* Avg Ticket */}
        <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Avg Ticket</span>
            <Receipt size={14} className="text-stone-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-stone-800">
            {formatCurrency(avgBill)}
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 font-medium">per transaction</p>
        </div>

        {/* Total Discounts */}
        <div className="col-span-2 sm:col-span-2 md:col-span-1 bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Discounts</span>
            <Tag size={14} className="text-stone-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-stone-700">
            {formatCurrency(totalDiscounts)}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">rewards &amp; offers</p>
        </div>
      </div>

      {/* Date Range Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between p-3.5 mb-3 bg-stone-50/80 rounded-2xl border border-stone-200">
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-stone-600 font-bold mr-1 flex items-center gap-1">
            <Calendar size={13} className="text-amber-600" />
            <span>Date Filter:</span>
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'last7', label: 'Last 7 Days' },
            { id: 'thisMonth', label: 'This Month' },
            { id: 'custom', label: 'Custom' }
          ].map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleDatePresetChange(p.id)}
              className={`px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                datePreset === p.id 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-stone-400 font-semibold text-[11px]">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="bg-transparent text-xs text-stone-800 font-medium focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-stone-400 font-semibold text-[11px]">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="bg-transparent text-xs text-stone-800 font-medium focus:outline-none cursor-pointer"
            />
          </div>

          {(startDate || endDate || datePreset !== 'all') && (
            <button
              type="button"
              onClick={handleClearDateFilter}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              title="Reset date filter to All Time"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between py-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Bill #, customer name, phone..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Payment Method Filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
            {['all', 'upi', 'cash'].map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentFilter(mode)}
                className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer ${
                  paymentFilter === mode ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Feedback Filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
            {['all', 'good', 'bad', 'none'].map(fb => (
              <button
                key={fb}
                type="button"
                onClick={() => setFeedbackFilter(fb)}
                className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer ${
                  feedbackFilter === fb ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {fb}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-stone-50 text-stone-500 font-bold uppercase text-[10px] tracking-wider border-y border-stone-200">
              <th className="py-3 px-4">Bill No</th>
              <th className="py-3 px-3">Date &amp; Source</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Items Summary</th>
              <th className="py-3 px-3 text-right">Subtotal / Discount</th>
              <th className="py-3 px-3 text-right">Total Paid</th>
              <th className="py-3 px-3 text-center">Payment</th>
              <th className="py-3 px-3 text-center">Feedback</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-stone-400">
                  No bills found matching your search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredBills.map(bill => (
                <tr key={bill.id} className="hover:bg-amber-50/20 transition-colors">
                  {/* Bill ID */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-stone-900 text-xs">
                      {bill.id}
                    </span>
                  </td>

                  {/* Date & Source */}
                  <td className="py-3 px-3">
                    <p className="text-stone-700 font-medium">{formatDate(bill.created_at)}</p>
                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                      {bill.feedback_source === 'self' ? 'Self-Checkout' : 'Staff POS'}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-3">
                    <p className="font-bold text-stone-900">{bill.customer_name || 'Walk-in'}</p>
                    {bill.phone && (
                      <p className="text-[11px] text-stone-400 font-mono">
                        {formatPhone(bill.phone)}
                      </p>
                    )}
                  </td>

                  {/* Items count & preview */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-stone-800">
                      {bill.num_items} item{bill.num_items !== 1 ? 's' : ''}
                    </span>
                    <p className="text-[10px] text-stone-400 truncate max-w-[140px]">
                      {(bill.items || []).map(i => i.product_name).join(', ')}
                    </p>
                  </td>

                  {/* Subtotal & Discount */}
                  <td className="py-3 px-3 text-right">
                    <span className="text-stone-600 block">{formatCurrency(bill.subtotal)}</span>
                    {Number(bill.discount_amount) > 0 ? (
                      <span className="text-[11px] font-bold text-emerald-600">
                        - {formatCurrency(bill.discount_amount)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">₹0 discount</span>
                    )}
                  </td>

                  {/* Total Paid */}
                  <td className="py-3 px-3 text-right">
                    <span className="text-sm font-black text-stone-950">
                      {formatCurrency(bill.total_amount)}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full ${
                      bill.payment_method === 'cash'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {bill.payment_method === 'cash' ? <Banknote size={11} /> : <QrCode size={11} />}
                      <span>{bill.payment_method}</span>
                    </span>
                  </td>

                  {/* Feedback */}
                  <td className="py-3 px-3 text-center">
                    <FeedbackBadge feedback={bill.feedback} size="sm" />
                  </td>

                  {/* Actions: View & Delete */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedBill(bill)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        title="View & Print Bill"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                      {onDeleteBill && (
                        <button
                          type="button"
                          onClick={() => setBillToDelete(bill)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-red-200 hover:border-red-600"
                          title="Delete this bill"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bill Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
        storeSettings={storeSettings}
      />

      {/* Delete Confirmation Modal */}
      {billToDelete && (
        <DeleteBillModal
          bill={billToDelete}
          onConfirm={onDeleteBill}
          onClose={() => setBillToDelete(null)}
        />
      )}
    </div>
  );
}
