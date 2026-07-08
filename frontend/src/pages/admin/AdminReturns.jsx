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
    excellent: 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
    good: 'bg-blue-900/40 text-blue-400 border-blue-800',
    fair: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    poor: 'bg-red-900/40 text-red-400 border-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${map[condition] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Return Records</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pagination.total} total return{pagination.total !== 1 ? 's' : ''} processed
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: '', label: 'All Returns' },
            { value: 'false', label: 'Clean Returns' },
            { value: 'true', label: 'Damaged' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setDamageFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                damageFilter === f.value
                  ? 'bg-primary-900/50 text-primary-400 border border-primary-800'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}
            >
              {f.value === 'true' && <AlertTriangle className="h-3.5 w-3.5" />}
              {f.value === 'false' && <CheckCircle className="h-3.5 w-3.5" />}
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
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Equipment</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Return Date</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Condition</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Damage</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Deposit Refund</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {returns.map((ret) => (
                      <tr key={ret._id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Equipment */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                              {ret.equipment?.images?.[0] ? (
                                <img src={ret.equipment.images[0].url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-slate-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-200 max-w-[160px] truncate">{ret.equipment?.name}</p>
                              <p className="text-xs text-slate-500 capitalize">{ret.equipment?.category?.replace(/-/g, ' ')}</p>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary-900/40 border border-primary-800 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-primary-400">
                                {ret.customer?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-slate-300">{ret.customer?.name}</p>
                              <p className="text-xs text-slate-500">{ret.customer?.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Return Date */}
                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-300">{fmt(ret.returnDate)}</p>
                          <p className="text-xs text-slate-500">by {ret.processedBy?.name}</p>
                        </td>

                        {/* Condition */}
                        <td className="px-5 py-4">
                          <ConditionBadge condition={ret.conditionAtReturn} />
                        </td>

                        {/* Damage */}
                        <td className="px-5 py-4">
                          {ret.isDamaged ? (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                              <span className="text-sm text-red-400 font-medium">
                                -${ret.damageCharges?.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                              <span className="text-sm text-emerald-400">Clean</span>
                            </div>
                          )}
                        </td>

                        {/* Deposit Refund */}
                        <td className="px-5 py-4">
                          <p className={`text-sm font-semibold ${ret.depositRefunded > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${ret.depositRefunded?.toFixed(2)}
                          </p>
                          {ret.depositDeducted > 0 && (
                            <p className="text-xs text-slate-500">Deducted: ${ret.depositDeducted?.toFixed(2)}</p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/admin/returns/${ret._id}`}
                            className="inline-flex items-center p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
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
