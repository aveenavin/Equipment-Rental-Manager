import React, { useState, useEffect, useCallback } from 'react';
import useRestoredPage from '../../hooks/useRestoredPage';
import { toast } from 'react-hot-toast';
import {
  Wrench, CheckCircle, ChevronLeft, ChevronRight,
  Package, Plus, X, ClipboardList,
  Search, Activity,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import CustomDropdown from '../../components/ui/CustomDropdown';
import {
  fetchMaintenanceLogs,
  createMaintenanceLog,
  completeMaintenanceLog,
} from '../../services/maintenanceService';
import api from '../../services/api';
import { motion } from 'framer-motion';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

// ─── Priority Badge ────────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const map = {
    high: 'bg-gradient-to-r from-red-500 to-rose-400 text-white shadow-md shadow-red-500/20 border border-white/20',
    medium: 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20 border border-white/20',
    low: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20 border border-white/20',
  };
  const cls = map[priority] || map.medium;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cls}`}>
      {priority}
    </span>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isOpen = status === 'open';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
      isOpen
        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/20 border border-white/20'
        : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border border-white/20'
    }`}>
      {isOpen ? <Wrench className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
      {isOpen ? 'Open' : 'Completed'}
    </span>
  );
};

// ─── Create Log Modal ──────────────────────────────────────────────────────────
const CreateLogModal = ({ onClose, onCreated }) => {
  const [itemList, setItemList] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    itemId: '',
    description: '',
    priority: 'medium',
    estimatedCost: '',
    scheduledDate: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/items', { params: { limit: 100, status: 'available,maintenance,rented' } });
        setItemList(res.data.data.items || []);
      } catch {
        toast.error('Failed to load item list.');
      } finally {
        setLoadingItems(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemId) return toast.error('Please select an item.');
    if (!form.description.trim()) return toast.error('Description is required.');

    setSubmitting(true);
    try {
      await createMaintenanceLog({
        itemId: form.itemId,
        description: form.description,
        priority: form.priority,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : null,
        scheduledDate: form.scheduledDate || null,
      });
      toast.success('Maintenance log created.');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create maintenance log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-400" />
            <h2 className="text-base font-bold text-slate-100">New Maintenance Log</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Item select */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Item *</label>
            {loadingItems ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm"><Spinner size="sm" /> Loading…</div>
            ) : (
              <select
                name="itemId"
                value={form.itemId}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
                required
              >
                <option value="">Select item…</option>
                {itemList.map((eq) => (
                  <option key={eq._id} value={eq._id}>
                    {eq.name} — {eq.status}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              maxLength={2000}
              placeholder="Describe the issue requiring maintenance…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 resize-none"
              required
            />
          </div>

          {/* Priority + Estimated Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Est. Cost (₹)</label>
              <input
                type="number"
                name="estimatedCost"
                value={form.estimatedCost}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              />
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Scheduled Date</label>
            <input
              type="date"
              name="scheduledDate"
              value={form.scheduledDate}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={submitting || loadingEquip}>
              {submitting ? <Spinner size="sm" /> : 'Create Log'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Complete Log Modal ────────────────────────────────────────────────────────
const CompleteLogModal = ({ log, onClose, onCompleted }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ technicianNotes: '', actualCost: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await completeMaintenanceLog(log._id, {
        technicianNotes: form.technicianNotes,
        actualCost: form.actualCost ? parseFloat(form.actualCost) : null,
      });
      toast.success('Maintenance log completed. Item is now available.');
      onCompleted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Complete Maintenance Log</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item summary */}
        <div className="mx-6 mt-4 px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Item</p>
          <p className="text-sm font-semibold text-slate-100">{log.item?.name}</p>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{log.description}</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Technician Notes (optional)</label>
            <textarea
              name="technicianNotes"
              value={form.technicianNotes}
              onChange={handleChange}
              rows={4}
              maxLength={2000}
              placeholder="Describe the work completed, parts replaced, or resolution…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 resize-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Actual Cost (₹)</label>
            <input
              type="number"
              name="actualCost"
              value={form.actualCost}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : 'Mark Complete'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const MAINTENANCE_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'completed', label: 'Completed' },
];

const MaintenanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useRestoredPage();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15, search };
      if (statusFilter) params.status = statusFilter;
      const res = await fetchMaintenanceLogs(params);
      setLogs(res.data.data.logs);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load maintenance logs.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

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

  const handleCreated = () => {
    setShowCreateModal(false);
    setPage(1);
    setStatusFilter('open');
    loadLogs();
  };

  const handleCompleted = () => {
    setCompleteTarget(null);
    loadLogs();
  };

  return (
    <div className="min-h-screen bg-[#d8d9e0]">
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 drop-shadow-sm pb-1">Maintenance Logs</h1>
            <p className="text-slate-500 text-xs mt-1">
              {pagination.total} total log{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            New Log
          </Button>
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
                placeholder="Search by item, description..."
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
              options={MAINTENANCE_STATUSES}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
              <ClipboardList className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-slate-500 font-medium">No maintenance logs found</p>
            <p className="text-slate-400 text-sm mt-1">
              Create a log when an item needs servicing
            </p>
          </div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
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
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reported By</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Scheduled</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cost</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Item */}
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-8 sm:h-8 sm:w-10 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                              {log.item?.images?.[0] ? (
                                <img
                                  src={log.item.images[0].url}
                                  alt={log.item.name}
                                  className="h-full w-full object-contain p-0.5 sm:p-1"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-tight">{log.item?.name}</p>
                              <p className="text-[10px] sm:text-[11px] text-slate-500 capitalize">{log.item?.category?.replace(/-/g, ' ')}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={log.status} />
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-3">
                          <PriorityBadge priority={log.priority} />
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="text-sm text-slate-300 truncate" title={log.description}>
                            {log.description}
                          </p>
                          {log.triggeredByReturn && (
                            <span className="inline-block mt-0.5 text-[10px] text-rose-400 font-semibold uppercase tracking-wide">
                              ⚠ From return
                            </span>
                          )}
                        </td>

                        {/* Reported By */}
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-300">{log.reportedBy?.name || '—'}</p>
                          <p className="text-[11px] text-slate-500 capitalize">{log.reportedBy?.role}</p>
                        </td>

                        {/* Scheduled Date */}
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-300">{fmt(log.scheduledDate)}</p>
                          {log.completedAt && (
                            <p className="text-[11px] text-emerald-400">Done {fmt(log.completedAt)}</p>
                          )}
                        </td>

                        {/* Cost */}
                        <td className="px-4 py-3">
                          {log.status === 'completed' && log.actualCost != null ? (
                            <p className="text-sm font-semibold text-emerald-400">
                              ₹{log.actualCost.toFixed(2)}
                            </p>
                          ) : log.estimatedCost != null ? (
                            <p className="text-sm text-slate-400">
                              ~₹{log.estimatedCost.toFixed(2)}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-600">—</p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          {log.status === 'open' && (
                            <button
                              onClick={() => setCompleteTarget(log)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Complete
                            </button>
                          )}
                          {log.status === 'completed' && (
                            <span className="text-[12px] text-slate-600 font-medium">Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-slate-500">
                  Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-2 text-sm text-slate-300 font-medium">
                    {page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateLogModal onClose={() => setShowCreateModal(false)} onCreated={handleCreated} />
      )}
      {completeTarget && (
        <CompleteLogModal
          log={completeTarget}
          onClose={() => setCompleteTarget(null)}
          onCompleted={handleCompleted}
        />
      )}
    </div>
  );
};

export default MaintenanceLogs;
