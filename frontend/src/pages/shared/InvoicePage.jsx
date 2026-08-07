import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Printer, CheckCircle, Clock, AlertCircle, 
  XCircle, Receipt, User, Package, IndianRupee, FileText, MapPin
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { fetchInvoice } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const STATUS_CONFIG = {
  paid: { label: 'PAID', icon: CheckCircle, cls: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
  partial: { label: 'PARTIAL', icon: Clock, cls: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]' },
  unpaid: { label: 'UNPAID', icon: AlertCircle, cls: 'text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
  cancelled: { label: 'CANCELLED', icon: XCircle, cls: 'text-slate-400 border-slate-600/30 bg-slate-800/50 shadow-[0_0_15px_rgba(148,163,184,0.1)]' },
};

const TYPE_COLORS = {
  advance: 'text-blue-400',
  balance: 'text-emerald-400',
  damage_charge: 'text-red-400',
  deposit_refund: 'text-yellow-400',
};

const InvoicePage = () => {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isStaff } = useAuth();
  const canManage = isAdmin || isStaff;

  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const backPath = canManage ? `/admin/rentals/${rentalId}` : `/my-rentals/${rentalId}`;

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchInvoice(rentalId);
      setInvoice(res.data.data.invoice);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invoice not found.');
      navigate(backPath);
    } finally {
      setIsLoading(false);
    }
  }, [rentalId, navigate, backPath]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!invoice) return null;

  const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.unpaid;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Landscape Print Style */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Background ambient glowing orbs (hidden on print) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 blur-[100px] pointer-events-none rounded-full print:hidden" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full print:hidden" />

      {/* Screen-only controls */}
      <div className="print:hidden max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 relative z-10">
        <div className="flex items-center justify-between">
          <Link to={backPath} className="inline-flex items-center justify-center h-10 sm:h-12 gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors bg-slate-900/50 px-3 sm:px-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back to Rental
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center h-10 sm:h-12 gap-1.5 sm:gap-2 px-3 sm:px-5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-primary-500/25 border border-primary-400/20"
          >
            <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Print Document
          </button>
        </div>
      </div>

      {/* Invoice Document - Landscape Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-[85rem] mx-auto px-2 sm:px-6 lg:px-8 pb-8 sm:pb-16 relative z-10 print:px-0 print:pb-0 print:max-w-none"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl print:rounded-none print:border-none print:bg-white print:text-slate-900 print:shadow-none print:backdrop-blur-none relative flex flex-col min-h-[auto] sm:min-h-[500px]">
          
          {/* Decorative Top Accent */}
          <div className="h-2 w-full bg-gradient-to-r from-primary-500 via-emerald-500 to-blue-500 print:hidden" />

          {/* Invoice header */}
          <div className="px-3 sm:px-8 pt-4 sm:pt-6 pb-4 sm:pb-5 border-b border-slate-800/60 print:border-slate-200">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-primary-500/20 to-blue-500/20 border border-primary-500/30 rounded-2xl print:hidden">
                  <Receipt className="h-8 w-8 text-primary-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-400 via-emerald-400 to-blue-500 print:text-slate-900 tracking-widest drop-shadow-sm uppercase">INVOICE</h1>
                  <p className="text-primary-400 font-mono text-sm mt-1 font-semibold print:text-blue-600">{invoice.invoiceNumber}</p>
                  <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5 font-medium print:text-slate-600">Issued: {fmt(invoice.issuedAt)}</p>
                </div>
              </div>
              <div className="sm:text-right">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight print:text-slate-900">RentAll Platform</h2>
                <p className="text-slate-400 text-xs sm:text-sm print:text-slate-600 font-medium">Premium Rental Services</p>
                <div className="mt-3 flex sm:justify-end">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${statusCfg.cls} print:border-2 print:shadow-none`}>
                    <StatusIcon className="h-4 w-4" />
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Landscape 2-Column Split */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
            
            {/* LEFT COLUMN (Details & Line Items) */}
            <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-slate-800/60 print:border-slate-200">
              
              {/* Bill To / Item */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-3 sm:px-8 py-4 sm:py-5 border-b border-slate-800/60 print:border-slate-200">
                {/* Bill To */}
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 print:p-0 print:bg-transparent print:border-none">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-primary-400 print:hidden" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-slate-500">Bill To</p>
                  </div>
                  <p className="font-bold text-sm sm:text-base text-slate-100 print:text-slate-900">{invoice.customer?.name}</p>
                  <div className="space-y-0.5 mt-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-400 print:text-slate-600">{invoice.customer?.email}</p>
                    {invoice.customer?.phone && <p className="text-xs sm:text-sm font-medium text-slate-400 print:text-slate-600">{invoice.customer.phone}</p>}
                    {invoice.rental?.contactNumber && (
                      <p className="text-xs sm:text-sm font-medium text-emerald-400 print:text-slate-600">📞 {invoice.rental.contactNumber}</p>
                    )}
                    {invoice.rental?.deliveryAddress && (
                      <div className="mt-2 pt-2 border-t border-slate-700/50 print:border-slate-200">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5 print:hidden" />
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5 print:text-slate-400">Delivery Address</p>
                            <p className="text-xs sm:text-sm font-medium text-slate-300 print:text-slate-700 leading-snug">
                              {invoice.rental.deliveryAddress.street}
                            </p>
                            <p className="text-[11px] sm:text-sm font-medium text-slate-400 print:text-slate-600">
                              {invoice.rental.deliveryAddress.city}, {invoice.rental.deliveryAddress.state} — {invoice.rental.deliveryAddress.postalCode}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-500 print:text-slate-400">
                              {invoice.rental.deliveryAddress.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item */}
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 print:p-0 print:bg-transparent print:border-none">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-emerald-400 print:hidden" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-slate-500">Item</p>
                  </div>
                  <p className="font-bold text-sm sm:text-base text-slate-100 print:text-slate-900">{invoice.item?.name}</p>
                  <p className="text-xs sm:text-sm font-medium text-primary-400 capitalize print:text-slate-600">{invoice.item?.category?.replace(/-/g, ' ')}</p>
                  <div className="mt-2 pt-2 border-t border-slate-700/50 print:border-slate-200 space-y-1">
                    <p className="text-[10px] sm:text-xs font-mono font-medium text-slate-400 print:text-slate-500">Duration: {fmt(invoice.rental?.startDate)} → {fmt(invoice.rental?.endDate)}</p>
                    <p className="text-[10px] sm:text-xs font-medium text-slate-400 print:text-slate-500">{invoice.rental?.totalDays} day{invoice.rental?.totalDays !== 1 ? 's' : ''} @ ₹{invoice.rental?.dailyRate}/day</p>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div className="px-3 sm:px-8 py-4 sm:py-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-slate-400 print:hidden" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-slate-500">Line Items</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-800 print:border-slate-300">
                        <th className="pb-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-500 pl-4">Description</th>
                        <th className="pb-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-500">Details</th>
                        <th className="pb-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-500 text-right pr-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                      {invoice.lineItems?.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-800/20 transition-colors print:hover:bg-transparent">
                          <td className="py-2.5 pl-4 text-xs sm:text-sm font-medium text-slate-200 print:text-slate-800">{item.description}</td>
                          <td className="py-2.5 text-[10px] sm:text-xs text-slate-500 print:text-slate-500">{item.detail}</td>
                          <td className={`py-2.5 pr-4 text-xs sm:text-sm font-bold text-right ${item.amount < 0 ? 'text-emerald-400 print:text-emerald-600' : 'text-slate-200 print:text-slate-800'}`}>
                            {item.amount < 0 ? `-₹${Math.abs(item.amount).toFixed(2)}` : `₹${item.amount.toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Summary & Payments) */}
            <div className="lg:col-span-4 flex flex-col bg-slate-800/10 print:bg-transparent">
              
              {/* Totals Summary */}
              <div className="px-3 sm:px-8 py-4 sm:py-5 border-b border-slate-800/60 print:border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 print:text-slate-500">Financial Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-400 print:text-slate-600">Rental Cost</span>
                    <span className="text-slate-200 print:text-slate-800">₹{invoice.totals?.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-400 print:text-slate-600">Security Deposit</span>
                    <span className="text-slate-200 print:text-slate-800">₹{invoice.totals?.securityDeposit?.toFixed(2)}</span>
                  </div>
                  {invoice.totals?.damageCharges > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm font-medium">
                      <span className="text-red-400 print:text-red-600">Damage Charges</span>
                      <span className="text-red-400 print:text-red-600">+₹{invoice.totals.damageCharges.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.totals?.depositRefunded > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm font-medium">
                      <span className="text-emerald-400 print:text-emerald-600">Deposit Refund</span>
                      <span className="text-emerald-400 print:text-emerald-600">-₹{invoice.totals.depositRefunded.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="my-3 border-t border-slate-700/80 print:border-slate-300" />
                  
                  <div className="flex justify-between text-xs sm:text-sm font-bold">
                    <span className="text-slate-300 print:text-slate-700 uppercase tracking-wider">Total Amount</span>
                    <span className="text-sm sm:text-base text-white print:text-slate-900">₹{invoice.totals?.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold">
                    <span className="text-emerald-400 print:text-emerald-600 uppercase tracking-wider">Total Paid</span>
                    <span className="text-emerald-400 print:text-emerald-600">₹{invoice.paymentSummary?.netPaid?.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t-2 border-primary-500/50 print:border-slate-400 flex justify-between items-center">
                    <span className={`text-sm sm:text-base font-black tracking-widest uppercase ${invoice.paymentSummary?.balance > 0 ? 'text-red-400 print:text-red-600' : 'text-emerald-400 print:text-emerald-600'}`}>
                      {invoice.paymentSummary?.balance > 0 ? 'Balance Due' : 'Fully Paid'}
                    </span>
                    <span className={`text-lg sm:text-xl font-black ${invoice.paymentSummary?.balance > 0 ? 'text-red-400 print:text-red-600' : 'text-emerald-400 print:text-emerald-600'}`}>
                      ₹{invoice.paymentSummary?.balance?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="px-3 sm:px-8 py-4 sm:py-5 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <IndianRupee className="h-4 w-4 text-slate-400 print:hidden" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-slate-500">Payments</p>
                </div>
                
                {invoice.payments?.length === 0 ? (
                  <div className="p-3 rounded-xl border border-dashed border-slate-700/50 bg-slate-900/30 text-center print:border-none print:bg-transparent print:p-0 print:text-left">
                    <p className="text-xs font-medium text-slate-500 italic print:text-slate-400">No payments yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoice.payments.map((p) => (
                      <div key={p._id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30 print:p-0 print:bg-transparent print:border-none print:mb-1">
                        <div>
                          <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${TYPE_COLORS[p.paymentType] || 'text-slate-400'} print:text-slate-600`}>
                            {p.paymentType.replace('_', ' ')} <span className="text-slate-500 lowercase opacity-70">via</span> {p.paymentMethod}
                          </p>
                          <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 mt-0.5 print:text-slate-400">{fmt(p.paidAt)}</p>
                        </div>
                        <span className={`text-[11px] sm:text-xs font-black tracking-wide ${p.direction === 'outbound' ? 'text-red-400 print:text-red-600' : 'text-emerald-400 print:text-emerald-600'}`}>
                          {p.direction === 'outbound' ? '-' : '+'}₹{p.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-5 bg-slate-900/50 print:bg-transparent text-center border-t border-slate-800/60 print:border-slate-200 mt-auto">
            <p className="text-[11px] font-medium text-slate-500 print:text-slate-500 max-w-lg mx-auto">
              Thank you for choosing RentAll Platform. For questions concerning this invoice, please contact our support team.
            </p>
            <div className="mt-3 inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 print:border-none print:bg-transparent">
              <p className="text-[10px] font-mono font-bold text-slate-400 print:text-slate-400">Ref: {invoice.invoiceNumber}</p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default InvoicePage;
