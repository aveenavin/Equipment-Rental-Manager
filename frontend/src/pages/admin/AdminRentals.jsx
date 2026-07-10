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
  pending: { label: 'Confirm', icon: CheckCircle, next: 'confirmed', variant: 'text-blue-600 hover:text-blue-700' },
  confirmed: { label: 'Check Out', icon: Truck, next: 'checked_out', variant: 'text-orange-600 hover:text-orange-700' },
  checked_out: { label: 'Return', icon: RotateCcw, next: 'returned', variant: 'text-emerald-600 hover:text-emerald-700' },
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
    <div className="min-h-screen bg-[#d8d9e0] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-100">Rental Management</h1>
          <p className="text-slate-400 text-xs mt-1">
            {pagination.total} total rental{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-5 py-2 rounded-full text-[13px] transition-all duration-300 transform ${statusFilter === s
                ? 'bg-gradient-to-r from-[#4558be] to-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30 border border-indigo-400/50 -translate-y-0.5'
                : 'bg-white text-gray-600 font-semibold border border-gray-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5'
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
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Equipment</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dates</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {rentals.map((rental) => {
                      const action = QUICK_ACTIONS[rental.status];
                      const isUpdating = updatingId === rental._id;

                      return (
                        <tr key={rental._id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Equipment */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-10 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                                {rental.equipment?.images?.[0] ? (
                                  <img src={rental.equipment.images[0].url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">N/A</div>
                                )}
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-slate-200 max-w-[150px] truncate">{rental.equipment?.name}</p>
                                <p className="text-[11px] text-slate-500 font-mono">#{rental._id.slice(-6).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-[#4558be]/10 border border-[#4558be]/20 text-[#4558be] font-bold flex items-center justify-center shrink-0">
                                <span className="text-[13px]">
                                  {rental.customer?.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-[13px] text-slate-300 truncate max-w-[120px]">{rental.customer?.name}</p>
                                <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{rental.customer?.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Dates */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span>{fmt(rental.startDate)}</span>
                              <span className="text-slate-600">→</span>
                              <span>{fmt(rental.endDate)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 ml-4">
                              {rental.totalDays} day{rental.totalDays !== 1 ? 's' : ''}
                            </p>
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3">
                            <p className="text-[13px] font-semibold text-primary-400">${rental.totalAmount.toFixed(2)}</p>
                            <p className="text-[11px] text-slate-500">+${rental.securityDeposit} dep.</p>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <div className="scale-90 origin-left"><RentalStatusBadge status={rental.status} /></div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {/* Quick status action */}
                              {action && (
                                <button
                                  onClick={() => handleQuickAction(rental, action.next)}
                                  disabled={isUpdating}
                                  className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${action.variant} disabled:opacity-40`}
                                  title={action.label}
                                >
                                  {isUpdating ? (
                                    <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    React.createElement(action.icon, { className: 'h-3 w-3' })
                                  )}
                                  {action.label}
                                </button>
                              )}

                              <Link
                                to={`/admin/rentals/${rental._id}`}
                                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors ml-1"
                                title="View details"
                              >
                                <Eye className="h-3.5 w-3.5" />
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
