import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Package, ClipboardList, ArrowRight, Calendar,
  CheckCircle, Clock, TrendingUp,
  Activity, Box, ChevronRight
} from 'lucide-react';
import { fetchRentals } from '../../services/rentalService';
import { fetchEquipment } from '../../services/equipmentService';
import RentalStatusBadge from '../../components/rental/RentalStatusBadge';
import Spinner from '../../components/ui/Spinner';

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

const StatCard = ({ icon: Icon, label, value, accent, numColor, isLoading }) => (
  <div className="relative overflow-hidden flex flex-col p-2.5 rounded-[16px] bg-slate-900 border border-slate-800 shadow-lg hover:shadow-xl hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 group">
    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${accent} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
    <div className="flex items-center gap-2 mb-1">
      <div className={`p-1.5 rounded-lg ${accent} shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight">{label}</p>
    </div>
    <div className="pl-0.5">
      {isLoading ? (
        <div className="h-6 w-16 bg-slate-800/80 rounded animate-pulse" />
      ) : (
        <p className={`text-xl font-extrabold tracking-tight ${numColor}`}>{value}</p>
      )}
    </div>
  </div>
);

const CustomerDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    availableEquip: 0,
    activeRentals: 0,
    pendingBookings: 0,
    completedRentals: 0
  });

  const [recentRentals, setRecentRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch unfiltered equipment to get count
        const equipRes = await fetchEquipment({ page: 1, limit: 1 });
        const availableEquip = equipRes.data.data.pagination.total || 0;

        // Fetch rentals for the user
        const rentalsRes = await fetchRentals({ page: 1, limit: 50 });
        const allRentals = rentalsRes.data.data.rentals || [];

        // Calculate stats
        const active = allRentals.filter(r => ['confirmed', 'checked_out'].includes(r.status)).length;
        const pending = allRentals.filter(r => r.status === 'pending').length;
        const completed = allRentals.filter(r => r.status === 'returned').length;

        setStats({
          availableEquip,
          activeRentals: active,
          pendingBookings: pending,
          completedRentals: completed
        });

        // Take top 5 for recent activity
        setRecentRentals(allRentals.slice(0, 5));

      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="py-6 px-4 sm:py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full space-y-8">

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <div className="relative rounded-[24px] overflow-hidden bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/30 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>

        <div className="relative z-10 w-full">
          <h1 className="text-3xl sm:text-4xl tracking-tight leading-tight">
            <span className="font-bold text-slate-300">Welcome back,</span> <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-800">{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-slate-400 text-[15px] sm:text-base mt-3 max-w-xl leading-relaxed">
            Manage your equipment rentals, browse the latest available inventory, and track your active bookings all in one highly functional space.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-800 text-white px-7 py-3.5 rounded-xl font-bold shadow-[0_4px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_4px_25px_rgba(234,88,12,0.5)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Package className="h-5 w-5" />
              New Booking
            </Link>
            <Link
              to="/my-rentals"
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 px-7 py-3.5 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
            >
              <ClipboardList className="h-5 w-5 text-slate-400" />
              View Rentals
            </Link>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Box}
          label="Available Equipment"
          value={stats.availableEquip}
          accent="bg-orange-600/15 text-orange-500 border border-orange-700/30"
          numColor="text-indigo-400"
          isLoading={isLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="Active Rentals"
          value={stats.activeRentals}
          accent="bg-blue-500/10 text-blue-400 border border-blue-800/30"
          numColor="text-pink-400"
          isLoading={isLoading}
        />
        <StatCard
          icon={Clock}
          label="Pending Bookings"
          value={stats.pendingBookings}
          accent="bg-amber-500/10 text-amber-400 border border-amber-800/30"
          numColor="text-teal-400"
          isLoading={isLoading}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completedRentals}
          accent="bg-emerald-500/10 text-emerald-400 border border-emerald-800/30"
          numColor="text-purple-400"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Recent Activity ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col relative bg-slate-900 border border-slate-800 rounded-[24px] shadow-xl overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/30 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-[60px] -translate-x-1/3 translate-y-1/3" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-30 mask-image:linear-gradient(to_bottom,white,transparent)]" />
          </div>

          <div className="p-6 relative z-10 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 shadow-inner">
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-xl tracking-tight">
                <span className="font-bold text-slate-300">Recent</span> <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">Activity</span>
              </h2>
            </div>
            <Link to="/my-rentals" className="text-sm font-bold text-orange-600 hover:text-orange-500 flex items-center gap-1 transition-colors group">
              View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex-1 p-0 relative z-10">
            {isLoading ? (
              <div className="flex justify-center items-center h-56">
                <Spinner className="h-8 w-8 text-orange-600" />
              </div>
            ) : recentRentals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 text-slate-500">
                <ClipboardList className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium text-slate-400">No recent activity found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {recentRentals.map(rental => (
                  <Link
                    key={rental._id}
                    to={`/my-rentals/${rental._id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-800/40 transition-colors group gap-4"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 shadow-sm relative">
                        {rental.equipment?.images?.[0] ? (
                          <img src={rental.equipment.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-slate-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-200 group-hover:text-orange-500 transition-colors truncate max-w-[200px] sm:max-w-xs">
                          {rental.equipment?.name || 'Unknown Equipment'}
                        </h4>
                        <div className="flex items-center gap-2.5 mt-1 text-[13px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-600" /> {fmt(rental.startDate)}</span>
                          <span>•</span>
                          <span className="text-slate-400">{fmtCurrency(rental.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <RentalStatusBadge status={rental.status} />
                      <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Action Cards ──────────────────────────────────────────── */}
        <div className="space-y-6">
          <Link
            to="/catalog"
            className="group block relative overflow-hidden rounded-[24px] bg-slate-900 border border-slate-800 hover:border-orange-600/50 shadow-lg hover:shadow-[0_8px_30px_rgba(234,88,12,0.15)] transition-all duration-300 hover:-translate-y-1"
          >
            {/* Background Gradients */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-amber-500/30 rounded-full blur-[60px]" />
              <div className="absolute -bottom-10 -left-10 w-[150px] h-[150px] bg-blue-500/5 rounded-full blur-[50px]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-30 mask-image:linear-gradient(to_bottom,white,transparent)]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
            
            <div className="p-8 relative z-10">
              <div className="p-4 w-fit rounded-2xl bg-orange-600/15 text-orange-500 border border-orange-700/40 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-inner">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="text-xl mb-2 tracking-tight">
                <span className="font-bold text-slate-300">Browse</span> <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">Catalog</span>
              </h3>
              <p className="text-[14px] text-slate-400 leading-relaxed mb-6 font-medium">
                Explore our extensive inventory of high-quality equipment available for your next project.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-orange-600 group-hover:text-orange-500 transition-colors">
                Start Exploring <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            to="/my-rentals"
            className="group block relative overflow-hidden rounded-[24px] bg-slate-900 border border-slate-800 hover:border-blue-500/50 shadow-lg hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-1"
          >
            {/* Background Gradients */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-amber-500/30 rounded-full blur-[60px]" />
              <div className="absolute -bottom-10 -left-10 w-[150px] h-[150px] bg-blue-500/5 rounded-full blur-[50px]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-30 mask-image:linear-gradient(to_bottom,white,transparent)]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

            <div className="p-8 relative z-10">
              <div className="p-4 w-fit rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-800/40 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-inner">
                <ClipboardList className="h-8 w-8" />
              </div>
              <h3 className="text-xl mb-2 tracking-tight">
                <span className="font-bold text-slate-300">My</span> <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Rentals</span>
              </h3>
              <p className="text-[14px] text-slate-400 leading-relaxed mb-6 font-medium">
                View your current bookings, track active rentals, and review past history.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-blue-500 group-hover:text-blue-400 transition-colors">
                Manage Bookings <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;
