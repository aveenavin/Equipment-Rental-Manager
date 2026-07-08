import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  DollarSign, ArrowDownLeft, ArrowUpRight, CreditCard,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { fetchPayments } from '../../services/paymentService';

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const TYPE_CONFIG = {
  advance: { label: 'Advance', cls: 'bg-blue-900/40 text-blue-400 border-blue-800' },
  balance: { label: 'Balance', cls: 'bg-emerald-900/40 text-emerald-400 border-emerald-800' },
  damage_charge: { label: 'Damage', cls: 'bg-red-900/40 text-red-400 border-red-800' },
  deposit_refund: { label: 'Deposit Refund', cls: 'bg-yellow-900/40 text-yellow-400 border-yellow-800' },
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
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20 };
      if (typeFilter) params.paymentType = typeFilter;
      const res = await fetchPayments(params);
      setPayments(res.data.data.payments);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load payments.');
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => { load(); }, [load]);

  // Revenue stats
  const inboundTotal = payments.filter((p) => p.direction === 'inbound').reduce((s, p) => s + p.amount, 0);
  const outboundTotal = payments.filter((p) => p.direction === 'outbound').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Payment Ledger</h1>
          <p className="text-slate-400 text-sm mt-1">{pagination.total} total transaction{pagination.total !== 1 ? 's' : ''}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Total Collected</p>
            <p className="text-xl font-bold text-emerald-400">${inboundTotal.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Total Refunded</p>
            <p className="text-xl font-bold text-red-400">${outboundTotal.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Net Revenue</p>
            <p className="text-xl font-bold text-primary-400">${(inboundTotal - outboundTotal).toFixed(2)}</p>
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_TABS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setTypeFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === f.value
                  ? 'bg-primary-900/50 text-primary-400 border border-primary-800'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
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
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
              <DollarSign className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-slate-400">No payments found</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Method</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Recorded By</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {payments.map((p) => {
                      const typeCfg = TYPE_CONFIG[p.paymentType] || { label: p.paymentType, cls: 'bg-slate-800 text-slate-400 border-slate-700' };
                      return (
                        <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary-900/40 border border-primary-800 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-primary-400">
                                  {p.customer?.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-slate-300">{p.customer?.name}</p>
                                <p className="text-xs text-slate-500">{p.customer?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeCfg.cls}`}>
                              {typeCfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-400 flex items-center gap-1.5">
                              <span>{METHOD_ICONS[p.paymentMethod]}</span>
                              <span className="capitalize">{p.paymentMethod?.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-300">{fmt(p.paidAt)}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-400">{p.recordedBy?.name}</p>
                            <p className="text-xs text-slate-600">{p.recordedBy?.role}</p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className={`flex items-center justify-end gap-1.5 font-semibold ${p.direction === 'outbound' ? 'text-red-400' : 'text-emerald-400'}`}>
                              {p.direction === 'outbound'
                                ? <ArrowUpRight className="h-3.5 w-3.5" />
                                : <ArrowDownLeft className="h-3.5 w-3.5" />}
                              ${p.amount.toFixed(2)}
                            </div>
                            {p.transactionId && (
                              <p className="text-xs font-mono text-slate-600 mt-0.5">{p.transactionId}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-400">
                  Showing {(pagination.page - 1) * 20 + 1}–{Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-slate-300 px-2">{pagination.page} / {pagination.pages}</span>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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
