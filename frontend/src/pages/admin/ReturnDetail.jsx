import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Package, AlertTriangle, CheckCircle,
  Calendar, IndianRupee, User, Wrench, ClipboardList,
  ShieldCheck,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { fetchReturnById } from '../../services/returnService';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 border-b border-slate-800 last:border-0 gap-4">
    <span className="text-[13px] text-slate-500 shrink-0">{label}</span>
    <span className="text-[13px] text-slate-200 font-medium text-right">{value || '—'}</span>
  </div>
);

const conditionClasses = {
  excellent: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border border-white/20',
  good: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20 border border-white/20',
  fair: 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20 border border-white/20',
  poor: 'bg-gradient-to-r from-red-500 to-rose-400 text-white shadow-md shadow-red-500/20 border border-white/20',
};

const ReturnDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchReturnById(id);
      setRecord(res.data.data.return);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return record not found.');
      navigate('/admin/returns');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) return <div className="min-h-screen bg-[#d8d9e0] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!record) return null;

  const eqStatusCls = record.equipmentStatusAfterReturn === 'maintenance'
    ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20 border border-white/20'
    : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border border-white/20';

  return (
    <div className="min-h-screen bg-[#d8d9e0] text-gray-800">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6">

        <Link to="/admin/returns" className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-orange-700 transition-colors mb-5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Returns
        </Link>

        {/* Header banner */}
        <div className={`rounded-2xl p-4 mb-4 border flex items-center gap-3 ${record.isDamaged
          ? 'bg-red-50 border-red-200'
          : 'bg-emerald-50 border-emerald-200'
          }`}>
          <div className={`p-3 rounded-xl ${record.isDamaged ? 'bg-red-100' : 'bg-emerald-100'}`}>
            {record.isDamaged
              ? <AlertTriangle className="h-5 w-5 text-red-500" />
              : <CheckCircle className="h-5 w-5 text-emerald-600" />}
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-base text-gray-800">
              {record.isDamaged ? 'Return — Equipment Damaged' : 'Return — Clean Return'}
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Processed on {fmtTime(record.createdAt)} by <span className="text-gray-700">{record.processedBy?.name}</span>
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${eqStatusCls}`}>
            {record.equipmentStatusAfterReturn === 'maintenance' ? 'Sent to Maintenance' : 'Available'}
          </span>
        </div>

        {/* Equipment card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <div className="h-16 w-20 rounded-xl bg-slate-800 overflow-hidden shrink-0">
            {record.equipment?.images?.[0] ? (
              <img src={record.equipment.images[0].url} alt="" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package className="h-6 w-6 text-slate-600" /></div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-100">{record.equipment?.name}</h2>
            <p className="text-sm text-slate-500 capitalize">{record.equipment?.category?.replace(/-/g, ' ')}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${conditionClasses[record.conditionAtReturn]}`}>
                Returned: {record.conditionAtReturn}
              </span>
            </div>
          </div>
          <Link
            to={`/admin/rentals/${record.rental?._id || ''}`}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 shrink-0"
          >
            View Rental →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Return Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <h3 className="text-[13px] font-semibold text-slate-300">Return Details</h3>
            </div>
            <InfoRow label="Actual Return Date" value={fmt(record.returnDate)} />
            <InfoRow label="Condition at Return" value={
              <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[11px] font-medium border capitalize ${conditionClasses[record.conditionAtReturn]}`}>
                {record.conditionAtReturn}
              </span>
            } />
            <InfoRow label="Processed By" value={`${record.processedBy?.name} (${record.processedBy?.role})`} />
            <InfoRow label="Record Created" value={fmtTime(record.createdAt)} />
          </div>

          {/* Deposit & Financials */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
              <h3 className="text-[13px] font-semibold text-slate-300">Deposit Settlement</h3>
            </div>
            <InfoRow label="Security Deposit" value={`₹${record.rental?.securityDeposit?.toFixed(2)}`} />
            <InfoRow
              label="Damage Charges"
              value={
                record.damageCharges > 0
                  ? <span className="text-red-400">-₹{record.damageCharges.toFixed(2)}</span>
                  : <span className="text-slate-500">None</span>
              }
            />
            <InfoRow
              label="Deposit Deducted"
              value={
                record.depositDeducted > 0
                  ? <span className="text-red-400">-₹{record.depositDeducted.toFixed(2)}</span>
                  : '₹0.00'
              }
            />
            <InfoRow
              label="Deposit Refunded"
              value={
                <span className={record.depositRefunded > 0 ? 'text-emerald-600 font-bold' : 'text-red-500'}>
                  ₹{record.depositRefunded.toFixed(2)}
                </span>
              }
            />
          </div>

          {/* Customer */}
          <div className="bg-white border border-orange-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-3.5 w-3.5 text-gray-400" />
              <h3 className="text-[13px] font-semibold text-gray-700">Customer</h3>
            </div>
            <InfoRow label="Name" value={record.customer?.name} />
            <InfoRow label="Email" value={record.customer?.email} />
            <InfoRow label="Phone" value={record.customer?.phone} />
          </div>

          {/* Rental Summary */}
          <div className="bg-white border border-orange-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-3.5 w-3.5 text-gray-400" />
              <h3 className="text-[13px] font-semibold text-gray-700">Rental Summary</h3>
            </div>
            <InfoRow label="Rental Period" value={`${fmt(record.rental?.startDate)} → ${fmt(record.rental?.endDate)}`} />
            <InfoRow label="Total Days" value={`${record.rental?.totalDays} days`} />
            <InfoRow label="Rental Cost" value={`₹${record.rental?.rentalCost?.toFixed(2)}`} />
            <InfoRow label="Total Paid" value={`₹${record.rental?.totalAmount?.toFixed(2)}`} />
          </div>

          {/* Damage Report */}
          {record.isDamaged && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                <h3 className="text-[13px] font-semibold text-red-600">Damage Report</h3>
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed">{record.damageDescription}</p>
              <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg w-fit">
                <Wrench className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-[11px] text-amber-700 font-medium">Equipment sent to maintenance queue</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="bg-white border border-orange-200 rounded-2xl p-4 sm:col-span-2 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                <h3 className="text-[13px] font-semibold text-gray-700">Notes</h3>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed">{record.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnDetail;
