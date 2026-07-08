import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Package, Users, ClipboardList, DollarSign, RotateCcw,
  TrendingUp, AlertTriangle, CheckCircle, Wrench, LogOut,
  ArrowRight, BarChart3,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/dashboard/StatCard';
import Button from '../../components/ui/Button';
import { fetchDashboard } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import RentalStatusBadge from '../../components/rental/RentalStatusBadge';

const fmtCurrency = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Tailwind-safe chart colors
const CHART_COLORS = {
  primary: '#3b82f6',
  emerald: '#10b981',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  slate: '#64748b',
};

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#6b7280'];

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold text-white">{prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetchDashboard();
      setData(res.data.data);
      setLastUpdated(new Date());
    } catch {
      if (!silent) toast.error('Failed to load dashboard data.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 60000); // auto-refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-slate-400 text-sm mt-3">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const { stats, charts, recentActivity } = data || {};
  const { equipment = {}, customers = {}, rentals = {}, revenue = {}, returnsToday = 0 } = stats || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top navigation bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary-900/30 border border-primary-800">
              <BarChart3 className="h-5 w-5 text-primary-400" />
            </div>
            <span className="font-bold text-slate-100">EquipRental</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-xs text-slate-600 hidden sm:block">
                Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <span className="text-sm text-slate-400 hidden sm:block">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-1.5">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Equipment', href: '/admin/equipment' },
              { label: 'Rentals', href: '/admin/rentals' },
              { label: 'Returns', href: '/admin/returns' },
              { label: 'Payments', href: '/admin/payments' },
              { label: 'Customers', href: '/admin/customers' },
            ].map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            label="Total Equipment"
            value={equipment.total || 0}
            icon={Package}
            iconColor="text-cyan-400"
            iconBg="bg-cyan-900/30 border-cyan-800/50"
            sub={`${equipment.available || 0} available`}
          />
          <StatCard
            label="Rented Now"
            value={equipment.rented || 0}
            icon={Wrench}
            iconColor="text-violet-400"
            iconBg="bg-violet-900/30 border-violet-800/50"
            sub={`${equipment.maintenance || 0} in maintenance`}
          />
          <StatCard
            label="Customers"
            value={customers.total || 0}
            icon={Users}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-900/30 border-emerald-800/50"
            sub="Active accounts"
          />
          <StatCard
            label="Active Rentals"
            value={rentals.active || 0}
            icon={ClipboardList}
            iconColor="text-amber-400"
            iconBg="bg-amber-900/30 border-amber-800/50"
            sub={`${rentals.total || 0} total all-time`}
          />
          <StatCard
            label="Revenue This Month"
            value={fmtCurrency(revenue.thisMonth)}
            icon={DollarSign}
            iconColor="text-primary-400"
            iconBg="bg-primary-900/30 border-primary-800/50"
            trend={revenue.growthPercent}
            trendLabel={`vs $${(revenue.lastMonth || 0).toLocaleString()} last month`}
          />
          <StatCard
            label="Returns Today"
            value={returnsToday}
            icon={RotateCcw}
            iconColor="text-rose-400"
            iconBg="bg-rose-900/30 border-rose-800/50"
            sub={`Total revenue: ${fmtCurrency(revenue.total)}`}
          />
        </div>

        {/* ── Equipment status mini-bar ────────────────────────────────────── */}
        {equipment.total > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-300">Equipment Utilization</p>
              <p className="text-xs text-slate-500">{equipment.total} total units</p>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {equipment.rented > 0 && (
                <div
                  className="bg-violet-500 transition-all"
                  style={{ width: `${(equipment.rented / equipment.total) * 100}%` }}
                  title={`Rented: ${equipment.rented}`}
                />
              )}
              {equipment.available > 0 && (
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(equipment.available / equipment.total) * 100}%` }}
                  title={`Available: ${equipment.available}`}
                />
              )}
              {equipment.maintenance > 0 && (
                <div
                  className="bg-amber-500 transition-all"
                  style={{ width: `${(equipment.maintenance / equipment.total) * 100}%` }}
                  title={`Maintenance: ${equipment.maintenance}`}
                />
              )}
            </div>
            <div className="flex gap-5 mt-2.5">
              {[
                { label: 'Available', val: equipment.available, color: 'bg-emerald-400' },
                { label: 'Rented', val: equipment.rented, color: 'bg-violet-400' },
                { label: 'Maintenance', val: equipment.maintenance, color: 'bg-amber-400' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className={`w-2 h-2 rounded-full ${s.color}`} />
                  {s.label}: <span className="text-slate-300 font-medium">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Charts row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Trend — 2/3 width */}
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Revenue Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monthly inbound payments (12 months)</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-400">{fmtCurrency(revenue.total)}</p>
                <p className="text-xs text-slate-500">All-time total</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts?.revenueTrend || []} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<CustomTooltip prefix="$" />} cursor={{ fill: '#1e293b' }} />
                <Bar dataKey="value" name="Revenue" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rental Status Donut — 1/3 width */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-200">Rental Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across all rentals</p>
            </div>
            {(charts?.rentalStatusChart?.length || 0) === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-slate-600 text-sm">No rental data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={charts.rentalStatusChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {charts.rentalStatusChart.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {charts.rentalStatusChart.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-400">{s.name}</span>
                      </div>
                      <span className="text-slate-300 font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Second charts row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Rental Trend Line Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-200">Rental Volume</h3>
              <p className="text-xs text-slate-500 mt-0.5">New rentals created per month</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts?.rentalTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Rentals"
                  stroke={CHART_COLORS.emerald}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS.emerald, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: CHART_COLORS.emerald, strokeWidth: 2, stroke: '#0f172a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Equipment by Category Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-200">Fleet by Category</h3>
              <p className="text-xs text-slate-500 mt-0.5">Equipment availability across categories</p>
            </div>
            {(charts?.categoryChart?.length || 0) === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-slate-600 text-sm">No equipment data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={charts.categoryChart} layout="vertical" barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                  <Bar dataKey="available" name="Available" fill={CHART_COLORS.emerald} radius={[0, 3, 3, 0]} stackId="a" />
                  <Bar dataKey="rented" name="Rented" fill={CHART_COLORS.violet} radius={[0, 3, 3, 0]} stackId="a" />
                  <Bar dataKey="maintenance" name="Maintenance" fill={CHART_COLORS.amber} radius={[0, 3, 3, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Recent Activity ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Rentals */}
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-200">Recent Rentals</h3>
              <Link to="/admin/rentals" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {(recentActivity?.rentals?.length || 0) === 0 ? (
              <p className="text-sm text-slate-600 text-center py-8">No rentals yet</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.rentals.map((r) => (
                  <Link
                    key={r._id}
                    to={`/admin/rentals/${r._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/60 transition-colors group"
                  >
                    <div className="h-9 w-11 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                      {r.equipment?.images?.[0] ? (
                        <img src={r.equipment.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{r.equipment?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{r.customer?.name} · {fmtDate(r.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RentalStatusBadge status={r.status} />
                      <span className="text-xs font-semibold text-primary-400">${r.totalAmount?.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payments + Returns */}
          <div className="space-y-5">
            {/* Recent Payments */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200">Recent Payments</h3>
                <Link to="/admin/payments" className="text-xs text-primary-400 hover:text-primary-300">View all</Link>
              </div>
              {(recentActivity?.payments?.length || 0) === 0 ? (
                <p className="text-sm text-slate-600 text-center py-4">No payments yet</p>
              ) : (
                <div className="space-y-2.5">
                  {recentActivity.payments.map((p) => (
                    <div key={p._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300 capitalize">{p.paymentType?.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-600">{p.customer?.name} · {fmtDate(p.paidAt)}</p>
                      </div>
                      <span className={`text-sm font-bold ${p.direction === 'outbound' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {p.direction === 'outbound' ? '-' : '+'}${p.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Returns */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200">Recent Returns</h3>
                <Link to="/admin/returns" className="text-xs text-primary-400 hover:text-primary-300">View all</Link>
              </div>
              {(recentActivity?.returns?.length || 0) === 0 ? (
                <p className="text-sm text-slate-600 text-center py-4">No returns yet</p>
              ) : (
                <div className="space-y-2.5">
                  {recentActivity.returns.map((r) => (
                    <div key={r._id} className="flex items-center gap-2.5">
                      <div className="h-7 w-8 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                        {r.equipment?.images?.[0] ? (
                          <img src={r.equipment.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <RotateCcw className="h-3 w-3 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-300 truncate">{r.equipment?.name}</p>
                        <p className="text-xs text-slate-600">{r.customer?.name}</p>
                      </div>
                      {r.isDamaged ? (
                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Nav Cards ───────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Equipment', href: '/admin/equipment', icon: Package, color: 'text-cyan-400', bg: 'bg-cyan-900/20 border-cyan-900' },
              { label: 'Rentals', href: '/admin/rentals', icon: ClipboardList, color: 'text-indigo-400', bg: 'bg-indigo-900/20 border-indigo-900' },
              { label: 'Returns', href: '/admin/returns', icon: RotateCcw, color: 'text-primary-400', bg: 'bg-primary-900/20 border-primary-900' },
              { label: 'Payments', href: '/admin/payments', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-900' },
              { label: 'Customers', href: '/admin/customers', icon: Users, color: 'text-violet-400', bg: 'bg-violet-900/20 border-violet-900' },
            ].map((card) => (
              <Link
                key={card.href}
                to={card.href}
                className={`flex items-center gap-3 p-4 rounded-xl border ${card.bg} hover:bg-slate-800/50 transition-all group`}
              >
                <card.icon className={`h-5 w-5 ${card.color} shrink-0`} />
                <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">{card.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
