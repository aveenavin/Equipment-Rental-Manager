import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FileText, Search, X, ChevronLeft, ChevronRight,
  Eye, CheckCircle, Truck, RotateCcw, XCircle, Calendar, DollarSign, User,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import RentalStatusBadge from '../../components/rental/RentalStatusBadge';
import { fetchRentals, updateRentalStatus } from '../../services/rentalService';

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const QUICK_ACTIONS = {
  pending: { label: 'Confirm', icon: CheckCircle, next: 'confirmed', variant: 'text-blue-400 hover:text-blue-300' },
  confirmed: { label: 'Check Out', icon: Truck, next: 'checked_out', variant: 'text-primary-400 hover:text-primary-300' },
  checked_out: { label: 'Return', icon: RotateCcw, next: 'returned', variant: 'text-emerald-400 hover:text-emerald-300' },
};

const STATUS_TABS = ['', 'pending', 'confirmed', 'checked_out', 'returned', 'cancelled'];

const AdminRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const loadRentals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchRentals({ page, limit: 15, status: statusFilter });
      setRentals(res.data.data.rentals);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load rentals.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { loadRentals(); }, [loadRentals]);

  const handleQuickAction = async (rental, nextStatus) => {
    setUpdatingId(rental._id);
    try {
      await updateRentalStatus(rental._id, { status: nextStatus });
      toast.success(`Rental marked as ${nextStatus.replace('_', ' ')}.`);
      loadRentals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Rental Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pagination.total} total rental{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_TABS.map((s) => (
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

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
        ) : rentals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
              <FileText className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No rentals found</p>
            <p className="text-slate-600 text-sm mt-1">No rentals match the selected filter</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Equipment</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dates</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {rentals.map((rental) => {
                      const action = QUICK_ACTIONS[rental.status];
                      const isUpdating = updatingId === rental._id;

                      return (
                        <tr key={rental._id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Equipment */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                                {rental.equipment?.images?.[0] ? (
                                  <img src={rental.equipment.images[0].url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">N/A</div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-200 max-w-[160px] truncate">{rental.equipment?.name}</p>
                                <p className="text-xs text-slate-500 font-mono">#{rental._id.slice(-6).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary-900/40 border border-primary-800 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-primary-400">
                                  {rental.customer?.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-slate-300">{rental.customer?.name}</p>
                                <p className="text-xs text-slate-500">{rental.customer?.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Dates */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>{fmt(rental.startDate)}</span>
                              <span className="text-slate-600">→</span>
                              <span>{fmt(rental.endDate)}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 ml-5">
                              {rental.totalDays} day{rental.totalDays !== 1 ? 's' : ''}
                            </p>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-primary-400">${rental.totalAmount.toFixed(2)}</p>
                            <p className="text-xs text-slate-500">+${rental.securityDeposit} dep.</p>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <RentalStatusBadge status={rental.status} />
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-3">
                              {/* Quick status action */}
                              {action && (
                                <button
                                  onClick={() => handleQuickAction(rental, action.next)}
                                  disabled={isUpdating}
                                  className={`flex items-center gap-1 text-xs font-medium transition-colors ${action.variant} disabled:opacity-40`}
                                  title={action.label}
                                >
                                  {isUpdating ? (
                                    <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    React.createElement(action.icon, { className: 'h-3.5 w-3.5' })
                                  )}
                                  {action.label}
                                </button>
                              )}

                              <Link
                                to={`/admin/rentals/${rental._id}`}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-400">
                  Showing {(pagination.page - 1) * 15 + 1}–{Math.min(pagination.page * 15, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-slate-300 px-2">{pagination.page} / {pagination.pages}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= pagination.pages}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRentals;
