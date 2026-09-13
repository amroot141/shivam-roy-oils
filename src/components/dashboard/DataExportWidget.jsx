import React from 'react';
import { Download, FileSpreadsheet, FileCode, Database, Sparkles } from 'lucide-react';

export function DataExportWidget({ onOpenModal }) {
  return (
    <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 backdrop-blur-xs rounded-xl text-white">
              <Download size={18} />
            </div>
            <span className="font-heading font-extrabold text-base sm:text-lg">
              Data Export &amp; Reports
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
            CSV &amp; JSON
          </span>
        </div>

        <p className="text-xs text-amber-100/90 leading-relaxed mt-1">
          Export your store records anytime. Download clean spreadsheets for <strong>Inventory</strong>, <strong>Sales Bills</strong>, <strong>Feedback Discounts</strong>, and <strong>Customer Loyalty</strong>.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-amber-100 font-medium">
          <FileSpreadsheet size={14} />
          <span>Excel-ready</span>
          <span className="mx-1">•</span>
          <FileCode size={14} />
          <span>JSON backup</span>
        </div>

        <button
          type="button"
          onClick={onOpenModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-100 text-stone-900 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Download size={14} />
          <span>Export Center</span>
        </button>
      </div>
    </div>
  );
}
