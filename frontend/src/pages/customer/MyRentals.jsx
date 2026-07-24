import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Calendar, Package, XCircle, FileText,
  ArrowRight, DollarSign, Clock, Truck, RotateCcw,
  CheckCircle, AlertCircle, ShoppingBag, TrendingUp,
  Shield, ExternalLink,
} from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import Button from '../../components/ui/Button';
import RentalStatusBadge from '../../components/rental/RentalStatusBadge';
import { fetchRentals, cancelRental } from '../../services/rentalService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

// ─── Status filter config ────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: '', label: 'All', icon: ShoppingBag },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { value: 'checked_out', label: 'Checked Out', icon: Truck },
  { value: 'returned', label: 'Returned', icon: RotateCcw },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
];

// ─── Status-specific accent colour for left border on cards ─────────────────
const STATUS_BORDER = {
  pending: 'border-l-amber-400',
  confirmed: 'border-l-blue-400',
  checked_out: 'border-l-violet-400',
  returned: 'border-l-emerald-400',
  cancelled: 'border-l-slate-600',
};

// ─── Stat summary card ───────────────────────────────────────────────────────
const CountUp = ({ to, isCurrency = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    isCurrency ? fmtCurrency(latest) : Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, to, { duration: 1.5, ease: "easeOut" });
      return controls.stop;
    }
  }, [count, to, isInView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

const StatCard = ({ icon: Icon, label, value, bg, borderColor, iconColor, index = 0, isCurrency = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ delay: index * 0.15, type: 'spring', stiffness: 80, damping: 20 }}
    className={`relative overflow-hidden flex items-center p-4 rounded-2xl bg-gradient-to-br ${bg} border ${borderColor} shadow-lg hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 group`}
  >
    {/* Decorative inner glass effect */}
    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500" />

    <div className={`p-3 rounded-xl bg-slate-900/50 shrink-0 border ${borderColor} shadow-inner mr-4 relative z-10 backdrop-blur-sm group-hover:bg-slate-900/80 transition-all duration-300`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>

    <div className="flex flex-col relative z-10">
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-tight mb-1">{label}</p>
      <p className="text-2xl font-black tracking-tight text-black/70 drop-shadow-sm leading-none">
        <CountUp to={value} isCurrency={isCurrency} />
      </p>
    </div>
  </motion.div>
);

// ─── Timeline step ───────────────────────────────────────────────────────────
const TimelineStep = ({ icon: Icon, label, date, active, done }) => (
  <div className={`relative flex flex-col items-center gap-2 z-10 w-20 ${active ? 'opacity-100' : done ? 'opacity-100' : 'opacity-80 grayscale'}`}>
    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${active ? 'bg-orange-500 border-orange-200 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-110'
      : done ? 'bg-slate-800 border-orange-500/80 text-orange-400 shadow-sm'
        : 'bg-slate-900 border-slate-700 text-slate-500'
      }`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex flex-col items-center justify-start min-h-[36px]">
      <p className={`text-[11px] font-bold text-center leading-tight tracking-wide uppercase mt-1 ${active ? 'text-orange-400' : done ? 'text-slate-300' : 'text-slate-400'}`}>
        {label}
      </p>
      {date && <p className="text-[10px] text-slate-500 text-center font-medium mt-0.5">{fmt(date)}</p>}
    </div>
  </div>
);

// ─── Timeline connector ──────────────────────────────────────────────────────
const Connector = ({ active, done }) => (
  <div className="flex-1 h-[2px] mt-4 -mx-2 z-0 bg-slate-800 rounded-full overflow-hidden">
    <div className={`h-full transition-all duration-500 bg-orange-500/80 ${active || done ? 'w-full' : 'w-0'}`} />
  </div>
);

// ─── Rental status timeline ──────────────────────────────────────────────────
const RentalTimeline = ({ rental }) => {
  const s = rental.status;
  const steps = [
    { key: 'pending', icon: Clock, label: 'Booked', date: rental.createdAt },
    { key: 'confirmed', icon: CheckCircle, label: 'Confirmed', date: rental.confirmedAt },
    { key: 'checked_out', icon: Truck, label: 'Active', date: rental.checkedOutAt },
    { key: 'returned', icon: RotateCcw, label: 'Returned', date: rental.returnedAt },
  ];

  const ORDER = ['pending', 'confirmed', 'checked_out', 'returned', 'cancelled'];
  const currentIdx = ORDER.indexOf(s);

  return (
    <div className="flex items-start justify-between w-full mt-3">
      {steps.map((step, i) => {
        const stepIdx = ORDER.indexOf(step.key);
        const isDone = stepIdx < currentIdx && s !== 'cancelled';
        const isActive = step.key === s;
        return (
          <React.Fragment key={step.key}>
            <TimelineStep
              icon={step.icon}
              label={step.label}
              date={isDone || isActive ? step.date : null}
              active={isActive}
              done={isDone}
            />
            {i < steps.length - 1 && <Connector active={isActive} done={isDone} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Individual rental card ──────────────────────────────────────────────────
const RentalCard = ({ rental, onCancel }) => {
  const borderColor = STATUS_BORDER[rental.status] || 'border-l-slate-600';

  return (
    <div className={`group relative bg-gradient-to-b from-yellow-50 to-white border border-slate-800 border-l-4 ${borderColor} rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-600 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5`}>
      {/* Ambient glow - left image side only */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[270px] h-[120px] bg-yellow-400/15 blur-[40px]" />
        <div className="absolute bottom-0 left-0 w-[270px] h-[120px] bg-yellow-400/15 blur-[40px]" />
      </div>
      <div className="flex flex-col md:flex-row h-full relative z-10">

        {/* ── Equipment preview area ──────────────────────────────────────── */}
        <div className="md:w-[270px] p-4 pr-2 sm:p-5 sm:pr-3 border-b md:border-b-0 md:border-r border-slate-800/60 flex flex-col justify-center bg-slate-900/30 shrink-0">
          <div className="relative w-full flex-1 my-1 sm:my-1.5 min-h-[150px] rounded-xl overflow-hidden shadow-lg shadow-black/30 border border-slate-700/50">
            {rental.equipment?.images?.[0] ? (
              <img
                src={rental.equipment.images[0].url}
                alt={rental.equipment?.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <Package className="h-8 w-8 text-slate-600" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-sm">
                {rental.equipment?.category?.replace(/-/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 p-4 pl-2 sm:p-5 sm:pl-3">

          {/* Top row: badge + details */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="text-[24px] font-semibold text-slate-200 tracking-tight leading-snug line-clamp-1 mb-1.5">
                {rental.equipment?.name}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-400">
                  Booking <span className="text-slate-300">#{rental._id.slice(-8).toUpperCase()}</span>
                </p>
                <span className="h-1 w-1 rounded-full bg-slate-600" />
                <p className="text-sm text-slate-500">
                  Placed on {fmt(rental.createdAt)}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <RentalStatusBadge status={rental.status} />
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 bg-slate-950/50 rounded-xl p-3 border border-slate-800/60 shadow-inner">
            {/* Dates */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Rental Period</span>
              </div>
              <p className="font-semibold text-slate-200 text-sm">{fmt(rental.startDate)}</p>
              <p className="text-slate-500 text-[13px]">to {fmt(rental.endDate)}</p>
            </div>

            {/* Duration */}
            <div className="flex flex-col sm:border-l sm:border-slate-800 sm:pl-3">
              <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                <Clock className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
              </div>
              <p className="font-semibold text-slate-200 text-sm">
                {rental.totalDays} day{rental.totalDays !== 1 ? 's' : ''}
              </p>
              <p className="text-slate-500 text-[13px]">{fmtCurrency(rental.dailyRate)} / day</p>
            </div>

            {/* Amount */}
            <div className="flex flex-col sm:border-l sm:border-slate-800 sm:pl-3">
              <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                <DollarSign className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Amount</span>
              </div>
              <p className="font-bold text-orange-400 text-lg leading-tight">{fmtCurrency(rental.totalAmount)}</p>
              <p className="text-slate-500 text-xs mt-0.5">Deposit: {fmtCurrency(rental.securityDeposit)}</p>
            </div>
          </div>

          {/* Timeline and Actions row */}
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left side: Timeline or Cancelled notice */}
            <div className="flex-1 min-w-0 md:pr-10 md:border-r md:border-slate-700">
              {rental.status !== 'cancelled' ? (
                <RentalTimeline rental={rental} />
              ) : (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 w-full">
                  <AlertCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-300">
                    This booking was cancelled
                    {rental.cancelledAt && <span className="text-slate-200 font-semibold"> on {fmt(rental.cancelledAt)}</span>}.
                  </p>
                </div>
              )}
            </div>

            {/* Right side: Action buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-3 shrink-0 md:w-[300px]">
              {rental.status === 'pending' && (
                <button
                  onClick={() => onCancel(rental)}
                  className="flex items-center justify-center gap-2 text-[13.5px] font-semibold text-slate-400 hover:text-red-400 transition-colors w-full px-4 py-3 rounded-xl hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30"
                >
                  <XCircle className="h-4.5 w-4.5 shrink-0" />
                  Cancel
                </button>
              )}
              <Link
                to={`/my-rentals/${rental._id}`}
                className="flex items-center justify-center gap-2 text-[13.5px] font-semibold text-blue-500 bg-slate-800 hover:bg-slate-700 transition-all duration-200 w-full px-4 py-3 rounded-xl border border-slate-700 hover:border-slate-500 shadow-md group/link"
              >
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover/link:text-orange-400 transition-colors shrink-0" />
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Loading skeleton ────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
    <div className="flex flex-col md:flex-row h-full">
      <div className="md:w-56 h-48 md:h-auto bg-slate-800/80 shrink-0" />
      <div className="flex-1 p-5 sm:p-6 space-y-5">
        <div className="flex justify-between">
          <div className="space-y-2 w-1/2">
            <div className="h-6 bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
          </div>
          <div className="h-6 bg-slate-800 rounded-full w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="h-16 bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-800 rounded-xl" />
        </div>
        <div className="flex justify-end pt-4">
          <div className="h-10 bg-slate-800 rounded-xl w-36" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Main page component ─────────────────────────────────────────────────────

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [allRentals, setAllRentals] = useState([]); // for stat cards (unfiltered)
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch filtered list
  const loadRentals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchRentals({ page, limit: 10, status: statusFilter });
      setRentals(res.data.data.rentals);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load rentals.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  // Fetch unfiltered summary for stat cards (once on mount)
  useEffect(() => {
    fetchRentals({ page: 1, limit: 100 })
      .then((res) => setAllRentals(res.data.data.rentals))
      .catch(() => { });
  }, []);

  useEffect(() => { loadRentals(); }, [loadRentals]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await cancelRental(cancelTarget._id);
      toast.success('Rental cancelled.');
      setCancelTarget(null);
      loadRentals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Derive stat counts from unfiltered list
  const active = allRentals.filter((r) => ['pending', 'confirmed', 'checked_out'].includes(r.status)).length;
  const returned = allRentals.filter((r) => r.status === 'returned').length;
  const totalSpend = allRentals
    .filter((r) => r.status !== 'cancelled')
    .reduce((s, r) => s + (r.rentalCost || 0), 0);

  return (
    <div className="py-6 px-4 sm:py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-800/60">
        <div>
          <h1 className="text-3xl sm:text-4xl tracking-tight drop-shadow-sm pb-1">
            <span className="font-extrabold text-slate-100">My</span> <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Rentals</span>
          </h1>
          <p className="text-slate-400 font-medium text-[15px] mt-2 max-w-xl leading-relaxed">
            Track and manage all your equipment bookings. View status, details, and history in one place.
          </p>
        </div>
        <Link to="/catalog">
          <Button variant="primary" size="lg" className="flex items-center gap-2 shrink-0 rounded-xl shadow-lg shadow-orange-500/20 px-6">
            <Package className="h-5 w-5" />
            Browse Catalog
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          index={0}
          icon={ShoppingBag}
          label="Total Bookings"
          value={allRentals.length}
          bg="from-orange-900/40 via-slate-900 to-slate-900"
          borderColor="border-orange-500/20"
          iconColor="text-orange-400"
        />
        <StatCard
          index={1}
          icon={TrendingUp}
          label="Active"
          value={active}
          bg="from-blue-900/40 via-slate-900 to-slate-900"
          borderColor="border-blue-500/20"
          iconColor="text-blue-400"
        />
        <StatCard
          index={2}
          icon={CheckCircle}
          label="Completed"
          value={returned}
          bg="from-emerald-900/40 via-slate-900 to-slate-900"
          borderColor="border-emerald-500/20"
          iconColor="text-emerald-400"
        />
        <StatCard
          index={3}
          icon={DollarSign}
          label="Total Spend"
          value={totalSpend}
          isCurrency={true}
          bg="from-purple-900/40 via-slate-900 to-slate-900"
          borderColor="border-purple-500/20"
          iconColor="text-purple-400"
        />
      </div>

      {/* ── Status filter pills ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl mb-8 shadow-inner w-fit">
        {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 group ${statusFilter === value
              ? 'text-orange-50 bg-orange-500 shadow-[0_2px_10px_rgba(249,115,22,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
          >
            <Icon className={`h-4 w-4 transition-colors ${statusFilter === value ? 'text-orange-200' : 'text-slate-500 group-hover:text-slate-400'}`} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Results count ────────────────────────────────────────────────── */}
      <p className="text-[13px] text-slate-500 mb-5 font-medium tracking-wide uppercase">
        {isLoading ? 'Loading Rentals…' : `${pagination.total} rental${pagination.total !== 1 ? 's' : ''} found`}
        {statusFilter && ` · Filtered by "${STATUS_FILTERS.find(s => s.value === statusFilter)?.label}"`}
      </p>

      {/* ── Rental cards / states ─────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : rentals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-slate-900/40 rounded-3xl border border-slate-800/50 border-dashed mb-10">
          <div className="relative mb-8 group">
            <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-3xl scale-[2.5] group-hover:bg-orange-500/20 transition-colors duration-700" />
            <div className="relative p-6 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl">
              <FileText className="h-14 w-14 text-slate-500" />
            </div>
          </div>
          <p className="text-slate-100 font-extrabold text-2xl tracking-tight">
            {statusFilter ? 'No rentals found' : 'No bookings yet'}
          </p>
          <p className="text-slate-400 text-[15px] mt-3 max-w-md mx-auto leading-relaxed">
            {statusFilter
              ? `You don't have any ${STATUS_FILTERS.find(s => s.value === statusFilter)?.label.toLowerCase()} rentals.`
              : 'Start by browsing our equipment catalog and make your first booking to see it here.'}
          </p>
          {!statusFilter && (
            <Link to="/catalog" className="mt-8">
              <Button variant="primary" size="lg" className="flex items-center gap-2 rounded-xl shadow-lg shadow-orange-500/20 px-8 py-3">
                <Package className="h-5 w-5" /> Browse Equipment
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {rentals.map((rental) => (
            <RentalCard
              key={rental._id}
              rental={rental}
              onCancel={setCancelTarget}
            />
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-800/60">
              <p className="text-[13px] text-slate-500 font-medium">
                Showing page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg shadow-sm"
                >
                  Previous
                </Button>
                {/* Page number buttons */}
                <div className="hidden sm:flex items-center gap-1.5 px-2">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 text-[13px] font-bold rounded-lg transition-all duration-200 ${p === page
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-105'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg shadow-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* End of list indicator */}
          {page >= pagination.pages && (
            <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-3">
              <div className="flex items-center gap-3 w-full max-w-sm">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                  No more bookings
                </span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <p className="text-xs text-slate-600">
                Showing all {pagination.total} booking{pagination.total !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Cancel confirmation modal ─────────────────────────────────────── */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden transform scale-100 transition-transform">
            {/* Modal header accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-400" />
            <div className="p-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 shrink-0 shadow-inner">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-50 text-xl tracking-tight">Cancel Booking</h3>
                  <p className="text-sm text-slate-400 mt-1">This action cannot be undone.</p>
                </div>
              </div>

              {/* Equipment preview in modal */}
              {cancelTarget.equipment && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 mb-6 shadow-sm">
                  <div className="h-16 w-16 rounded-xl bg-slate-700 overflow-hidden shrink-0 shadow-inner relative">
                    {cancelTarget.equipment?.images?.[0] ? (
                      <img
                        src={cancelTarget.equipment.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-200 truncate leading-tight">
                      {cancelTarget.equipment?.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {fmt(cancelTarget.startDate)} — {fmt(cancelTarget.endDate)}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-7">
                <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200/90 leading-relaxed font-medium">
                  Cancelling will remove this booking. If a deposit was paid, please contact support for a refund.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setCancelTarget(null)}
                  disabled={isCancelling}
                  className="rounded-xl"
                >
                  Keep Booking
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  isLoading={isCancelling}
                  onClick={handleCancel}
                  className="rounded-xl shadow-lg shadow-red-500/20"
                >
                  Yes, Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRentals;
