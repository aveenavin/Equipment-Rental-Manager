import React from 'react';
import { Clock, CheckCircle, Truck, RotateCcw, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    className: 'bg-blue-900/40 text-blue-400 border-blue-800',
  },
  checked_out: {
    label: 'Checked Out',
    icon: Truck,
    className: 'bg-primary-900/40 text-primary-400 border-primary-800',
  },
  returned: {
    label: 'Returned',
    icon: RotateCcw,
    className: 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-slate-800 text-slate-500 border-slate-700',
  },
};

const RentalStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    icon: Clock,
    className: 'bg-slate-800 text-slate-400 border-slate-700',
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

export default RentalStatusBadge;
