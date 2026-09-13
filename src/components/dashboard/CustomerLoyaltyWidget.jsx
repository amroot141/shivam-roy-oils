import React, { useState } from 'react';
import { 
  HeartHandshake, 
  ThumbsUp, 
  ThumbsDown, 
  Award, 
  Search, 
  Sparkles, 
  Clock, 
  UserCheck, 
  Flame,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';
import { LoyaltyTierBadge, FeedbackBadge } from '../common/Badge';
import { exportHelper } from '../../utils/exportHelper';

export function CustomerLoyaltyWidget({ customerData = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRepeatOnly, setFilterRepeatOnly] = useState(false);

  // Compute aggregate stats across all unique customers
  const totalUnique = customerData.length;
  const repeatCount = customerData.filter(c => c.isRepeat).length;
  const repeatPercentage = totalUnique > 0 ? Math.round((repeatCount / totalUnique) * 100) : 0;
  const totalFeedbackLogged = customerData.reduce((acc, c) => acc + c.total_feedback_submissions, 0);

  const filtered = customerData.filter(c => {
    const matchesSearch = c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchesRepeat = !filterRepeatOnly || c.isRepeat;
    return matchesSearch && matchesRepeat;
  });

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs">
      
      {/* Widget Header & Metrics Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-xs">
              <HeartHandshake size={20} />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-stone-900 text-lg sm:text-xl flex items-center gap-2">
                <span>Top Customer Feedback &amp; Loyalty</span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  Analytics
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                Track repeat store shoppers, feedback frequency, and customer sentiment by phone number
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs">
            <span className="text-stone-400 block text-[10px] font-bold uppercase">Unique Shoppers</span>
            <span className="font-black text-stone-900 text-sm">{totalUnique}</span>
          </div>

          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs">
            <span className="text-amber-700 block text-[10px] font-bold uppercase">Repeat Rate</span>
            <span className="font-black text-amber-900 text-sm flex items-center gap-1">
              <Flame size={14} className="text-amber-600" />
              {repeatPercentage}% ({repeatCount})
            </span>
          </div>

          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
            <span className="text-emerald-700 block text-[10px] font-bold uppercase">Feedback Submissions</span>
            <span className="font-black text-emerald-900 text-sm">{totalFeedbackLogged}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between py-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name or phone..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterRepeatOnly(!filterRepeatOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterRepeatOnly
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Sparkles size={13} />
            <span>Repeat Customers Only ({repeatCount})</span>
          </button>

          <button
            type="button"
            onClick={() => exportHelper.exportCustomers(customerData, 'csv')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Export customer profiles and loyalty metrics to CSV"
          >
            <Download size={13} className="text-amber-400" />
            <span>Export Loyalty CSV</span>
          </button>
        </div>
      </div>

      {/* Customer Loyalty Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-stone-50 text-stone-500 font-bold uppercase text-[10px] tracking-wider border-y border-stone-200">
              <th className="py-3 px-4">Customer &amp; Phone</th>
              <th className="py-3 px-3 text-center">Loyalty Tier</th>
              <th className="py-3 px-3 text-center">Total Visits</th>
              <th className="py-3 px-3">Feedback Breakdown</th>
              <th className="py-3 px-3 text-right">Total Spent</th>
              <th className="py-3 px-4 text-right">Last Visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-stone-400">
                  No customer records match your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((cust) => {
                const isLoyalRepeat = cust.total_bills > 1;

                return (
                  <tr 
                    key={cust.phoneKey} 
                    className={`hover:bg-amber-50/30 transition-colors ${
                      isLoyalRepeat ? 'bg-amber-50/10' : ''
                    }`}
                  >
                    {/* Name & Phone */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isLoyalRepeat
                            ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-300'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {cust.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 flex items-center gap-1.5">
                            <span>{cust.customer_name}</span>
                            {isLoyalRepeat && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded-md">
                                Repeat
                              </span>
                            )}
                          </p>
                          <p className="text-stone-400 text-[11px] font-mono">
                            {formatPhone(cust.phone)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Loyalty Tier Badge */}
                    <td className="py-3 px-3 text-center">
                      <LoyaltyTierBadge tier={cust.tier} isRepeat={cust.isRepeat} />
                    </td>

                    {/* Total Visits */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-1 bg-stone-100 rounded-xl font-bold text-stone-800 text-xs">
                        {cust.total_bills} {cust.total_bills === 1 ? 'bill' : 'bills'}
                      </span>
                    </td>

                    {/* Feedback Breakdown */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
                            <ThumbsUp size={11} /> {cust.feedback_counts.good}
                          </span>
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px] bg-rose-50 px-2 py-0.5 rounded-md">
                            <ThumbsDown size={11} /> {cust.feedback_counts.bad}
                          </span>
                          {cust.feedback_counts.none > 0 && (
                            <span className="text-stone-400 text-[10px]">
                              ({cust.feedback_counts.none} no feedback)
                            </span>
                          )}
                        </div>

                        {/* Sentiment Visual Progress Bar */}
                        {cust.total_feedback_submissions > 0 && (
                          <div className="w-28 h-1.5 bg-stone-200 rounded-full overflow-hidden flex">
                            <div 
                              className="bg-emerald-500 h-full" 
                              style={{ width: `${cust.positiveSentimentRatio || 0}%` }} 
                              title={`${cust.positiveSentimentRatio}% positive`}
                            />
                            <div 
                              className="bg-rose-500 h-full" 
                              style={{ width: `${100 - (cust.positiveSentimentRatio || 0)}%` }} 
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Total Spend */}
                    <td className="py-3 px-3 text-right font-extrabold text-stone-900 text-sm">
                      {formatCurrency(cust.total_spend)}
                    </td>

                    {/* Last Visit Timestamp */}
                    <td className="py-3 px-4 text-right text-stone-500">
                      <div className="flex flex-col items-end">
                        <span className="text-stone-800 font-medium">
                          {formatDate(cust.last_visit)}
                        </span>
                        <div className="mt-0.5">
                          <FeedbackBadge feedback={cust.last_feedback} size="sm" />
                        </div>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
