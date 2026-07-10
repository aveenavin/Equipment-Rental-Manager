import React from 'react';
import { Clock, CheckCircle, Truck, RotateCcw, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    cls: 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20 border border-white/20'
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    cls: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20 border border-white/20'
  },
  checked_out: {
    label: 'Checked Out',
    icon: Truck,
    cls: 'bg-gradient-to-r from-indigo-500 to-violet-400 text-white shadow-md shadow-indigo-500/20 border border-white/20'
  },
  returned: {
    label: 'Returned',
    icon: RotateCcw,
    cls: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border border-white/20'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    cls: 'bg-gradient-to-r from-gray-500 to-slate-400 text-white shadow-md shadow-gray-500/20 border border-white/20'
  },
};

const RentalStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    icon: Clock,
    cls: 'bg-gradient-to-r from-gray-500 to-slate-400 text-white shadow-md shadow-gray-500/20 border border-white/20'
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.cls}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

export default RentalStatusBadge;
