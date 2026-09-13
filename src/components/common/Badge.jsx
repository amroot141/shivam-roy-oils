import React from 'react';
import { ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, Award, Sparkles } from 'lucide-react';

export function FeedbackBadge({ feedback = 'none', size = 'md' }) {
  const isSm = size === 'sm';
  const iconSize = isSm ? 12 : 14;

  if (feedback === 'good') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
        <ThumbsUp size={iconSize} className="text-emerald-600" />
        <span>Good Feedback</span>
      </span>
    );
  }

  if (feedback === 'bad') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-full ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
        <ThumbsDown size={iconSize} className="text-rose-600" />
        <span>Bad Feedback</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium bg-stone-100 text-stone-600 border border-stone-200 rounded-full ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
      <span>No Feedback</span>
    </span>
  );
}

export function UnitBadge({ unit = 'bottle' }) {
  const colors = {
    bottle: 'bg-amber-50 text-amber-800 border-amber-200',
    liter: 'bg-blue-50 text-blue-800 border-blue-200',
    kg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    piece: 'bg-purple-50 text-purple-800 border-purple-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${colors[unit] || 'bg-stone-100 text-stone-700 border-stone-200'}`}>
      {unit}
    </span>
  );
}

export function StockBadge({ quantity = 0, threshold = 10 }) {
  const isOut = quantity <= 0;
  const isLow = quantity > 0 && quantity <= threshold;

  if (isOut) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        <AlertTriangle size={12} /> Out of Stock
      </span>
    );
  }

  if (isLow) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
        <AlertTriangle size={12} /> Low Stock ({quantity})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
      <CheckCircle size={12} className="text-emerald-500" /> {quantity} in stock
    </span>
  );
}

export function LoyaltyTierBadge({ tier = 'New Shopper', isRepeat = false }) {
  if (tier === 'Gold VIP') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow-xs">
        <Award size={13} className="text-stone-900" /> Gold VIP
      </span>
    );
  }

  if (tier === 'Silver Regular') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-200 text-stone-800 border border-stone-300">
        <Sparkles size={12} className="text-amber-600" /> Silver Regular
      </span>
    );
  }

  if (isRepeat) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
        Repeat Shopper
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
      New Shopper
    </span>
  );
}
