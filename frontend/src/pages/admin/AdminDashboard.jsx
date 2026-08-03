import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Package, Users, ClipboardList, IndianRupee, RotateCcw,
  AlertTriangle, CheckCircle, Wrench, ArrowRight,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/dashboard/StatCard';
import { fetchDashboard } from '../../services/dashboardService';
import RentalStatusBadge from '../../components/rental/RentalStatusBadge';
import { motion } from 'framer-motion';

const fmtCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

// Chart colors — warm orange-forward palette on light background
const CHART_COLORS = {
  primary: '#d97706',   // amber-600
  emerald: '#059669',   // emerald-600 (readable on white)
  violet: '#7c3aed',   // violet-600
  amber: '#d97706',   // amber-600
  rose: '#e11d48',   // rose-600
  slate: '#6b7280',   // gray-500
};

const PIE_COLORS = ['#d97706', '#f97316', '#fb923c', '#fdba74', '#9ca3af'];

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-amber-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold text-gray-800">{prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { setLastUpdated: setHeaderLastUpdated } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetchDashboard();
      setData(res.data.data);
      const now = new Date();
      if (setHeaderLastUpdated) setHeaderLastUpdated(now);
    } catch {
      if (!silent) toast.error('Failed to load dashboard data.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [setHeaderLastUpdated]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 60000); // auto-refresh every minute
    return () => clearInterval(interval);
  }, [load]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#d8d9e0] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-500 text-sm mt-3">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const { stats, charts, recentActivity } = data || {};
  const { equipment = {}, customers = {}, rentals = {}, revenue = {}, returnsToday = 0 } = stats || {};

  return (
    <div className="min-h-screen bg-[#d8d9e0] text-gray-800">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 space-y-5">
        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#4558be] to-purple-500 drop-shadow-sm pb-1">Dashboard</h1>
            <p className="text-gray-500 text-xs mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          <StatCard
            label="Total Equipment"
            value={equipment.total || 0}
            icon={Package}
            iconColor="text-teal-600"
            iconBg="bg-teal-100 border-teal-200"
            sub={`${equipment.available || 0} available`}
          />
          <StatCard
            label="Rented Now"
            value={equipment.rented || 0}
            icon={Wrench}
            iconColor="text-violet-600"
            iconBg="bg-violet-100 border-violet-200"
            sub={`${equipment.maintenance || 0} in maintenance`}
          />
          <StatCard
            label="Customers"
            value={customers.total || 0}
            icon={Users}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100 border-emerald-200"
            sub="Active accounts"
          />
          <StatCard
            label="Active Rentals"
            value={rentals.active || 0}
            icon={ClipboardList}
            iconColor="text-amber-600"
            iconBg="bg-amber-100 border-amber-200"
            sub={`${rentals.total || 0} total all-time`}
          />
          <StatCard
            label="Revenue This Month"
            value={fmtCurrency(revenue.thisMonth)}
            icon={IndianRupee}
            iconColor="text-amber-600"
            iconBg="bg-amber-100 border-amber-200"
            trend={revenue.growthPercent}
            trendLabel={`vs ₹${(revenue.lastMonth || 0).toLocaleString()} last month`}
          />
          <StatCard
            label="Returns Today"
            value={returnsToday}
            icon={RotateCcw}
            iconColor="text-rose-600"
            iconBg="bg-rose-100 border-rose-200"
            sub={`Total revenue: ${fmtCurrency(revenue.total)}`}
          />
        </motion.div>

        {/* ── Equipment status mini-bar ────────────────────────────────────── */}
        {equipment.total > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-base font-bold text-gray-800">Equipment Utilization</p>
              <p className="text-[11px] text-gray-400">{equipment.total} total units</p>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
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
            <div className="flex flex-wrap gap-3 sm:gap-5 mt-2.5">
              {[
                { label: 'Available', val: equipment.available, color: 'bg-emerald-500' },
                { label: 'Rented', val: equipment.rented, color: 'bg-violet-500' },
                { label: 'Maintenance', val: equipment.maintenance, color: 'bg-amber-500' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${s.color}`} />
                  {s.label}: <span className="text-gray-700 font-medium">{s.val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Charts row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Revenue Trend — 2/3 width */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="xl:col-span-2 bg-white border border-amber-200 rounded-xl px-5 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">Revenue Trend</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Monthly inbound payments (12 months)</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-600 tracking-tight">{fmtCurrency(revenue.total)}</p>
                <p className="text-[11px] text-gray-400">All-time total</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={charts?.revenueTrend || []} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ fill: '#fff7ed' }} />
                <Bar dataKey="value" name="Revenue" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Rental Status Donut — 1/3 width */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="bg-white border border-amber-200 rounded-xl px-5 py-3 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-800">Rental Status</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Distribution across all rentals</p>
            </div>
            {(charts?.rentalStatusChart?.length || 0) === 0 ? (
              <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">No rental data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie
                      data={charts.rentalStatusChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
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
                        <span className="text-gray-500">{s.name}</span>
                      </div>
                      <span className="text-gray-700 font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* ── Second charts row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Rental Trend Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="bg-white border border-amber-200 rounded-xl px-5 py-3 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-800">Rental Volume</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">New rentals created per month</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={charts?.rentalTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Rentals"
                  stroke={CHART_COLORS.emerald}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS.emerald, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: CHART_COLORS.emerald, strokeWidth: 2, stroke: '#fff7ed' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Equipment by Category Bar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="bg-white border border-amber-200 rounded-xl px-5 py-3 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-800">Fleet by Category</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Equipment availability across categories</p>
            </div>
            {(charts?.categoryChart?.length || 0) === 0 ? (
              <div className="flex items-center justify-center h-[160px] text-gray-400 text-sm">No equipment data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={charts.categoryChart} layout="vertical" barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fff7ed' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#6b7280' }} />
                  <Bar dataKey="available" name="Available" fill={CHART_COLORS.emerald} radius={[0, 3, 3, 0]} stackId="a" />
                  <Bar dataKey="rented" name="Rented" fill={CHART_COLORS.violet} radius={[0, 3, 3, 0]} stackId="a" />
                  <Bar dataKey="maintenance" name="Maintenance" fill={CHART_COLORS.amber} radius={[0, 3, 3, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* ── Recent Activity ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Recent Rentals */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="xl:col-span-2 bg-white border border-amber-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">Recent Rentals</h3>
              <Link to="/admin/rentals" className="text-[11px] text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {(recentActivity?.rentals?.length || 0) === 0 ? (
              <p className="text-[13px] text-gray-400 text-center py-6">No rentals yet</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.rentals.map((r) => (
                  <Link
                    key={r._id}
                    to={`/admin/rentals/${r._id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-amber-50 transition-colors group"
                  >
                    <div className="h-8 w-10 rounded-lg bg-amber-100 overflow-hidden shrink-0">
                      {r.equipment?.images?.[0] ? (
                        <img src={r.equipment.images[0].url} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-700 truncate">{r.equipment?.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{r.customer?.name} · {fmtDate(r.createdAt)}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0">
                      <div className="scale-90 sm:scale-100 origin-right"><RentalStatusBadge status={r.status} /></div>
                      <span className="text-xs font-semibold text-amber-600">₹{r.totalAmount?.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Payments + Returns */}
          <div className="space-y-4">
            {/* Recent Payments */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 80, damping: 20 }}
              className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800">Recent Payments</h3>
                <Link to="/admin/payments" className="text-[11px] text-amber-600 hover:text-amber-700 font-medium">View all</Link>
              </div>
              {(recentActivity?.payments?.length || 0) === 0 ? (
                <p className="text-[13px] text-gray-400 text-center py-3">No payments yet</p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.payments.map((p) => (
                    <div key={p._id} className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-gray-700 capitalize leading-tight truncate">{p.paymentType?.replace('_', ' ')}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{p.customer?.name} · {fmtDate(p.paidAt)}</p>
                      </div>
                      <span className={`text-[13px] font-bold shrink-0 ${p.direction === 'outbound' ? 'text-red-500' : 'text-emerald-600'}`}>
                        {p.direction === 'outbound' ? '-' : '+'}₹{p.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Returns */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 20 }}
              className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800">Recent Returns</h3>
                <Link to="/admin/returns" className="text-[11px] text-amber-600 hover:text-amber-700 font-medium">View all</Link>
              </div>
              {(recentActivity?.returns?.length || 0) === 0 ? (
                <p className="text-[13px] text-gray-400 text-center py-3">No returns yet</p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.returns.map((r) => (
                    <div key={r._id} className="flex items-center gap-2.5">
                      <div className="h-6 w-7 rounded-lg bg-amber-100 overflow-hidden shrink-0">
                        {r.equipment?.images?.[0] ? (
                          <img src={r.equipment.images[0].url} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <RotateCcw className="h-3 w-3 text-amber-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-gray-700 truncate">{r.equipment?.name}</p>
                        <p className="text-[11px] text-gray-400">{r.customer?.name}</p>
                      </div>
                      {r.isDamaged ? (
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Quick Nav Cards ───────────────────────────────────────────────── */}
        <div>
          <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Quick Navigation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[
              { label: 'Equipment', href: '/admin/equipment', icon: Package, color: 'text-teal-600', bg: 'bg-white border-teal-200   hover:bg-teal-50' },
              { label: 'Rentals', href: '/admin/rentals', icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-white border-indigo-200 hover:bg-indigo-50' },
              { label: 'Returns', href: '/admin/returns', icon: RotateCcw, color: 'text-amber-600', bg: 'bg-white border-amber-300 hover:bg-amber-50' },
              { label: 'Payments', href: '/admin/payments', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-white border-emerald-200 hover:bg-emerald-50' },
              { label: 'Customers', href: '/admin/customers', icon: Users, color: 'text-violet-600', bg: 'bg-white border-violet-200 hover:bg-violet-50' },
            ].map((card) => (
              <Link
                key={card.href}
                to={card.href}
                className={`flex items-center gap-2.5 p-3 rounded-xl border shadow-sm ${card.bg} transition-all group`}
              >
                <card.icon className={`h-4 w-4 ${card.color} shrink-0`} />
                <span className="text-[13px] font-medium text-gray-600 group-hover:text-gray-800 transition-colors">{card.label}</span>
                <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-gray-600 ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-400 pt-12 pb-8 mt-16 mx-4 sm:mx-8 lg:mx-12 xl:mx-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔧</span>
              <span className="font-black text-gray-800 text-lg tracking-tight">RentAll Platform Admin</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your trusted partner for professional equipment rentals. Quality gear, reliable service, every time.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {['𝕏', 'in', 'f', '▶'].map((s, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-400 hover:border-amber-500/50 hover:bg-amber-50 text-gray-500 hover:text-amber-500 text-xs font-bold flex items-center justify-center transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-700 font-bold text-sm uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Dashboard', path: '/admin' },
                { label: 'Equipment', path: '/admin/equipment' },
                { label: 'Rentals', path: '/admin/rentals' },
                { label: 'Customers', path: '/admin/customers' }
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.path}
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-gray-500 hover:text-amber-500 text-sm font-medium transition-colors duration-200 text-left"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-700 font-bold text-sm uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li className="flex items-start gap-2"><span>📧</span> 73aveen@gmail.com</li>
              <li className="flex items-start gap-2"><span>📞</span> +91 9xxxxxxx</li>
              <li className="flex items-start gap-2"><span>📍</span> Bhopal, Madhya Pradesh, India</li>
              <li className="flex items-start gap-2"><span>🕐</span> Mon–Sat, 9 AM – 6 PM</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-700 font-bold text-sm uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Admin Policies', path: '/admin/policies' },
                { label: 'Security Overview', path: '/admin/security' },
                { label: 'API Documentation', path: '/admin/api' },
                { label: 'System Status', path: '/admin/status' }
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.path}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-gray-500 hover:text-amber-500 text-sm font-medium transition-colors duration-200 text-left"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-400 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} RentAll Platform Admin. All rights reserved.</span>
          <span className="flex items-center gap-1">Built with <span className="text-amber-500">♥</span> for professionals</span>
        </div>
      </footer>

    </div>
  );
};

export default AdminDashboard;
