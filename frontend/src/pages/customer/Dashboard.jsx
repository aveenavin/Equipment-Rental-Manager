import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Package, ClipboardList, ArrowRight, Calendar,
  CheckCircle, Clock, TrendingUp,
  Activity, Box, ChevronRight
} from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { fetchRentals } from '../../services/rentalService';
import { fetchEquipment } from '../../services/equipmentService';
import RentalStatusBadge from '../../components/rental/RentalStatusBadge';
import Spinner from '../../components/ui/Spinner';

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

const CountUp = ({ to }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(count, to, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [count, to]);

  return <motion.span>{rounded}</motion.span>;
};

const StatCard = ({ icon: Icon, label, value, gradient, shadowColor: _shadowColor, index: _index = 0, isLoading = false }) => (
  <div
    className={`relative overflow-hidden flex items-center p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl transition-all duration-300`}
  >
    {/* Decorative inner glass effect */}
    <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-300" />
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl transition-colors duration-500" />

    <div className="p-3 rounded-xl bg-black/10 shrink-0 shadow-inner mr-4 relative z-10 backdrop-blur-sm transition-all duration-300">
      <Icon className="h-5 w-5 text-white" />
    </div>

    <div className="flex flex-col relative z-10">
      <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider leading-tight mb-1">{label}</p>
      {isLoading ? (
        <div className="h-6 w-16 bg-white/20 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-black tracking-tight text-white drop-shadow-sm leading-none">
          <CountUp to={value || 0} />
        </p>
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

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        className="relative rounded-[24px] overflow-hidden bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8"
      >
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/30 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>

        <div className="relative z-10 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 80, damping: 20 }}
            className="text-3xl sm:text-4xl tracking-tight leading-tight"
          >
            <span className="font-bold text-slate-300">Welcome back,</span> <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-800">{user?.name?.split(' ')[0] || 'User'}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, type: 'spring', stiffness: 80, damping: 20 }}
            className="text-slate-400 text-[15px] sm:text-base mt-3 max-w-xl leading-relaxed"
          >
            Manage your equipment rentals, browse the latest available inventory, and track your active bookings all in one highly functional space.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, type: 'spring', stiffness: 80, damping: 20 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
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
          </motion.div>
        </div>
      </motion.div>

      {/* ── Summary Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Box}
          label="Available Equipment"
          value={stats.availableEquip}
          gradient="from-orange-500 to-amber-500"
          shadowColor="shadow-[0_8px_25px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_35px_rgba(249,115,22,0.4)]"
          isLoading={isLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="Active Rentals"
          value={stats.activeRentals}
          gradient="from-blue-500 to-indigo-500"
          shadowColor="shadow-[0_8px_25px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_35px_rgba(59,130,246,0.4)]"
          isLoading={isLoading}
        />
        <StatCard
          icon={Clock}
          label="Pending Bookings"
          value={stats.pendingBookings}
          gradient="from-purple-500 to-fuchsia-500"
          shadowColor="shadow-[0_8px_25px_rgba(168,85,247,0.3)] hover:shadow-[0_12px_35px_rgba(168,85,247,0.4)]"
          isLoading={isLoading}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completedRentals}
          gradient="from-emerald-500 to-teal-500"
          shadowColor="shadow-[0_8px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_35px_rgba(16,185,129,0.4)]"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Recent Activity ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 80, damping: 20 }}
          className="lg:col-span-2 flex flex-col relative bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-900 border border-blue-500/20 rounded-[24px] shadow-2xl overflow-hidden group/panel"
        >
          {/* Subtle inner background glows */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

          <div className="p-6 relative z-10 border-b border-blue-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-inner">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-xl tracking-tight">
                <span className="font-bold text-slate-300">Recent</span> <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Activity</span>
              </h2>
            </div>
            <Link to="/my-rentals" className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors group">
              View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 p-0 relative z-10">
            {isLoading ? (
              <div className="flex justify-center items-center h-56">
                <Spinner className="h-8 w-8 text-blue-500" />
              </div>
            ) : recentRentals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 text-slate-500">
                <ClipboardList className="h-12 w-12 mb-4 opacity-30" />
                <p className="font-medium text-slate-400">No recent activity found.</p>
              </div>
            ) : (
              <div className="divide-y divide-blue-500/10">
                {recentRentals.map(rental => (
                  <Link
                    key={rental._id}
                    to={`/my-rentals/${rental._id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-blue-500/5 transition-colors group gap-4"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-xl bg-slate-950 border border-blue-500/20 overflow-hidden shrink-0 relative group-hover:border-blue-500/50 transition-colors duration-300">
                        {rental.equipment?.images?.[0] ? (
                          <img src={rental.equipment.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[15.5px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 group-hover:from-neutral-800 group-hover:to-neutral-800 transition-all duration-300 truncate max-w-[200px] sm:max-w-xs drop-shadow-sm">
                          {rental.equipment?.name || 'Unknown Equipment'}
                        </h4>
                        <div className="flex items-center gap-2.5 mt-1.5 text-[13px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-500" /> {fmt(rental.startDate)}</span>
                          <span>•</span>
                          <span className="text-yellow-400 font-bold tracking-wide">{fmtCurrency(rental.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <RentalStatusBadge status={rental.status} />
                      <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Quick Action Cards ──────────────────────────────────────────── */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 20 }}
          >
            <Link
              to="/catalog"
              className="group block relative overflow-hidden rounded-[24px] bg-white/[0.02] backdrop-blur-3xl border border-white/10 hover:border-white/20 shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Background Aurora Gradients */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-[300px] h-[300px] bg-orange-600/20 rounded-full blur-[80px] group-hover:bg-orange-500/30 transition-colors duration-500" />
                <div className="absolute -bottom-10 -left-10 w-[250px] h-[250px] bg-rose-600/10 rounded-full blur-[70px] group-hover:bg-rose-500/20 transition-colors duration-500" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-40 mask-image:linear-gradient(to_bottom,white,transparent)]" />
              </div>

              <div className="p-8 relative z-10">
                <div className="p-4 w-fit rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-6 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-orange-500/20 transition-all duration-300 shadow-inner backdrop-blur-md">
                  <Package className="h-8 w-8" />
                </div>
                <h3 className="text-xl mb-2 tracking-tight">
                  <span className="font-bold text-slate-300">Browse</span> <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Catalog</span>
                </h3>
                <p className="text-[14px] text-slate-400 leading-relaxed mb-6 font-medium">
                  Explore our extensive inventory of high-quality equipment available for your next project.
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                  Start Exploring <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 80, damping: 20 }}
          >
            <Link
              to="/my-rentals"
              className="group block relative overflow-hidden rounded-[24px] bg-white/[0.02] backdrop-blur-3xl border border-white/10 hover:border-white/20 shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Background Aurora Gradients */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-500/30 transition-colors duration-500" />
                <div className="absolute -bottom-10 -left-10 w-[250px] h-[250px] bg-indigo-600/10 rounded-full blur-[70px] group-hover:bg-indigo-500/20 transition-colors duration-500" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-40 mask-image:linear-gradient(to_bottom,white,transparent)]" />
              </div>

              <div className="p-8 relative z-10">
                <div className="p-4 w-fit rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-blue-500/20 transition-all duration-300 shadow-inner backdrop-blur-md">
                  <ClipboardList className="h-8 w-8" />
                </div>
                <h3 className="text-xl mb-2 tracking-tight">
                  <span className="font-bold text-slate-300">My</span> <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Rentals</span>
                </h3>
                <p className="text-[14px] text-slate-400 leading-relaxed mb-6 font-medium">
                  View your current bookings, track active rentals, and review past history.
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                  Manage Bookings <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-300/20 pt-12 pb-8 mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔧</span>
              <span className="font-black text-slate-100 text-lg tracking-tight">EquipRental</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your trusted partner for professional equipment rentals. Quality gear, reliable service, every time.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {['𝕏', 'in', 'f', '▶'].map((s, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-700 text-slate-400 hover:text-orange-400 text-xs font-bold flex items-center justify-center transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-200 font-bold text-sm uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Catalog', path: '/catalog' },
                { label: 'My Rentals', path: '/my-rentals' },
                { label: 'Dashboard', path: '/dashboard' }
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.path}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-slate-500 hover:text-orange-400 text-sm font-medium transition-colors duration-200 text-left"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-slate-200 font-bold text-sm uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li className="flex items-start gap-2"><span>📧</span> 73aveen@gmail.com</li>
              <li className="flex items-start gap-2"><span>📞</span> +91 9xxxxxxx</li>
              <li className="flex items-start gap-2"><span>📍</span> Bhopal, Madhya Pradesh, India</li>
              <li className="flex items-start gap-2"><span>🕐</span> Mon–Sat, 9 AM – 6 PM</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-slate-200 font-bold text-sm uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Refund Policy', path: '/refund' },
                { label: 'Cookie Policy', path: '/cookie' }
              ].map((l) => (
                <li key={l.label}>
                  <Link 
                    to={l.path}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-slate-500 hover:text-orange-400 text-sm font-medium transition-colors duration-200 text-left"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-300/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} EquipRental. All rights reserved.</span>
          <span className="flex items-center gap-1">Built with <span className="text-orange-500">♥</span> for professionals</span>
        </div>
      </footer>

    </div>
  );
};

export default CustomerDashboard;
