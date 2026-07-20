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
    <div className="bg-white border border-orange-200 rounded-xl px-3 py-2 hover:border-orange-400 hover:shadow-sm transition-all group shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <div className={`p-1 rounded-lg border ${iconBg}`}>
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${trendNeutral
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
      <p className="text-lg font-extrabold text-gray-800 tabular-nums tracking-tight mt-0.5">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      <p className="text-[11px] text-gray-500 mt-0 font-semibold leading-tight">{label}</p>
      {(sub || trendLabel) && (
        <p className="text-[10px] text-gray-400 mt-0 leading-tight">{trendLabel || sub}</p>
      )}
    </div>
  );
};

export default StatCard;
