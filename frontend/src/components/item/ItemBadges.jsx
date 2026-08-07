import React from 'react';

const statusConfig = {
  available: { label: 'Available', cls: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border border-white/20' },
  rented: { label: 'Rented', cls: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20 border border-white/20' },
  maintenance: { label: 'Maintenance', cls: 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20 border border-white/20' },
  retired: { label: 'Retired', cls: 'bg-gradient-to-r from-gray-500 to-slate-400 text-white shadow-md shadow-gray-500/20 border border-white/20' },
};

const conditionConfig = {
  excellent: { label: 'Excellent', cls: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border border-white/20' },
  good: { label: 'Good', cls: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20 border border-white/20' },
  fair: { label: 'Fair', cls: 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20 border border-white/20' },
  poor: { label: 'Poor', cls: 'bg-gradient-to-r from-red-500 to-rose-400 text-white shadow-md shadow-red-500/20 border border-white/20' },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, cls: 'bg-gradient-to-r from-gray-500 to-slate-400 text-white shadow-md shadow-gray-500/20 border border-white/20' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.cls}`}>
      {config.label}
    </span>
  );
};

export const ConditionBadge = ({ condition }) => {
  const config = conditionConfig[condition] || { label: condition, cls: 'bg-gradient-to-r from-gray-500 to-slate-400 text-white shadow-md shadow-gray-500/20 border border-white/20' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.cls}`}>
      {config.label}
    </span>
  );
};
