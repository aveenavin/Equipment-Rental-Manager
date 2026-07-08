import React from 'react';

const statusConfig = {
  available: { label: 'Available', className: 'bg-emerald-900/40 text-emerald-400 border-emerald-800' },
  rented: { label: 'Rented', className: 'bg-blue-900/40 text-blue-400 border-blue-800' },
  maintenance: { label: 'Maintenance', className: 'bg-yellow-900/40 text-yellow-400 border-yellow-800' },
  retired: { label: 'Retired', className: 'bg-slate-800 text-slate-500 border-slate-700' },
};

const conditionConfig = {
  excellent: { label: 'Excellent', className: 'bg-emerald-900/40 text-emerald-400 border-emerald-800' },
  good: { label: 'Good', className: 'bg-blue-900/40 text-blue-400 border-blue-800' },
  fair: { label: 'Fair', className: 'bg-yellow-900/40 text-yellow-400 border-yellow-800' },
  poor: { label: 'Poor', className: 'bg-red-900/40 text-red-400 border-red-800' },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, className: 'bg-slate-800 text-slate-400 border-slate-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
};

export const ConditionBadge = ({ condition }) => {
  const config = conditionConfig[condition] || { label: condition, className: 'bg-slate-800 text-slate-400 border-slate-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
};
