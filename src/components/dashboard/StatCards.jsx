import React from 'react';
import { IndianRupee, Tag, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function StatCards({ stats }) {
  const cards = [
    {
      title: "Today's Sales",
      value: formatCurrency(stats.todaySales || 0),
      subtitle: `${stats.totalBillsToday || 0} bills generated today`,
      icon: IndianRupee,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-700',
      bgLight: 'bg-amber-50 border-amber-200'
    },
    {
      title: "Today's Discounts",
      value: formatCurrency(stats.todayDiscounts || 0),
      subtitle: "Customer feedback savings",
      icon: Tag,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-700',
      bgLight: 'bg-emerald-50 border-emerald-200'
    },
    {
      title: "Items Sold Today",
      value: stats.itemsSoldToday || 0,
      subtitle: "Units across all orders",
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-700',
      bgLight: 'bg-blue-50 border-blue-200'
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockCount || 0,
      subtitle: stats.lowStockCount > 0 ? "Requires inventory restock" : "All stock healthy",
      icon: AlertTriangle,
      color: 'from-rose-500 to-rose-600',
      textColor: 'text-rose-700',
      bgLight: 'bg-rose-50 border-rose-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-stone-500 block uppercase tracking-wider">
                  {card.title}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-stone-900 font-heading mt-1 block">
                  {card.value}
                </span>
              </div>
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-sm`}>
                <Icon size={20} />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium truncate">
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
