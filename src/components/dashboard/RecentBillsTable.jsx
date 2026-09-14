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
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';
import { FeedbackBadge } from '../common/Badge';
import { ReceiptModal } from '../common/ReceiptModal';
import { exportHelper } from '../../utils/exportHelper';
import { useAuth } from '../../context/AuthContext';

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
  const [selectedBill, setSelectedBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  const filteredBills = bills.filter(bill => {
    const term = search.toLowerCase();
    const matchesSearch = 
      bill.id.toLowerCase().includes(term) ||
      (bill.customer_name && bill.customer_name.toLowerCase().includes(term)) ||
      (bill.phone && bill.phone.includes(term));

    const matchesPayment = paymentFilter === 'all' || bill.payment_method === paymentFilter;
    const matchesFeedback = feedbackFilter === 'all' || bill.feedback === feedbackFilter;

    return matchesSearch && matchesPayment && matchesFeedback;
  });

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <h3 className="font-heading font-extrabold text-stone-900 text-lg sm:text-xl flex items-center gap-2">
            <Receipt size={20} className="text-amber-600" />
            <span>Recent Bills &amp; Transactions</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {bills.length} total
            </span>
          </h3>
          <p className="text-xs text-stone-500">
            Audit store sales, customer feedback responses, and reprint receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportHelper.exportDiscounts(bills, 'csv')}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl border border-stone-300 transition-colors cursor-pointer"
            title="Export feedback discounts report"
          >
            <Tag size={13} className="text-amber-600" />
            <span>Export Discounts</span>
          </button>

          <button
            type="button"
            onClick={() => exportHelper.exportSales(bills, 'csv')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            title="Export all sales bills to CSV"
          >
            <Download size={13} />
            <span>Export Sales CSV</span>
          </button>
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
