import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Users, Package, Wrench, LogOut } from 'lucide-react';
import Button from '../../components/ui/Button';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
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
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-2">Admin Control Center</h1>
        <p className="text-slate-400 mb-10">
          Full operational visibility and control over the equipment rental platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: BarChart3, label: 'Analytics & Revenue', color: 'primary', phase: 6 },
            { icon: Package, label: 'Inventory Manager', color: 'accent', phase: 3 },
            { icon: Users, label: 'User Directory', color: 'emerald', phase: 7 },
            { icon: Wrench, label: 'Maintenance Logs', color: 'yellow', phase: 5 },
          ].map(({ icon: Icon, label, color, phase }) => (
            <div key={label} className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <div className={`p-2.5 w-fit rounded-lg bg-${color}-500/10 text-${color}-400 mb-4`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{label}</h3>
              <p className="text-xs text-slate-600 mt-3 italic">Available in Phase {phase}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
