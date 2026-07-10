import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  RotateCcw, Eye, AlertTriangle, CheckCircle,
  ChevronLeft, ChevronRight, Package,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { fetchReturns } from '../../services/returnService';

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const ConditionBadge = ({ condition }) => {
  const map = {
    excellent: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border border-white/20',
    good: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20 border border-white/20',
    fair: 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20 border border-white/20',
    poor: 'bg-gradient-to-r from-red-500 to-rose-400 text-white shadow-md shadow-red-500/20 border border-white/20',
  };
  const cls = map[condition] || 'bg-gradient-to-r from-gray-500 to-slate-400 text-white shadow-md shadow-gray-500/20 border border-white/20';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cls}`}>
      {condition}
    </span>
  );
};

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [damageFilter, setDamageFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadReturns = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15 };
      if (damageFilter !== '') params.isDamaged = damageFilter;
      const res = await fetchReturns(params);
      setReturns(res.data.data.returns);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load return records.');
    } finally {
      setIsLoading(false);
    }
  }, [page, damageFilter]);

  useEffect(() => { loadReturns(); }, [loadReturns]);

  return (
    <div className="min-h-screen bg-[#d8d9e0] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-100">Return Records</h1>
          <p className="text-slate-400 text-xs mt-1">
            {pagination.total} total return{pagination.total !== 1 ? 's' : ''} processed
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          {[
            { value: '', label: 'All Returns' },
            { value: 'false', label: 'Clean Returns' },
            { value: 'true', label: 'Damaged' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setDamageFilter(f.value); setPage(1); }}
              className={`px-5 py-2 rounded-full text-[13px] transition-all duration-300 transform flex items-center gap-1.5 ${damageFilter === f.value
                ? 'bg-gradient-to-r from-[#4558be] to-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30 border border-indigo-400/50 -translate-y-0.5'
                : 'bg-white text-gray-600 font-semibold border border-gray-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5'
                }`}
            >
              {f.value === 'true' && <AlertTriangle className={`h-3.5 w-3.5 ${damageFilter === f.value ? 'text-white' : 'text-gray-400'}`} />}
              {f.value === 'false' && <CheckCircle className={`h-3.5 w-3.5 ${damageFilter === f.value ? 'text-white' : 'text-gray-400'}`} />}
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
        ) : returns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
              <RotateCcw className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No return records found</p>
            <p className="text-slate-600 text-sm mt-1">Returns will appear here after equipment is returned</p>
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
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Return Date</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Condition</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Damage</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Deposit Refund</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {returns.map((ret) => (
                      <tr key={ret._id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Equipment */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-10 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                              {ret.equipment?.images?.[0] ? (
                                <img src={ret.equipment.images[0].url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-4 w-4 text-slate-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-slate-200 max-w-[150px] truncate">{ret.equipment?.name}</p>
                              <p className="text-[11px] text-slate-500 capitalize">{ret.equipment?.category?.replace(/-/g, ' ')}</p>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-[#4558be]/10 border border-[#4558be]/20 text-[#4558be] font-bold flex items-center justify-center shrink-0">
                              <span className="text-[13px]">
                                {ret.customer?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-[13px] text-slate-300 truncate max-w-[120px]">{ret.customer?.name}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{ret.customer?.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Return Date */}
                        <td className="px-4 py-3">
                          <p className="text-[13px] text-slate-300">{fmt(ret.returnDate)}</p>
                          <p className="text-[11px] text-slate-500">by {ret.processedBy?.name}</p>
                        </td>

                        {/* Condition */}
                        <td className="px-4 py-3">
                          <div className="scale-90 origin-left"><ConditionBadge condition={ret.conditionAtReturn} /></div>
                        </td>

                        {/* Damage */}
                        <td className="px-4 py-3">
                          {ret.isDamaged ? (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                              <span className="text-[13px] text-red-400 font-medium">
                                -${ret.damageCharges?.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="text-[13px] text-emerald-600">Clean</span>
                            </div>
                          )}
                        </td>

                        {/* Deposit Refund */}
                        <td className="px-4 py-3">
                          <p className={`text-[13px] font-semibold ${ret.depositRefunded > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            ${ret.depositRefunded?.toFixed(2)}
                          </p>
                          {ret.depositDeducted > 0 && (
                            <p className="text-[11px] text-slate-500">Deducted: ${ret.depositDeducted?.toFixed(2)}</p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/admin/returns/${ret._id}`}
                            className="inline-flex items-center p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
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

export default AdminReturns;
