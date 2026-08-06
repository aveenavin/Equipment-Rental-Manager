import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import useRestoredPage from '../../hooks/useRestoredPage';
import { toast } from 'react-hot-toast';
import {
  Search, X, Users, Eye, Pencil, Trash2,
  UserCheck, UserX, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { useAuth } from '../../context/AuthContext';
import { fetchCustomers, deleteCustomer, updateCustomer } from '../../services/customerService';
import { motion } from 'framer-motion';

const StatusPill = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${status === 'active'
    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border border-white/20'
    : 'bg-gradient-to-r from-red-500 to-rose-400 text-white shadow-md shadow-red-500/20 border border-white/20'
    }`}>
    {status === 'active' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
    {status === 'active' ? 'Active' : 'Suspended'}
  </span>
);

const EditModal = ({ customer, onClose, onSaved }) => {
  const { isAdmin } = useAuth();
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone || '');
  const [status, setStatus] = useState(customer.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { name, phone: phone || null };
      if (isAdmin) payload.status = status;
      await updateCustomer(customer._id, payload);
      toast.success('Customer updated.');
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">Edit Customer</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" isLoading={saving} onClick={handleSave}>Save changes</Button>
        </div>
      </div>
    </div>
  );
};

const CustomerList = () => {
  const { isAdmin } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useRestoredPage();

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchCustomers({ page, limit: 15, search, status: statusFilter });
      setCustomers(res.data.data.customers);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load customers.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const prevPageRef = useRef(page);
  useEffect(() => {
    if (prevPageRef.current === page) return;
    prevPageRef.current = page;
    const main = document.getElementById('main-content');
    if (main) main.scrollTop = 0;
  }, [page]);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deleteTarget._id);
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#d8d9e0] text-slate-100">
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600 drop-shadow-sm pb-1">Customer Directory</h1>
            <p className="text-slate-400 text-xs mt-1">
              {pagination.total} registered customer{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4558be] transition-colors duration-200" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search customers"
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

          <div className="w-full md:w-[170px]">
            <CustomDropdown
              icon={Activity}
              value={statusFilter}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' }
              ]}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Spinner size="lg" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
              <Users className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No customers found</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your search or filters</p>
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
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {customers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[#4558be]/10 border border-[#4558be]/20 text-[#4558be] font-bold flex items-center justify-center shrink-0">
                              <span className="text-[13px]">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-200 text-sm truncate max-w-[150px]">{customer.name}</p>
                              <p className="text-xs text-slate-500 font-mono">{customer._id.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-300 truncate max-w-[150px]">{customer.email}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{customer.phone || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="scale-90 origin-left"><StatusPill status={customer.status} /></div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-400">
                            {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/admin/customers/${customer._id}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-primary-600 text-slate-300 hover:text-white transition-all shadow-sm border border-slate-700 hover:border-primary-500"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-xs font-bold tracking-wide">View</span>
                            </Link>
                            <button
                              onClick={() => setEditTarget(customer)}
                              className="p-1.5 rounded-md bg-slate-800 hover:bg-primary-900/50 text-slate-400 hover:text-primary-400 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => setDeleteTarget(customer)}
                                className="p-1.5 rounded-md bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
                  <span className="text-sm text-slate-300 px-2">
                    {pagination.page} / {pagination.pages}
                  </span>
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

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          customer={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); loadCustomers(); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-900/30 border border-red-800">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-slate-100">Delete Customer</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Permanently delete <span className="text-slate-200 font-medium">"{deleteTarget.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
