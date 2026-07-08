import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Package, Calendar, DollarSign, User,
  CheckCircle, Truck, RotateCcw, XCircle, ChevronDown,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import RentalStatusBadge from '../../components/rental/RentalStatusBadge';
import { fetchRentalById, updateRentalStatus, cancelRental } from '../../services/rentalService';
import { useAuth } from '../../context/AuthContext';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const fmtTime = (d) =>
  d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-slate-800 last:border-0 gap-4">
    <span className="text-sm text-slate-500 shrink-0">{label}</span>
    <span className="text-sm text-slate-200 font-medium text-right">{value}</span>
  </div>
);

const STATUS_TRANSITIONS = {
  pending: { label: 'Confirm Booking', nextStatus: 'confirmed', icon: CheckCircle, variant: 'primary' },
  confirmed: { label: 'Mark Checked Out', nextStatus: 'checked_out', icon: Truck, variant: 'primary' },
  checked_out: { label: 'Mark Returned', nextStatus: 'returned', icon: RotateCcw, variant: 'secondary' },
};

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

  const backPath = isCustomer ? '/my-rentals' : '/admin/rentals';

  const loadRental = async () => {
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
  };

  useEffect(() => { loadRental(); }, [id]);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <Link to={backPath} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to {isCustomer ? 'My Rentals' : 'All Rentals'}
        </Link>

        {/* Status header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <RentalStatusBadge status={rental.status} />
                <span className="text-xs text-slate-500 font-mono">#{rental._id.slice(-8).toUpperCase()}</span>
              </div>
              <p className="text-xs text-slate-500">Booked on {fmtTime(rental.createdAt)}</p>
            </div>

            {/* Admin status transition buttons */}
            {canManage && nextAction && (
              <div className="flex items-center gap-2">
                {React.createElement(nextAction.icon, { className: 'h-4 w-4 text-slate-400' })}
                <Button
                  variant={nextAction.variant}
                  size="sm"
                  isLoading={isUpdating}
                  onClick={() => handleStatusUpdate(nextAction.nextStatus)}
                  className="flex items-center gap-2"
                >
                  {nextAction.label}
                </Button>
              </div>
            )}

            {/* Customer cancel */}
            {canCancelSelf && !showCancelConfirm && (
              <Button variant="ghost" size="sm" className="text-red-400" onClick={() => setShowCancelConfirm(true)}>
                <XCircle className="h-4 w-4 mr-1" /> Cancel Rental
              </Button>
            )}
          </div>

          {/* Admin cancel accordion */}
          {canCancelAdmin && !nextAction && !['returned', 'cancelled'].includes(rental.status) && (
            <button onClick={() => setShowCancelAdmin(!showCancelAdmin)}
              className="mt-4 text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              Cancel this rental <ChevronDown className={`h-3 w-3 transition-transform ${showCancelAdmin ? 'rotate-180' : ''}`} />
            </button>
          )}
          {canCancelAdmin && showCancelAdmin && (
            <div className="mt-3 space-y-3 pt-3 border-t border-slate-800">
              <textarea rows={2} value={cancelNote} onChange={(e) => setCancelNote(e.target.value)}
                placeholder="Reason for cancellation (optional)..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500" />
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowCancelAdmin(false)}>Back</Button>
                <Button variant="danger" size="sm" isLoading={isUpdating} onClick={handleAdminCancel}>Confirm Cancellation</Button>
              </div>
            </div>
          )}

          {/* Customer cancel confirm */}
          {showCancelConfirm && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <p className="text-sm text-slate-400">Are you sure you want to cancel this rental?</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowCancelConfirm(false)} disabled={isCancelling}>Keep it</Button>
                <Button variant="danger" size="sm" isLoading={isCancelling} onClick={handleCustomerCancel}>Yes, Cancel</Button>
              </div>
            </div>
          )}
        </div>

        {/* Equipment card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5 flex items-center gap-4">
          <div className="h-20 w-24 rounded-xl bg-slate-800 overflow-hidden shrink-0">
            {rental.equipment?.images?.[0] ? (
              <img src={rental.equipment.images[0].url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-slate-600" /></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-slate-100">{rental.equipment?.name}</h2>
            <p className="text-sm text-slate-500 capitalize">{rental.equipment?.category?.replace(/-/g, ' ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Dates */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Rental Period</h3>
            </div>
            <InfoRow label="Start Date" value={fmt(rental.startDate)} />
            <InfoRow label="End Date" value={fmt(rental.endDate)} />
            <InfoRow label="Duration" value={`${rental.totalDays} day${rental.totalDays !== 1 ? 's' : ''}`} />
          </div>

          {/* Financials */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Cost Breakdown</h3>
            </div>
            <InfoRow label="Daily Rate" value={`$${rental.dailyRate}`} />
            <InfoRow label="Rental Cost" value={`$${rental.rentalCost.toFixed(2)}`} />
            <InfoRow label="Security Deposit" value={`$${rental.securityDeposit.toFixed(2)}`} />
            <InfoRow label="Total Amount" value={<span className="text-primary-400 font-bold">${rental.totalAmount.toFixed(2)}</span>} />
          </div>

          {/* Customer Info (admin/staff only) */}
          {canManage && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-300">Customer</h3>
              </div>
              <InfoRow label="Name" value={rental.customer?.name} />
              <InfoRow label="Email" value={rental.customer?.email} />
              <InfoRow label="Phone" value={rental.customer?.phone || '—'} />
            </div>
          )}

          {/* Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Status Timeline</h3>
            </div>
            <InfoRow label="Booked" value={fmtTime(rental.createdAt)} />
            {rental.confirmedAt && <InfoRow label="Confirmed" value={fmtTime(rental.confirmedAt)} />}
            {rental.checkedOutAt && <InfoRow label="Checked Out" value={fmtTime(rental.checkedOutAt)} />}
            {rental.returnedAt && <InfoRow label="Returned" value={fmtTime(rental.returnedAt)} />}
            {rental.cancelledAt && <InfoRow label="Cancelled" value={fmtTime(rental.cancelledAt)} />}
            {rental.handledBy && <InfoRow label="Handled By" value={rental.handledBy.name} />}
          </div>

          {/* Notes */}
          {rental.notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:col-span-2">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Notes</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{rental.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalDetail;
