import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Package, AlertTriangle, CheckCircle,
  Calendar, DollarSign, User, Wrench, ClipboardList,
  ShieldCheck,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { fetchReturnById } from '../../services/returnService';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtTime = (d) =>
  d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-slate-800 last:border-0 gap-4">
    <span className="text-sm text-slate-500 shrink-0">{label}</span>
    <span className="text-sm text-slate-200 font-medium text-right">{value || '—'}</span>
  </div>
);

const conditionColors = {
  excellent: 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
  good: 'bg-blue-900/40 text-blue-400 border-blue-800',
  fair: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  poor: 'bg-red-900/40 text-red-400 border-red-800',
};

const ReturnDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
    };
    load();
  }, [id]);

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!record) return null;

  const eqStatusColor = record.equipmentStatusAfterReturn === 'maintenance'
    ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800'
    : 'bg-emerald-900/40 text-emerald-400 border-emerald-800';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <Link to="/admin/returns" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Returns
        </Link>

        {/* Header banner */}
        <div className={`rounded-2xl p-5 mb-5 border flex items-center gap-4 ${
          record.isDamaged
            ? 'bg-red-950/20 border-red-900/50'
            : 'bg-emerald-950/20 border-emerald-900/50'
        }`}>
          <div className={`p-3 rounded-xl ${record.isDamaged ? 'bg-red-900/30' : 'bg-emerald-900/30'}`}>
            {record.isDamaged
              ? <AlertTriangle className="h-6 w-6 text-red-400" />
              : <CheckCircle className="h-6 w-6 text-emerald-400" />}
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-slate-100">
              {record.isDamaged ? 'Return — Equipment Damaged' : 'Return — Clean Return'}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Processed on {fmtTime(record.createdAt)} by <span className="text-slate-300">{record.processedBy?.name}</span>
            </p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${eqStatusColor} shrink-0`}>
            {record.equipmentStatusAfterReturn === 'maintenance' ? '⚙ Sent to Maintenance' : '✓ Available'}
          </span>
        </div>

        {/* Equipment card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5 flex items-center gap-4">
          <div className="h-20 w-24 rounded-xl bg-slate-800 overflow-hidden shrink-0">
            {record.equipment?.images?.[0] ? (
              <img src={record.equipment.images[0].url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-slate-600" /></div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-100">{record.equipment?.name}</h2>
            <p className="text-sm text-slate-500 capitalize">{record.equipment?.category?.replace(/-/g, ' ')}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${conditionColors[record.conditionAtReturn]}`}>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Return Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Return Details</h3>
            </div>
            <InfoRow label="Actual Return Date" value={fmt(record.returnDate)} />
            <InfoRow label="Condition at Return" value={
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${conditionColors[record.conditionAtReturn]}`}>
                {record.conditionAtReturn}
              </span>
            } />
            <InfoRow label="Processed By" value={`${record.processedBy?.name} (${record.processedBy?.role})`} />
            <InfoRow label="Record Created" value={fmtTime(record.createdAt)} />
          </div>

          {/* Deposit & Financials */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Deposit Settlement</h3>
            </div>
            <InfoRow label="Security Deposit" value={`$${record.rental?.securityDeposit?.toFixed(2)}`} />
            <InfoRow
              label="Damage Charges"
              value={
                record.damageCharges > 0
                  ? <span className="text-red-400">-${record.damageCharges.toFixed(2)}</span>
                  : <span className="text-slate-500">None</span>
              }
            />
            <InfoRow
              label="Deposit Deducted"
              value={
                record.depositDeducted > 0
                  ? <span className="text-red-400">-${record.depositDeducted.toFixed(2)}</span>
                  : '$0.00'
              }
            />
            <InfoRow
              label="Deposit Refunded"
              value={
                <span className={record.depositRefunded > 0 ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                  ${record.depositRefunded.toFixed(2)}
                </span>
              }
            />
          </div>

          {/* Customer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Customer</h3>
            </div>
            <InfoRow label="Name" value={record.customer?.name} />
            <InfoRow label="Email" value={record.customer?.email} />
            <InfoRow label="Phone" value={record.customer?.phone} />
          </div>

          {/* Rental Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Rental Summary</h3>
            </div>
            <InfoRow label="Rental Period" value={`${fmt(record.rental?.startDate)} → ${fmt(record.rental?.endDate)}`} />
            <InfoRow label="Total Days" value={`${record.rental?.totalDays} days`} />
            <InfoRow label="Rental Cost" value={`$${record.rental?.rentalCost?.toFixed(2)}`} />
            <InfoRow label="Total Paid" value={`$${record.rental?.totalAmount?.toFixed(2)}`} />
          </div>

          {/* Damage Report */}
          {record.isDamaged && (
            <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-5 sm:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h3 className="text-sm font-semibold text-red-300">Damage Report</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{record.damageDescription}</p>
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-yellow-900/20 border border-yellow-900/40 rounded-lg w-fit">
                <Wrench className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-yellow-300 font-medium">Equipment sent to maintenance queue</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-300">Notes</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{record.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnDetail;
