import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, ClipboardList, LogOut, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-primary-500 text-lg">EquipRental</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-800 mr-2">
                CUSTOMER
              </span>
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-1.5">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-100">
            Welcome back, <span className="text-primary-400">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-400 mt-1">Manage your equipment rentals and browse the catalog.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link to="/catalog" className="group p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 transition-all flex flex-col gap-4">
            <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-800/50">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">Browse Equipment</h3>
              <p className="text-sm text-slate-500 mt-1">Browse the full catalog of available equipment and make a booking.</p>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-primary-400 transition-colors flex items-center gap-1">
              Open Catalog <ArrowRight className="h-3 w-3" />
            </span>
          </Link>

          <Link to="/my-rentals" className="group p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 transition-all flex flex-col gap-4">
            <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-800/50">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">My Rentals</h3>
              <p className="text-sm text-slate-500 mt-1">Track all your active and past equipment rentals and bookings.</p>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-primary-400 transition-colors flex items-center gap-1">
              View Rentals <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
