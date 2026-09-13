import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function SalesTrendChart({ data = [] }) {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-stone-900 text-base sm:text-lg flex items-center gap-2">
            <TrendingUp size={18} className="text-amber-600" />
            <span>Sales Trend (Last 7 Days)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Daily gross sales &amp; customer feedback discounts
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-stone-600 font-medium">Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-stone-600 font-medium">Discount</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="discountGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece6" />
            <XAxis 
              dataKey="day" 
              stroke="#a8a29e" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#a8a29e" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `₹${val}`} 
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-stone-900 text-white text-xs rounded-2xl p-3 shadow-xl border border-stone-700">
                      <p className="font-bold text-stone-200 mb-1">{label}</p>
                      <p className="text-amber-400 font-semibold">
                        Sales: {formatCurrency(payload[0]?.value || 0)}
                      </p>
                      <p className="text-emerald-400 font-semibold">
                        Discounts: {formatCurrency(payload[1]?.value || 0)}
                      </p>
                      {payload[0]?.payload?.billsCount !== undefined && (
                        <p className="text-stone-400 text-[10px] mt-1 pt-1 border-t border-stone-800">
                          {payload[0].payload.billsCount} bills
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#d97706" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#salesGrad)" 
            />
            <Area 
              type="monotone" 
              dataKey="discount" 
              stroke="#10b981" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#discountGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
