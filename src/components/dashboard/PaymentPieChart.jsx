import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function PaymentPieChart({ data = [] }) {
  const totalVolume = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-heading font-bold text-stone-900 text-base sm:text-lg flex items-center gap-2">
            <CreditCard size={18} className="text-amber-600" />
            <span>Payment Breakdown</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Share of revenue: UPI vs Counter Cash
          </p>
        </div>
      </div>

      <div className="h-56 w-full relative flex items-center justify-center">
        {totalVolume === 0 ? (
          <div className="text-xs text-stone-400">No payment records yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    const pct = totalVolume > 0 ? Math.round((item.value / totalVolume) * 100) : 0;
                    return (
                      <div className="bg-stone-900 text-white text-xs rounded-2xl p-3 shadow-xl border border-stone-700">
                        <p className="font-bold text-stone-200">{item.name}</p>
                        <p className="text-amber-400 font-semibold">{formatCurrency(item.value)}</p>
                        <p className="text-stone-400 text-[11px]">{item.count} bills ({pct}%)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-around pt-3 border-t border-stone-100">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <div>
              <span className="text-xs font-semibold text-stone-700">{item.name}:</span>
              <span className="text-xs font-bold text-stone-900 ml-1">
                {formatCurrency(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
