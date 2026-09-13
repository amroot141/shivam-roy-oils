import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Award } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function TopProductsChart({ data = [] }) {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-stone-900 text-base sm:text-lg flex items-center gap-2">
            <Award size={18} className="text-amber-600" />
            <span>Top Products by Revenue</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Highest grossing items across all orders
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-stone-400">
            No sales data recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0ece6" />
              <XAxis 
                type="number" 
                stroke="#a8a29e" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `₹${val}`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#78716c" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                width={95}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-stone-900 text-white text-xs rounded-2xl p-3 shadow-xl border border-stone-700">
                        <p className="font-bold text-stone-200 mb-1">{item.fullName}</p>
                        <p className="text-amber-400 font-semibold">
                          Revenue: {formatCurrency(item.revenue)}
                        </p>
                        <p className="text-stone-300">
                          Sold: {item.quantity} units
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="#d97706" 
                radius={[0, 8, 8, 0]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
