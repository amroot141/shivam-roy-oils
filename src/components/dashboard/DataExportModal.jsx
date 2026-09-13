import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Package, 
  Receipt, 
  Tag, 
  Users, 
  Database,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { exportHelper } from '../../utils/exportHelper';
import { formatCurrency } from '../../utils/formatters';

export function DataExportModal({ 
  isOpen, 
  onClose, 
  inventory = [], 
  bills = [], 
  settings = {}, 
  customerData = [] 
}) {
  const [activeExport, setActiveExport] = useState(null);

  const handleExport = (type, format) => {
    setActiveExport(`${type}-${format}`);
    try {
      if (type === 'inventory') {
        exportHelper.exportInventory(inventory, format);
      } else if (type === 'sales') {
        exportHelper.exportSales(bills, format);
      } else if (type === 'discounts') {
        exportHelper.exportDiscounts(bills, format);
      } else if (type === 'customers') {
        exportHelper.exportCustomers(customerData, format);
      } else if (type === 'backup') {
        exportHelper.exportFullBackup(inventory, bills, settings);
      }
    } finally {
      setTimeout(() => setActiveExport(null), 1200);
    }
  };

  const exportOptions = [
    {
      id: 'inventory',
      title: 'Inventory Data',
      desc: 'Product names, stock quantities, unit prices, unit types, and feedback discount rates.',
      meta: `${inventory.length} items on catalog`,
      icon: Package,
      color: 'from-amber-500 to-amber-600',
      badge: 'Stock & Catalog'
    },
    {
      id: 'sales',
      title: 'Sales & Transactions',
      desc: 'All generated bills, customer names, itemized breakdown, payment methods, cash change, and feedback.',
      meta: `${bills.length} bills recorded`,
      icon: Receipt,
      color: 'from-blue-500 to-blue-600',
      badge: 'Revenue Log'
    },
    {
      id: 'discounts',
      title: 'Discounts & Savings',
      desc: 'Feedback-triggered discount records, savings amount per order, and discount percentages.',
      meta: `${bills.filter(b => Number(b.discount_amount) > 0).length} discounted orders`,
      icon: Tag,
      color: 'from-emerald-500 to-emerald-600',
      badge: 'Feedback Rewards'
    },
    {
      id: 'customers',
      title: 'Customer Loyalty & Feedback',
      desc: 'Unique customers by phone number, repeat visit counts, sentiment ratios, and loyalty tiers.',
      meta: `${customerData.length} unique customers`,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      badge: 'Loyalty & CRM'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Shivam Roy Oils Data" maxWidth="max-w-2xl">
      <div className="space-y-5">
        
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
          <div className="p-1.5 bg-amber-200/70 text-amber-900 rounded-xl shrink-0 mt-0.5">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="font-bold text-sm block mb-0.5">One-Click Data Exporter</span>
            Export your local store records in standard RFC 4180 CSV (ready for Excel, Google Sheets, or Tally) or raw JSON format.
          </div>
        </div>

        {/* 4 Main Export Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {exportOptions.map((opt) => {
            const Icon = opt.icon;
            const isCsvLoading = activeExport === `${opt.id}-csv`;
            const isJsonLoading = activeExport === `${opt.id}-json`;

            return (
              <div 
                key={opt.id}
                className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${opt.color} text-white flex items-center justify-center shadow-xs`}>
                        <Icon size={16} />
                      </div>
                      <span className="font-bold text-stone-900 text-sm font-heading">
                        {opt.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-600">
                      {opt.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 line-clamp-2 mb-2">
                    {opt.desc}
                  </p>
                  <span className="text-[10px] font-semibold text-stone-400 block mb-3">
                    {opt.meta}
                  </span>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => handleExport(opt.id, 'csv')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white hover:bg-amber-50 hover:text-amber-800 text-stone-700 border border-stone-300 hover:border-amber-300 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    {isCsvLoading ? <CheckCircle2 size={13} className="text-emerald-600" /> : <FileSpreadsheet size={13} className="text-emerald-600" />}
                    <span>{isCsvLoading ? 'Exported!' : 'CSV (Excel)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExport(opt.id, 'json')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    {isJsonLoading ? <CheckCircle2 size={13} className="text-emerald-600" /> : <FileCode size={13} className="text-blue-600" />}
                    <span>{isJsonLoading ? 'Exported!' : 'JSON'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Database Backup Card */}
        <div className="bg-stone-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Database size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm font-heading text-stone-100">
                Full Store Database Backup
              </h4>
              <p className="text-xs text-stone-400">
                Complete snapshot of all inventory, bills, customer records, and UPI settings in a single JSON file.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleExport('backup', 'json')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Download size={15} />
            <span>{activeExport === 'backup-json' ? 'Downloaded!' : 'Download Backup'}</span>
          </button>
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
}
