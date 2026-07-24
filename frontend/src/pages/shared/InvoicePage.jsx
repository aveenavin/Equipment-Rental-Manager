import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Printer, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { fetchInvoice } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const STATUS_CONFIG = {
  paid: { label: 'PAID', icon: CheckCircle, cls: 'text-emerald-400 border-emerald-700 bg-emerald-900/30' },
  partial: { label: 'PARTIAL', icon: Clock, cls: 'text-yellow-400 border-yellow-700 bg-yellow-900/30' },
  unpaid: { label: 'UNPAID', icon: AlertCircle, cls: 'text-red-400 border-red-700 bg-red-900/30' },
  cancelled: { label: 'CANCELLED', icon: XCircle, cls: 'text-slate-400 border-slate-600 bg-slate-800/50' },
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Screen-only controls */}
      <div className="print:hidden max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <Link to={backPath} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Rental
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 print:px-0 print:pb-0 print:max-w-none">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden print:rounded-none print:border-none print:bg-white print:text-slate-900 print:shadow-none">

          {/* Invoice header */}
          <div className="px-10 pt-10 pb-8 border-b border-slate-800 print:border-slate-200">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white print:text-slate-900 tracking-tight">INVOICE</h1>
                <p className="text-primary-400 font-mono text-sm mt-1 print:text-blue-600">{invoice.invoiceNumber}</p>
                <p className="text-slate-500 text-xs mt-1 print:text-slate-600">Issued: {fmt(invoice.issuedAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white print:text-slate-900">EquipRental</p>
                <p className="text-slate-400 text-sm print:text-slate-600">Equipment Rental Services</p>
                <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.cls} print:border`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Bill To / Equipment */}
          <div className="grid grid-cols-2 gap-8 px-10 py-8 border-b border-slate-800 print:border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 print:text-slate-400">Bill To</p>
              <p className="font-semibold text-slate-100 print:text-slate-900">{invoice.customer?.name}</p>
              <p className="text-sm text-slate-400 print:text-slate-600">{invoice.customer?.email}</p>
              {invoice.customer?.phone && <p className="text-sm text-slate-400 print:text-slate-600">{invoice.customer.phone}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 print:text-slate-400">Equipment</p>
              <p className="font-semibold text-slate-100 print:text-slate-900">{invoice.equipment?.name}</p>
              <p className="text-sm text-slate-400 capitalize print:text-slate-600">{invoice.equipment?.category?.replace(/-/g, ' ')}</p>
              <p className="text-xs font-mono text-slate-500 mt-1 print:text-slate-400">Rental: {fmt(invoice.rental?.startDate)} → {fmt(invoice.rental?.endDate)}</p>
              <p className="text-xs text-slate-500 print:text-slate-400">{invoice.rental?.totalDays} day{invoice.rental?.totalDays !== 1 ? 's' : ''} @ ₹{invoice.rental?.dailyRate}/day</p>
            </div>
          </div>

          {/* Line items */}
          <div className="px-10 py-8 border-b border-slate-800 print:border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 print:text-slate-400">Line Items</p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 print:border-slate-300">
                  <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase print:text-slate-500">Description</th>
                  <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase print:text-slate-500">Detail</th>
                  <th className="text-right pb-3 text-xs font-semibold text-slate-400 uppercase print:text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {invoice.lineItems?.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 text-sm text-slate-200 print:text-slate-800">{item.description}</td>
                    <td className="py-3 text-xs text-slate-500 print:text-slate-500">{item.detail}</td>
                    <td className={`py-3 text-sm font-medium text-right ${item.amount < 0 ? 'text-emerald-400 print:text-emerald-600' : 'text-slate-200 print:text-slate-800'}`}>
                      {item.amount < 0 ? `-₹${Math.abs(item.amount).toFixed(2)}` : `₹${item.amount.toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals + Payment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 px-10 py-8 border-b border-slate-800 print:border-slate-200">
            {/* Payment history */}
            <div className="sm:border-r border-slate-800 print:border-slate-200 sm:pr-8">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 print:text-slate-400">Payment History</p>
              {invoice.payments?.length === 0 ? (
                <p className="text-sm text-slate-500 italic print:text-slate-400">No payments recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {invoice.payments.map((p) => (
                    <div key={p._id} className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs font-medium capitalize ${TYPE_COLORS[p.paymentType] || 'text-slate-400'}`}>
                          {p.paymentType.replace('_', ' ')} · {p.paymentMethod}
                        </p>
                        <p className="text-xs text-slate-600 print:text-slate-400">{fmt(p.paidAt)}</p>
                      </div>
                      <span className={`text-sm font-semibold ${p.direction === 'outbound' ? 'text-red-400 print:text-red-600' : 'text-emerald-400 print:text-emerald-600'}`}>
                        {p.direction === 'outbound' ? '-' : '+'}₹{p.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="mt-6 sm:mt-0 sm:pl-8">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 print:text-slate-400">Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 print:text-slate-600">Rental Cost</span>
                  <span className="text-slate-200 print:text-slate-800">₹{invoice.totals?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 print:text-slate-600">Security Deposit</span>
                  <span className="text-slate-200 print:text-slate-800">₹{invoice.totals?.securityDeposit?.toFixed(2)}</span>
                </div>
                {invoice.totals?.damageCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400 print:text-red-600">Damage Charges</span>
                    <span className="text-red-400 print:text-red-600">+₹{invoice.totals.damageCharges.toFixed(2)}</span>
                  </div>
                )}
                {invoice.totals?.depositRefunded > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400 print:text-emerald-600">Deposit Refund</span>
                    <span className="text-emerald-400 print:text-emerald-600">-₹{invoice.totals.depositRefunded.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-slate-700 print:border-slate-300">
                  <span className="text-slate-300 font-semibold print:text-slate-700">Total Amount</span>
                  <span className="text-slate-100 font-semibold print:text-slate-900">₹{invoice.totals?.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400 print:text-emerald-600">Total Paid</span>
                  <span className="text-emerald-400 font-semibold print:text-emerald-600">₹{invoice.paymentSummary?.netPaid?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t-2 border-primary-700 print:border-blue-400">
                  <span className={invoice.paymentSummary?.balance > 0 ? 'text-red-400 print:text-red-600' : 'text-emerald-400 print:text-emerald-600'}>
                    {invoice.paymentSummary?.balance > 0 ? 'Balance Due' : 'Fully Paid'}
                  </span>
                  <span className={invoice.paymentSummary?.balance > 0 ? 'text-red-400 print:text-red-600' : 'text-emerald-400 print:text-emerald-600'}>
                    ₹{invoice.paymentSummary?.balance?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 py-6 text-center">
            <p className="text-xs text-slate-600 print:text-slate-400">
              Thank you for choosing EquipRental. For questions about this invoice, please contact support.
            </p>
            <p className="text-xs font-mono text-slate-700 mt-1 print:text-slate-400">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
