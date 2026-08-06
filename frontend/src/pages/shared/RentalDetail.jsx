import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, Calendar, DollarSign, User,
  CheckCircle, Truck, RotateCcw, ChevronDown, ExternalLink,
  FileText, PlusCircle, ArrowDownLeft, ArrowUpRight, Clock, MapPin, Hash, ShieldCheck, Mail, Phone, CreditCard, Home
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import RentalStatusBadge from '../../components/rental/RentalStatusBadge';
import ProcessReturnModal from '../../components/rental/ProcessReturnModal';
import RecordPaymentModal from '../../components/payment/RecordPaymentModal';
import { fetchRentalById, updateRentalStatus, cancelRental } from '../../services/rentalService';
import { fetchPaymentsByRental } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const fmtTime = (d) =>
  d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_TRANSITIONS = {
  pending: { label: 'Confirm Booking', nextStatus: 'confirmed', icon: CheckCircle, variant: 'primary', color: 'from-blue-500 to-indigo-500' },
  confirmed: { label: 'Mark Checked Out', nextStatus: 'checked_out', icon: Truck, variant: 'primary', color: 'from-amber-500 to-orange-500' },
};

const InfoRow = ({ label, value, icon: Icon, valueClass = "text-slate-200" }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0 group">
    <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-300 transition-colors">
      {Icon && <div className="p-1 rounded-lg bg-slate-800"><Icon className="h-4 w-4 text-primary-400" /></div>}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className={`text-sm font-semibold text-right ${valueClass}`}>{value}</span>
  </div>
);

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-xl relative overflow-hidden ${className}`}
  >
    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
      <Icon className="w-16 h-16 sm:w-24 sm:h-24" />
    </div>
    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 relative z-10">
      <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30">
        <Icon className="h-4 w-4 text-primary-400" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">{title}</h3>
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </motion.div>
);

const RentalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isStaff } = useAuth();
  const isCustomer = user?.role === 'customer';
  const canManage = isAdmin || isStaff;

  const [rental, setRental] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelAdmin, setShowCancelAdmin] = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ payments: [], summary: null });
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const backPath = isCustomer ? '/my-rentals' : '/admin/rentals';

  const loadRental = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchRentalById(id);
      setRental(res.data.data.rental);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rental not found.');
      navigate(backPath);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, backPath]);

  const loadPayments = useCallback(async () => {
    if (!id) return;
    setPaymentsLoading(true);
    try {
      const res = await fetchPaymentsByRental(id);
      setPaymentData({ payments: res.data.data.payments, summary: res.data.data.summary });
    } catch {
      // Payments may not exist yet
    } finally {
      setPaymentsLoading(false);
    }
  }, [id]);

  useEffect(() => { loadRental(); }, [loadRental]);
  useEffect(() => { loadPayments(); }, [loadPayments]);

  const handleStatusUpdate = async (nextStatus) => {
    setIsUpdating(true);
    try {
      const res = await updateRentalStatus(id, { status: nextStatus });
      setRental(res.data.data.rental);
      toast.success(`Rental marked as ${nextStatus.replace('_', ' ')}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdminCancel = async () => {
    setIsUpdating(true);
    try {
      const res = await updateRentalStatus(id, { status: 'cancelled', notes: cancelNote || undefined });
      setRental(res.data.data.rental);
      toast.success('Rental cancelled.');
      setShowCancelAdmin(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCustomerCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelRental(id);
      toast.success('Rental cancelled.');
      navigate('/my-rentals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
      setIsCancelling(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!rental) return null;

  const nextAction = STATUS_TRANSITIONS[rental.status];
  const canCancelSelf = isCustomer && rental.status === 'pending';
  const canCancelAdmin = canManage && ['pending', 'confirmed'].includes(rental.status);
  const canProcessReturn = canManage && rental.status === 'checked_out';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden pb-10 sm:pb-20">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 relative z-10">
        <Link to={backPath} className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors mb-4 sm:mb-6 bg-slate-900/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-slate-800 backdrop-blur-md w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to {isCustomer ? 'My Rentals' : 'All Rentals'}
        </Link>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8">
          
          {/* ======================= */}
          {/* LEFT COLUMN: MAIN CONTENT */}
          {/* ======================= */}
          <div className="lg:col-span-8 flex flex-col gap-3 sm:gap-6">
            
            {/* HERO CARD (Redesigned) */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-xl sm:rounded-[2.5rem] bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="p-3 sm:p-8 md:p-10 flex flex-row items-start gap-3 sm:gap-8 relative z-10">
                
                {/* Image Box */}
                {canManage && rental.equipment ? (
                  <Link to={`/admin/equipment/${rental.equipment._id}`} className="w-20 h-20 sm:w-40 sm:h-40 shrink-0 rounded-xl sm:rounded-3xl bg-slate-800/80 p-2 sm:p-3 border border-slate-700/50 shadow-inner flex items-center justify-center hover:bg-slate-700 transition-colors group">
                    {rental.equipment.images?.[0] ? (
                      <img src={rental.equipment.images[0].url} alt="" className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform" />
                    ) : (
                      <Package className="h-10 w-10 sm:h-16 sm:w-16 text-slate-600 group-hover:scale-105 transition-transform" />
                    )}
                  </Link>
                ) : (
                  <div className="w-20 h-20 sm:w-40 sm:h-40 shrink-0 rounded-xl sm:rounded-3xl bg-slate-800/80 p-2 sm:p-3 border border-slate-700/50 shadow-inner flex items-center justify-center">
                    {rental.equipment?.images?.[0] ? (
                      <img src={rental.equipment.images[0].url} alt="" className="w-full h-full object-contain drop-shadow-xl" />
                    ) : (
                      <Package className="h-10 w-10 sm:h-16 sm:w-16 text-slate-600" />
                    )}
                  </div>
                )}
                
                {/* Title and Metadata */}
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <RentalStatusBadge status={rental.status} />
                    <span className="px-3 py-1 rounded-full bg-slate-800/80 text-xs font-mono font-bold text-primary-400 border border-slate-700/50 flex items-center gap-1.5">
                      <Hash className="h-3 w-3" /> {rental._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-base font-black tracking-tight mb-1 leading-snug">
                    {canManage && rental.equipment ? (
                      <Link to={`/admin/equipment/${rental.equipment._id}`} className="text-primary-400 hover:text-primary-300 transition-colors inline-flex items-center gap-2 group">
                        {rental.equipment.name}
                        <ExternalLink className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
                      </Link>
                    ) : (
                      <span className="text-primary-400">{rental.equipment?.name}</span>
                    )}
                  </h1>
                  <p className="text-primary-400 font-medium capitalize tracking-wide text-xs sm:text-sm mb-2 sm:mb-4">
                    {rental.equipment?.category?.replace(/-/g, ' ')}
                  </p>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-red-500/80 bg-slate-900/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-slate-800/80">
                    <Clock className="h-3.5 w-3.5 text-red-400" /> Booked: {fmtTime(rental.createdAt)}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CUSTOMER PROFILE (moved from sidebar) */}
            {canManage && (
              <SectionCard title="Customer Profile" icon={User}>
                <div className="space-y-1">
                  
                  <div className="flex justify-between items-center py-2 border-b border-slate-700/50 group">
                    <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-300 transition-colors">
                      <div className="p-1 rounded-lg bg-slate-800"><User className="h-4 w-4 text-primary-400" /></div>
                      <span className="text-sm font-medium">Name</span>
                    </div>
                    <span className="text-lg font-black text-right text-slate-100">{rental.customer?.name}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-700/50 group">
                    <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-300 transition-colors">
                      <div className="p-1 rounded-lg bg-slate-800"><Mail className="h-4 w-4 text-primary-400" /></div>
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <span className="text-lg font-black text-right text-primary-400">{rental.customer?.email}</span>
                  </div>

                  {rental.contactNumber && (
                    <div className="flex justify-between items-center py-2 group">
                      <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-300 transition-colors">
                        <div className="p-1 rounded-lg bg-slate-800"><Phone className="h-4 w-4 text-emerald-400" /></div>
                        <span className="text-sm font-medium">Booking Contact</span>
                      </div>
                      <span className="text-lg font-black text-right text-slate-200">{rental.contactNumber}</span>
                    </div>
                  )}

                </div>
              </SectionCard>
            )}

            {/* Contact number for customer view (non-admin) */}
            {!canManage && rental.contactNumber && (
              <SectionCard title="Booking Contact" icon={Phone}>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <div className="p-1 rounded-lg bg-slate-800"><Phone className="h-4 w-4 text-emerald-400" /></div>
                    <span className="text-sm font-medium">Contact Number</span>
                  </div>
                  <span className="text-lg font-black text-slate-200">{rental.contactNumber}</span>
                </div>
              </SectionCard>
            )}

            {/* DELIVERY ADDRESS (moved from sidebar) */}
            {rental.deliveryAddress && (
              <SectionCard title="Delivery Address" icon={Home}>
                <div className="flex items-start gap-2.5 mt-1">
                  <div className="p-1.5 rounded-lg bg-slate-800 shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-200 leading-snug">
                      {rental.deliveryAddress.street}
                    </p>
                    <p className="text-sm text-slate-400">
                      {rental.deliveryAddress.city}, {rental.deliveryAddress.state} — {rental.deliveryAddress.postalCode}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {rental.deliveryAddress.country}
                    </p>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ADDITIONAL NOTES */}
            {rental.notes && (
              <SectionCard title="Additional Notes" icon={FileText}>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{rental.notes}</p>
                </div>
              </SectionCard>
            )}

            {/* STATUS TIMELINE — mobile only (shown above Financials) */}
            <div className="lg:hidden">
              <SectionCard title="Status Timeline" icon={RotateCcw}>
                <div className="relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-slate-700/50 pl-8">
                  <div className="relative mb-4">
                    <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-primary-500 ring-4 ring-primary-500/20" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Booked</p>
                    <p className="text-sm font-medium text-slate-200">{fmtTime(rental.createdAt)}</p>
                  </div>
                  {rental.confirmedAt && (
                    <div className="relative mb-4">
                      <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Confirmed</p>
                      <p className="text-sm font-medium text-slate-200">{fmtTime(rental.confirmedAt)}</p>
                    </div>
                  )}
                  {rental.checkedOutAt && (
                    <div className="relative mb-4">
                      <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Checked Out</p>
                      <p className="text-sm font-medium text-slate-200">{fmtTime(rental.checkedOutAt)}</p>
                    </div>
                  )}
                  {rental.returnedAt && (
                    <div className="relative mb-4">
                      <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Returned</p>
                      <p className="text-sm font-medium text-slate-200">{fmtTime(rental.returnedAt)}</p>
                    </div>
                  )}
                  {rental.cancelledAt && (
                    <div className="relative mb-0">
                      <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cancelled</p>
                      <p className="text-sm font-medium text-slate-200">{fmtTime(rental.cancelledAt)}</p>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* PAYMENTS SECTION */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-xl sm:rounded-[2rem] bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-2xl p-3 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-5 border-b border-slate-800 pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-2xl font-bold text-slate-100 tracking-tight">Financials & Payments</h2>
                    <p className="hidden sm:block text-xs sm:text-sm text-slate-400 font-medium mt-0.5">Track all transactions for this booking</p>
                  </div>
                </div>
                
                <div className="flex flex-col xs:flex-row items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
                  <Link to={`/invoice/${rental._id}`} className="w-full xs:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all shadow-sm">
                    <FileText className="h-4 w-4 text-primary-400" /> View Invoice
                  </Link>
                  {canManage && !['cancelled'].includes(rental.status) && (
                    <button onClick={() => setShowPaymentModal(true)} className="w-full xs:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/20">
                      <PlusCircle className="h-4 w-4" /> Record Payment
                    </button>
                  )}
                </div>
              </div>

              {paymentsLoading ? (
                <div className="flex justify-center py-10"><Spinner size="lg" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5">
                  
                  {/* Summary Metrics */}
                  <div className="md:col-span-5 flex flex-col gap-2 sm:gap-3">
                    <div className="p-2.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-900/20 border border-emerald-500/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ArrowDownLeft className="w-12 h-12 sm:w-16 sm:h-16" /></div>
                      <p className="text-[10px] sm:text-sm font-bold text-emerald-400/80 uppercase tracking-widest mb-0.5 sm:mb-1 relative z-10">Total Paid</p>
                      <p className="text-lg sm:text-3xl font-black text-emerald-400 relative z-10">₹{(paymentData.summary?.netPaid || 0).toFixed(2)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="p-2.5 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 relative overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1">Total Due</p>
                        <p className="text-base sm:text-xl font-black text-slate-200">₹{(rental.totalAmount || 0).toFixed(2)}</p>
                      </div>
                      <div className={`p-2.5 sm:p-4 rounded-2xl border relative overflow-hidden ${
                        (paymentData.summary?.balance || 0) > 0 
                          ? 'bg-gradient-to-br from-red-500/10 to-red-900/20 border-red-500/20' 
                          : 'bg-gradient-to-br from-blue-500/10 to-blue-900/20 border-blue-500/20'
                      }`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1 ${
                          (paymentData.summary?.balance || 0) > 0 ? 'text-red-400/80' : 'text-blue-400/80'
                        }`}>
                          {(paymentData.summary?.balance || 0) > 0 ? 'Balance' : 'Fully Paid'}
                        </p>
                        <p className={`text-base sm:text-xl font-black ${
                          (paymentData.summary?.balance || 0) > 0 ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          ₹{(paymentData.summary?.balance || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment List */}
                  <div className="md:col-span-7 bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-800 bg-slate-900">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction History</h3>
                    </div>
                    
                    {paymentData.payments.length === 0 ? (
                      <div className="p-5 sm:p-8 text-center flex flex-col items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-2 sm:mb-3"><CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" /></div>
                        <p className="text-xs sm:text-sm font-medium text-slate-300">No payments yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {paymentData.payments.map((p) => (
                          <div key={p._id} className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3 hover:bg-slate-800/40 transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${p.direction === 'outbound' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {p.direction === 'outbound' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-200 capitalize">
                                  {p.paymentType.replace('_', ' ')}
                                </p>
                                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                  {fmtTime(p.paidAt)} · <span className="uppercase text-primary-400/80">{p.paymentMethod}</span>
                                </p>
                              </div>
                            </div>
                            <span className={`text-base font-black tracking-wide ${p.direction === 'outbound' ? 'text-red-400' : 'text-emerald-400'}`}>
                              {p.direction === 'outbound' ? '-' : '+'}₹{p.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </motion.div>
          </div>

          {/* ======================= */}
          {/* RIGHT COLUMN: SIDEBAR   */}
          {/* ======================= */}
          <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-6 relative z-50">
            
            {/* STICKY CONTAINER FOR SIDEBAR */}
            <div className="sticky top-8 flex flex-col gap-3 sm:gap-6">
              
              {/* QUICK ACTIONS */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="order-last lg:order-none bg-slate-900/60 backdrop-blur-md border border-primary-500/30 rounded-2xl p-3 sm:p-5 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent pointer-events-none" />
                <h3 className="text-sm font-bold text-primary-400 uppercase tracking-widest mb-3 sm:mb-4 relative z-20 flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Quick Actions
                </h3>
                
                <div className="flex flex-col gap-3 relative z-20">
                  {canManage && nextAction && (
                    <button
                      onClick={() => handleStatusUpdate(nextAction.nextStatus)}
                      disabled={isUpdating}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all ${isUpdating ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'} bg-gradient-to-r ${nextAction.color}`}
                    >
                      {isUpdating ? <Spinner size="sm" color="white" /> : React.createElement(nextAction.icon, { className: 'h-4 w-4' })}
                      {nextAction.label}
                    </button>
                  )}

                  {canProcessReturn && (
                    <button
                      onClick={() => setShowReturnModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all hover:scale-[1.02]"
                    >
                      <RotateCcw className="h-4 w-4" /> Process Return
                    </button>
                  )}

                  {canCancelSelf && !showCancelConfirm && (
                    <button onClick={() => setShowCancelConfirm(true)} className="w-full px-4 py-3 rounded-xl font-bold text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/30 hover:scale-[1.02]">
                      Cancel Booking
                    </button>
                  )}
                  
                  {canManage && rental.status === 'returned' && rental.returnRecord && (
                    <Link to={`/admin/returns/${rental.returnRecord}`} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-slate-800 text-emerald-400 border border-slate-700 hover:bg-slate-700 hover:text-emerald-300 transition-all">
                      <ShieldCheck className="h-4 w-4" /> View Return Record
                    </Link>
                  )}

                  {/* Fallback when no actions are available */}
                  {!nextAction && !canProcessReturn && !canCancelSelf && (!canManage || rental.status !== 'returned') && !canCancelAdmin && (
                    <div className="p-4 rounded-xl border border-dashed border-slate-700/50 bg-slate-950/50 text-center">
                      <p className="text-sm font-medium text-slate-500">No actions required.</p>
                    </div>
                  )}

                  {/* Cancel Confirmations */}
                  <AnimatePresence>
                    {canCancelAdmin && !nextAction && !['returned', 'cancelled'].includes(rental.status) && (
                      <div className="w-full mt-1">
                        <button onClick={() => setShowCancelAdmin(!showCancelAdmin)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-400 bg-slate-950/50 rounded-lg transition-colors border border-slate-800">
                          Administrative Cancel <ChevronDown className={`h-3 w-3 transition-transform ${showCancelAdmin ? 'rotate-180' : ''}`} />
                        </button>
                        {showCancelAdmin && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 space-y-2 overflow-hidden">
                            <textarea rows={2} value={cancelNote} onChange={(e) => setCancelNote(e.target.value)} placeholder="Cancellation reason..." className="w-full px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-700 text-slate-200 text-xs resize-none focus:ring-1 focus:ring-red-500" />
                            <Button variant="danger" size="sm" className="w-full" isLoading={isUpdating} onClick={handleAdminCancel}>Confirm Cancel</Button>
                          </motion.div>
                        )}
                      </div>
                    )}
                    {showCancelConfirm && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full mt-2 space-y-2 bg-red-950/50 p-3 rounded-xl border border-red-900/50 overflow-hidden">
                        <p className="text-xs font-bold text-red-300 text-center mb-2 uppercase tracking-widest">Cancel booking?</p>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" className="flex-1 text-xs font-bold" onClick={() => setShowCancelConfirm(false)} disabled={isCancelling}>No</Button>
                          <Button variant="danger" size="sm" className="flex-1 text-xs font-bold" isLoading={isCancelling} onClick={handleCustomerCancel}>Yes</Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* STATUS TIMELINE — desktop sidebar only */}
              <div className="hidden lg:block">
              <SectionCard title="Status Timeline" icon={RotateCcw}>
                <div className="relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-slate-700/50 pl-8">
                  <div className="relative mb-4">
                    <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-primary-500 ring-4 ring-primary-500/20" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Booked</p>
                    <p className="text-sm font-medium text-slate-200">{fmtTime(rental.createdAt)}</p>
                  </div>
                  {rental.confirmedAt && (
                    <div className="relative mb-4">
                      <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Confirmed</p>
                      <p className="text-sm font-medium text-slate-200">{fmtTime(rental.confirmedAt)}</p>
                    </div>
                  )}
                  {rental.checkedOutAt && (
                    <div className="relative mb-4">
                      <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Checked Out</p>
                      <p className="text-sm font-medium text-slate-200">{fmtTime(rental.checkedOutAt)}</p>
                    </div>
                  )}
                  {rental.returnedAt && (
                    <div className="relative mb-4">
                      <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Returned</p>
                      <p className="text-sm font-medium text-slate-200">{fmtTime(rental.returnedAt)}</p>
                    </div>
                  )}
                  {rental.cancelledAt && (
                    <div className="relative mb-0">
                      <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cancelled</p>
                      <p className="text-sm font-medium text-slate-200">{fmtTime(rental.cancelledAt)}</p>
                    </div>
                  )}
                </div>
              </SectionCard>
              </div>

              <SectionCard title="Rental Period" icon={Calendar}>
                <div className="space-y-1">
                  <InfoRow label="Start Date" value={fmt(rental.startDate)} icon={Calendar} valueClass="text-emerald-400" />
                  <InfoRow label="End Date" value={fmt(rental.endDate)} icon={Calendar} valueClass="text-red-400" />
                  <InfoRow label="Duration" value={`${rental.totalDays} Day${rental.totalDays !== 1 ? 's' : ''}`} icon={Clock} valueClass="text-sky-400 font-bold text-base" />
                </div>
              </SectionCard>



              <SectionCard title="Cost Breakdown" icon={DollarSign}>
                <div className="space-y-1">
                  <InfoRow label="Daily Rate" value={`₹${rental.dailyRate}`} icon={DollarSign} />
                  <InfoRow label="Rental Cost" value={`₹${rental.rentalCost.toFixed(2)}`} icon={Package} />
                  <InfoRow label="Security Deposit" value={`₹${rental.securityDeposit.toFixed(2)}`} icon={ShieldCheck} />
                  <div className="mt-3 pt-3 border-t-2 border-primary-500/30 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Total</span>
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">₹{rental.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </SectionCard>

            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReturnModal && rental && (
        <ProcessReturnModal
          rental={rental}
          onClose={() => setShowReturnModal(false)}
          onProcessed={() => { setShowReturnModal(false); loadRental(); }}
        />
      )}
      {showPaymentModal && rental && (
        <RecordPaymentModal
          rental={rental}
          summary={paymentData.summary}
          onClose={() => setShowPaymentModal(false)}
          onRecorded={() => { setShowPaymentModal(false); loadPayments(); }}
        />
      )}
    </div>
  );
};

export default RentalDetail;
