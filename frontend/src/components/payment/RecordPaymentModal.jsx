import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { X, IndianRupee, CreditCard, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Button from '../ui/Button';
import { recordPayment } from '../../services/paymentService';

const PAYMENT_TYPES = [
  { value: 'advance', label: 'Advance Payment', desc: 'Upfront partial payment' },
  { value: 'balance', label: 'Balance Payment', desc: 'Remaining amount due' },
  { value: 'damage_charge', label: 'Damage Charge', desc: 'Charge for damage incurred' },
  { value: 'deposit_refund', label: 'Deposit Refund', desc: 'Return security deposit' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'online', label: 'Online' },
];

const RecordPaymentModal = ({ rental, summary, onClose, onRecorded }) => {
  const [paymentType, setPaymentType] = useState('balance');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState('inbound');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-set direction based on type
  const handleTypeChange = (type) => {
    setPaymentType(type);
    setDirection(type === 'deposit_refund' ? 'outbound' : 'inbound');
    if (type === 'balance' && summary?.balance > 0) {
      setAmount(summary.balance.toFixed(2));
    } else if (type === 'deposit_refund') {
      setAmount((rental.securityDeposit || 0).toFixed(2));
    } else {
      setAmount('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || parseFloat(amount) <= 0) return setError('Enter a valid payment amount.');

    setIsSubmitting(true);
    try {
      await recordPayment({
        rentalId: rental._id,
        amount: parseFloat(amount),
        paymentType,
        paymentMethod,
        direction,
        transactionId: transactionId || undefined,
        paidAt,
        notes: notes || undefined,
      });
      toast.success('Payment recorded successfully.');
      onRecorded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-900/30 border border-primary-800">
              <IndianRupee className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Record Payment</h2>
              <p className="text-xs text-slate-400">Balance due: <span className={summary?.balance > 0 ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>₹{(summary?.balance || 0).toFixed(2)}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Payment Type <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                    paymentType === t.value
                      ? 'bg-primary-900/40 border-primary-600 text-primary-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Direction toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Direction:</span>
            <div className="flex rounded-lg overflow-hidden border border-slate-700">
              <button
                type="button"
                onClick={() => setDirection('inbound')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${direction === 'inbound' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
              >
                <ArrowDownLeft className="h-3.5 w-3.5" /> Inbound
              </button>
              <button
                type="button"
                onClick={() => setDirection('outbound')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l border-slate-700 ${direction === 'outbound' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" /> Outbound
              </button>
            </div>
          </div>

          {/* Amount + Method row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (₹) <span className="text-red-400">*</span></label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Method <span className="text-red-400">*</span></label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date + Transaction ID row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Payment Date</label>
              <input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Transaction ID <span className="text-slate-600">(opt.)</span></label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Bank ref, card ID..."
                maxLength={100}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes <span className="text-slate-600">(opt.)</span></label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this payment..."
              maxLength={500}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
              Record Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
