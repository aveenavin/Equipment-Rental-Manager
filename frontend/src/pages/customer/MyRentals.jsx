import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Calendar, Package, ChevronRight, XCircle, FileText,
  ArrowRight, DollarSign,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import RentalStatusBadge from '../../components/rental/RentalStatusBadge';
import { fetchRentals, cancelRental } from '../../services/rentalService';

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">My Rentals</h1>
            <p className="text-slate-400 text-sm mt-1">{pagination.total} total rental{pagination.total !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/catalog">
            <Button variant="primary" className="flex items-center gap-2">
              Browse Equipment <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['', 'pending', 'confirmed', 'checked_out', 'returned', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary-900/50 text-primary-400 border border-primary-800'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}
            >
              {s === '' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Rentals list */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Spinner size="lg" />
          </div>
        ) : rentals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
              <FileText className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No rentals found</p>
            <p className="text-slate-600 text-sm mt-1">
              {statusFilter ? 'No rentals with this status' : 'You haven\'t made any bookings yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rentals.map((rental) => (
              <div key={rental._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Equipment thumbnail */}
                  <div className="h-20 w-24 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                    {rental.equipment?.images?.[0] ? (
                      <img src={rental.equipment.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-100 text-sm">{rental.equipment?.name}</h3>
                        <p className="text-xs text-slate-500 capitalize">{rental.equipment?.category?.replace(/-/g, ' ')}</p>
                      </div>
                      <RentalStatusBadge status={rental.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {fmt(rental.startDate)} — {fmt(rental.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> ${rental.totalAmount} total ({rental.totalDays} day{rental.totalDays !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 items-center sm:items-end justify-end shrink-0">
                    <Link to={`/my-rentals/${rental._id}`}>
                      <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors">
                        Details <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                    {rental.status === 'pending' && (
                      <button
                        onClick={() => setCancelTarget(rental)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <span className="text-sm text-slate-400 px-3">{pagination.page} / {pagination.pages}</span>
                <Button variant="secondary" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirm */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-900/30 border border-red-800">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-slate-100">Cancel Rental</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Cancel your booking for <span className="text-slate-200 font-medium">"{cancelTarget.equipment?.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setCancelTarget(null)} disabled={isCancelling}>Keep it</Button>
              <Button variant="danger" isLoading={isCancelling} onClick={handleCancel}>Cancel Rental</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRentals;
