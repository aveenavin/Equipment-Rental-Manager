import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Users, Package, Wrench, LogOut, ClipboardList, RotateCcw, DollarSign } from 'lucide-react';
import Button from '../../components/ui/Button';

const NavCard = ({ icon: Icon, label, description, href, color, comingSoon }) => {
  const colorMap = {
    primary: 'bg-primary-500/10 text-primary-400 border-primary-800/50',
    accent: 'bg-cyan-500/10 text-cyan-400 border-cyan-800/50',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-800/50',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-800/50',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-800/50',
  };

  const card = (
    <div className={`group p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-4 transition-all duration-200 ${
      comingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-600 hover:bg-slate-800/50 cursor-pointer'
    }`}>
      <div className={`p-3 w-fit rounded-xl border ${colorMap[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-100">{label}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <div className="flex items-center justify-between">
        {comingSoon ? (
          <span className="text-xs text-slate-600 italic">Coming soon</span>
        ) : (
          <span className="text-xs text-slate-500 group-hover:text-primary-400 transition-colors">Open →</span>
        )}
      </div>
    </div>
  );

  if (comingSoon) return card;
  return <Link to={href}>{card}</Link>;
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-primary-500 text-lg">EquipRental Admin</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-900/50 text-primary-400 border border-primary-800 mr-2">
                {user?.role?.toUpperCase()}
              </span>
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-1.5">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-100">Admin Control Center</h1>
          <p className="text-slate-400 mt-1">
            Full operational visibility and control over the equipment rental platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <NavCard
            icon={Package}
            label="Equipment Inventory"
            description="Add, edit, and manage all rental equipment with images and pricing."
            href="/admin/equipment"
            color="accent"
          />
          <NavCard
            icon={ClipboardList}
            label="Rental Management"
            description="View and manage all bookings. Confirm, check out, and process returns."
            href="/admin/rentals"
            color="indigo"
          />
          <NavCard
            icon={Users}
            label="Customer Directory"
            description="Browse, search, edit, and manage all registered customer accounts."
            href="/admin/customers"
            color="emerald"
          />
          <NavCard
            icon={RotateCcw}
            label="Return Records"
            description="Review all equipment returns, damage reports, and deposit settlements."
            href="/admin/returns"
            color="primary"
          />
          <NavCard
            icon={DollarSign}
            label="Payment Ledger"
            description="Track advance payments, balances, refunds, and generate invoices."
            href="/admin/payments"
            color="emerald"
          />
          <NavCard
            icon={Wrench}
            label="Maintenance Logs"
            description="Track and manage equipment maintenance and service records."
            href="/admin/maintenance"
            color="yellow"
            comingSoon
          />
          <NavCard
            icon={BarChart3}
            label="Analytics & Revenue"
            description="View revenue trends, utilization rates, and business performance."
            href="/admin/analytics"
            color="primary"
            comingSoon
          />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
