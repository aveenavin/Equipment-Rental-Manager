import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = 'text-orange-600',
  iconBg = 'bg-orange-100 border-orange-200',
  trend,
  trendLabel,
  prefix = '',
  suffix = '',
}) => {
  const trendPositive = trend > 0;
  const trendNeutral = trend === 0 || trend === undefined;

  return (
    <div className="bg-white border border-orange-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-sm transition-all group shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg border ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
            trendNeutral
              ? 'bg-gray-100 text-gray-500'
              : trendPositive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-600'
          }`}>
            {trendNeutral ? <Minus className="h-3 w-3" /> : trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendNeutral ? 'No change' : `${Math.abs(trend)}%`}
          </div>
        )}
      </div>
      <p className="text-xl font-extrabold text-gray-800 tabular-nums tracking-tight mt-1">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      <p className="text-xs text-gray-500 mt-0.5 font-semibold">{label}</p>
      {(sub || trendLabel) && (
        <p className="text-[11px] text-gray-400 mt-1">{trendLabel || sub}</p>
      )}
    </div>
  );
};

export default StatCard;
