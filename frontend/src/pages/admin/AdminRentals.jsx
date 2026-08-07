import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useRestoredPage from '../../hooks/useRestoredPage';
import { toast } from 'react-hot-toast';
import {
  FileText, ChevronLeft, ChevronRight,
  Eye, CheckCircle, Truck, RotateCcw, Calendar,
  Search, X, Activity,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import RentalStatusBadge from '../../components/rental/RentalStatusBadge';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { fetchRentals, updateRentalStatus } from '../../services/rentalService';
import { motion } from 'framer-motion';

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

const QUICK_ACTIONS = {
  pending: { label: 'Confirm', icon: CheckCircle, next: 'confirmed', variant: 'text-blue-600 hover:text-blue-700' },
  confirmed: { label: 'Check Out', icon: Truck, next: 'checked_out', variant: 'text-orange-600 hover:text-orange-700' },
  checked_out: { label: 'Return', icon: RotateCcw, next: 'returned', variant: 'text-emerald-600 hover:text-emerald-700' },
};

const RENTAL_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_out', label: 'Checked Out' },
  { value: 'returned', label: 'Returned' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useRestoredPage();
  const [updatingId, setUpdatingId] = useState(null);

  const loadRentals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchRentals({ page, limit: 15, status: statusFilter, search });
      setRentals(res.data.data.rentals);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load rentals.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { loadRentals(); }, [loadRentals]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

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
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-6">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 drop-shadow-sm pb-1">Rental Management</h1>
          <p className="text-slate-400 text-xs mt-1">
            {pagination.total} total rental{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-2.5 mb-5">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4558be] transition-colors duration-200" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by item, customer..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gradient-to-b from-white to-slate-50/80 border border-white !text-black placeholder-slate-400 text-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),inset_0_1px_3px_rgba(255,255,255,1)] focus:outline-none focus:ring-[3px] focus:ring-[#4558be]/20 focus:border-[#4558be]/30 hover:border-slate-200 transition-all duration-300"
              />
              {searchInput && (
                <button type="button" onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors duration-200">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-b from-[#6071dd] to-[#4558be] border border-[#7a8bea] text-white text-[13px] font-bold rounded-xl shadow-[0_2px_10px_-2px_rgba(69,88,190,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] hover:from-[#6a7be5] hover:to-[#4d61cf] hover:shadow-[0_5px_15px_-3px_rgba(69,88,190,0.6)] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#4558be]/30"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col sm:flex-row gap-3">
            <CustomDropdown
              icon={Activity}
              value={statusFilter}
              options={RENTAL_STATUSES}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
            />
          </div>
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
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 70, damping: 25 }}
              className="relative bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/40 ring-1 ring-white/[0.05]"
            >
              {/* Premium Top Edge Spotlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mix-blend-overlay" />
              
              {/* Diffused Ambient Glow */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-300/15 blur-[100px] rounded-full" />
              </div>
              <div className="relative z-10 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Item</th>
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
                          {/* Item */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-10 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                                {rental.item?.images?.[0] ? (
                                  <img src={rental.item.images[0].url} alt="" className="w-full h-full object-contain p-1" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">N/A</div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-200 max-w-[150px] truncate">{rental.item?.name}</p>
                                <p className="text-xs text-slate-500 font-mono">#{rental._id.slice(-6).toUpperCase()}</p>
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
                                <p className="text-sm text-slate-300 truncate max-w-[120px]">{rental.customer?.name}</p>
                                <p className="text-xs text-slate-500 truncate max-w-[120px]">{rental.customer?.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Dates */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span>{fmt(rental.startDate)}</span>
                              <span className="text-slate-600">→</span>
                              <span>{fmt(rental.endDate)}</span>
                            </div>
                            <p className="text-xs font-bold text-sky-400 mt-0.5 ml-4">
                              {rental.totalDays} day{rental.totalDays !== 1 ? 's' : ''}
                            </p>
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-primary-400">₹{rental.totalAmount.toFixed(2)}</p>
                            <p className="text-xs text-slate-500">+₹{rental.securityDeposit} dep.</p>
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
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-primary-600 text-slate-300 hover:text-white transition-all shadow-sm border border-slate-700 hover:border-primary-500 ml-2"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="text-xs font-bold tracking-wide">View</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

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
