import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { Package } from 'lucide-react';

export function StockBarChart({ data = [] }) {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-heading font-bold text-stone-900 text-base sm:text-lg flex items-center gap-2">
            <Package size={18} className="text-amber-600" />
            <span>Stock Levels Remaining</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time units on shelves (amber indicates &le; 10 units)
          </p>
        </div>
      </div>

      <div className="h-56 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-stone-400">
            No inventory records
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece6" />
              <XAxis 
                dataKey="name" 
                stroke="#a8a29e" 
                fontSize={10} 
                tickLine={false} 
                interval={0} 
                angle={-25} 
                textAnchor="end" 
              />
              <YAxis 
                stroke="#a8a29e" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-stone-900 text-white text-xs rounded-2xl p-3 shadow-xl border border-stone-700">
                        <p className="font-bold text-stone-200 mb-1">{item.fullName}</p>
                        <p className="font-semibold text-amber-400">
                          Stock: {item.stock} {item.unit}
                        </p>
                        {item.isLow && (
                          <p className="text-rose-400 text-[11px] font-bold mt-1">
                            Warning: Low Stock (&le; 10)
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="stock" radius={[6, 6, 0, 0]} barSize={22}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isLow ? '#f59e0b' : '#1c1917'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs pt-3 border-t border-stone-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-stone-900" />
          <span className="text-stone-600">Healthy Stock (&gt;10)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-amber-500" />
          <span className="text-amber-800 font-semibold">Low Stock (&le;10)</span>
        </div>
      </div>
    </div>
  );
}
