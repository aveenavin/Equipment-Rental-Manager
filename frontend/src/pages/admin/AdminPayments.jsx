import React, { useState, useEffect, useCallback } from 'react';
import useRestoredPage from '../../hooks/useRestoredPage';
import { toast } from 'react-hot-toast';
import {
  IndianRupee, ArrowDownLeft, ArrowUpRight,
  ChevronLeft, ChevronRight, Search, X,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { fetchPayments } from '../../services/paymentService';
import { motion } from 'framer-motion';

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

const TYPE_CONFIG = {
  advance: { label: 'Advance', cls: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20 border border-white/20' },
  balance: { label: 'Balance', cls: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border border-white/20' },
  damage_charge: { label: 'Damage', cls: 'bg-gradient-to-r from-red-500 to-rose-400 text-white shadow-md shadow-red-500/20 border border-white/20' },
  deposit_refund: { label: 'Deposit Refund', cls: 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20 border border-white/20' },
};

const METHOD_ICONS = {
  cash: '💵',
  card: '💳',
  bank_transfer: '🏦',
  online: '🌐',
};

const FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'advance', label: 'Advance' },
  { value: 'balance', label: 'Balance' },
  { value: 'damage_charge', label: 'Damage' },
  { value: 'deposit_refund', label: 'Refunds' },
];

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useRestoredPage();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20 };
      if (typeFilter) params.paymentType = typeFilter;
      if (search) params.search = search;
      const res = await fetchPayments(params);
      setPayments(res.data.data.payments);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load payments.');
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter, search]);

  useEffect(() => { load(); }, [load]);

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

  // Revenue stats
  const inboundTotal = payments.filter((p) => p.direction === 'inbound').reduce((s, p) => s + p.amount, 0);
  const outboundTotal = payments.filter((p) => p.direction === 'outbound').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen bg-[#d8d9e0] text-gray-800">
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-6">

        <div className="mb-5">
          <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 drop-shadow-sm pb-1">Payment Ledger</h1>
          <p className="text-gray-500 text-xs mt-1">{pagination.total} total transaction{pagination.total !== 1 ? 's' : ''}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-white border border-orange-200 rounded-xl p-3.5 shadow-sm min-w-0">
            <p className="text-[11px] text-gray-500 mb-0.5 truncate">Total Collected</p>
            <p className="text-lg font-bold text-emerald-600 truncate">₹{inboundTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-orange-200 rounded-xl p-3.5 shadow-sm min-w-0">
            <p className="text-[11px] text-gray-500 mb-0.5 truncate">Total Refunded</p>
            <p className="text-lg font-bold text-red-500 truncate">₹{outboundTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-orange-200 rounded-xl p-3.5 shadow-sm min-w-0">
            <p className="text-[11px] text-gray-500 mb-0.5 truncate">Net Revenue</p>
            <p className="text-lg font-bold text-orange-600 truncate">₹{(inboundTotal - outboundTotal).toFixed(2)}</p>
          </div>
        </div>

        {/* Search & Type filter tabs */}
        <div className="flex flex-col md:flex-row gap-2.5 mb-5">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4558be] transition-colors duration-200" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by customer name or email..."
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
        </div>

        <div className="flex flex-wrap gap-2.5 mb-6">
          {FILTER_TABS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setTypeFilter(f.value); setPage(1); }}
              className={`px-5 py-2 rounded-full text-[13px] transition-all duration-300 transform ${typeFilter === f.value
                ? 'bg-gradient-to-r from-[#4558be] to-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30 border border-indigo-400/50 -translate-y-0.5'
                : 'bg-white text-gray-600 font-semibold border border-gray-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="p-4 rounded-2xl bg-white border border-orange-200 mb-4 shadow-sm">
              <IndianRupee className="h-10 w-10 text-orange-300" />
            </div>
            <p className="text-gray-400">No payments found</p>
          </div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
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
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Method</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recorded By</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {payments.map((p) => {
                      const typeCfg = TYPE_CONFIG[p.paymentType] || { label: p.paymentType, cls: 'bg-gradient-to-r from-gray-500 to-slate-400 text-white shadow-md shadow-gray-500/20 border border-white/20' };
                      return (
                        <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-[#4558be]/10 border border-[#4558be]/20 text-[#4558be] font-bold flex items-center justify-center shrink-0">
                                <span className="text-[13px]">
                                  {p.customer?.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-slate-200 truncate max-w-[120px]">{p.customer?.name}</p>
                                <p className="text-xs text-slate-500 truncate max-w-[120px]">{p.customer?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="scale-90 origin-left">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${typeCfg.cls}`}>
                                {typeCfg.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-400 flex items-center gap-1.5">
                              <span>{METHOD_ICONS[p.paymentMethod]}</span>
                              <span className="capitalize">{p.paymentMethod?.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-300">{fmt(p.paidAt)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-300">{p.recordedBy?.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{p.recordedBy?.role}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className={`flex items-center justify-end gap-1.5 font-semibold text-sm ${p.direction === 'outbound' ? 'text-red-400' : 'text-emerald-400'}`}>
                              {p.direction === 'outbound'
                                ? <ArrowUpRight className="h-3 w-3" />
                                : <ArrowDownLeft className="h-3 w-3" />}
                              ₹{p.amount.toFixed(2)}
                            </div>
                            {p.transactionId && (
                              <p className="text-xs font-mono text-slate-500 mt-0.5">{p.transactionId}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * 20 + 1}–{Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                    className="p-2 rounded-lg bg-white border border-orange-300 text-gray-500 hover:text-orange-700 hover:border-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600 px-2">{pagination.page} / {pagination.pages}</span>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages}
                    className="p-2 rounded-lg bg-white border border-orange-300 text-gray-500 hover:text-orange-700 hover:border-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
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

export default AdminPayments;
