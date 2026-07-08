import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Package, Receipt, LogOut } from 'lucide-react';
import Button from '../../components/ui/Button';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-primary-500 text-lg">EquipRental</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Welcome, <span className="text-slate-200 font-medium">{user?.name}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-1.5">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-slate-400 mb-10">
          Manage your equipment rentals and account details.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="p-2.5 w-fit rounded-lg bg-primary-500/10 text-primary-400 mb-4">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">My Bookings</h3>
            <p className="text-slate-400 text-sm mt-1">View and manage your active and past reservations.</p>
            <p className="text-xs text-slate-600 mt-4 italic">Available in Phase 4</p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="p-2.5 w-fit rounded-lg bg-accent-500/10 text-accent-400 mb-4">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Browse Equipment</h3>
            <p className="text-slate-400 text-sm mt-1">Explore our full inventory and check availability.</p>
            <p className="text-xs text-slate-600 mt-4 italic">Available in Phase 3</p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="p-2.5 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 mb-4">
              <Receipt className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Invoices</h3>
            <p className="text-slate-400 text-sm mt-1">Download PDF invoices for your completed rentals.</p>
            <p className="text-xs text-slate-600 mt-4 italic">Available in Phase 6</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
