import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, ClipboardList, ArrowRight, Calendar } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 sm:p-8">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">
          Welcome back,{' '}
          <span className="text-orange-400">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your equipment rentals and browse the catalog.
        </p>
      </div>

      {/* Quick-access cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
        <Link
          to="/catalog"
          className="group p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-700/50 hover:bg-slate-800/60 transition-all flex flex-col gap-4"
        >
          <div className="p-3 w-fit rounded-xl bg-orange-500/10 text-orange-400 border border-orange-800/50">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">Browse Equipment</h3>
            <p className="text-sm text-slate-500 mt-1">
              Browse the full catalog of available equipment and make a booking.
            </p>
          </div>
          <span className="text-xs text-slate-500 group-hover:text-orange-400 transition-colors flex items-center gap-1">
            Open Catalog <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        <Link
          to="/my-rentals"
          className="group p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-700/50 hover:bg-slate-800/60 transition-all flex flex-col gap-4"
        >
          <div className="p-3 w-fit rounded-xl bg-orange-500/10 text-orange-400 border border-orange-800/50">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">My Rentals</h3>
            <p className="text-sm text-slate-500 mt-1">
              Track all your active and past equipment rentals and bookings.
            </p>
          </div>
          <span className="text-xs text-slate-500 group-hover:text-orange-400 transition-colors flex items-center gap-1">
            View Rentals <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      {/* Info strip */}
      <div className="mt-8 max-w-2xl flex items-start gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-800/40 shrink-0">
          <Calendar className="h-4 w-4 text-orange-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">How it works</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse equipment, submit a booking request, and our team will confirm your rental.
            Equipment is checked out and returned at our site.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
