import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = 'text-primary-400',
  iconBg = 'bg-primary-900/30 border-primary-800/50',
  trend,
  trendLabel,
  prefix = '',
  suffix = '',
}) => {
  const trendPositive = trend > 0;
  const trendNeutral = trend === 0 || trend === undefined;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl border ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendNeutral
              ? 'bg-slate-800 text-slate-400'
              : trendPositive
              ? 'bg-emerald-900/40 text-emerald-400'
              : 'bg-red-900/40 text-red-400'
          }`}>
            {trendNeutral ? <Minus className="h-3 w-3" /> : trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendNeutral ? 'No change' : `${Math.abs(trend)}%`}
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold text-slate-100 tabular-nums">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      <p className="text-sm text-slate-400 mt-0.5 font-medium">{label}</p>
      {(sub || trendLabel) && (
        <p className="text-xs text-slate-600 mt-1.5">{trendLabel || sub}</p>
      )}
    </div>
  );
};

export default StatCard;
