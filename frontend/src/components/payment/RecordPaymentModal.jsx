import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  X, IndianRupee, CreditCard, AlertCircle, 
  ArrowDownLeft, ArrowUpRight, Wallet, RotateCcw, 
  ShieldAlert, Calendar, FileText, CheckCircle2, Banknote, Landmark, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { recordPayment } from '../../services/paymentService';

const PAYMENT_TYPES = [
  { value: 'advance', label: 'Advance Payment', desc: 'Upfront partial payment', icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/50' },
  { value: 'balance', label: 'Balance Payment', desc: 'Remaining amount due', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/50' },
  { value: 'damage_charge', label: 'Damage Charge', desc: 'Charge for damage incurred', icon: ShieldAlert, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-500/50' },
  { value: 'deposit_refund', label: 'Deposit Refund', desc: 'Return security deposit', icon: RotateCcw, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-500/50' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Landmark },
  { value: 'online', label: 'Online', icon: Smartphone },
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

  // Initial setup based on summary
  useEffect(() => {
    if (summary?.balance > 0) {
      setAmount(summary.balance.toFixed(2));
    }
  }, [summary]);

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
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid payment amount greater than 0.');
      return;
    }

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
      setIsSubmitting(false);
    }
  };

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Ambient Top Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary-500/20 blur-[60px] pointer-events-none rounded-full" />

          {/* Header */}
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 shadow-[0_0_20px_rgba(var(--color-primary-500),0.15)]">
                <IndianRupee className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">Record Payment</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-slate-400">Balance due:</p>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold tracking-wide ${summary?.balance > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    ₹{(summary?.balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Form Area */}
          <div className="overflow-y-auto custom-scrollbar flex-1 p-8">
            <form id="payment-form" onSubmit={handleSubmit} className="space-y-8">
              
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment Type Selection (Cards) */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 tracking-wide uppercase">Payment Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_TYPES.map((t) => {
                    const isSelected = paymentType === t.value;
                    const Icon = t.icon;
                    return (
                      <div
                        key={t.value}
                        onClick={() => handleTypeChange(t.value)}
                        className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                          isSelected 
                            ? `bg-slate-800 border-primary-500 shadow-[0_0_15px_rgba(var(--color-primary-500),0.15)]` 
                            : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start gap-3 relative z-10">
                          <div className={`p-2 rounded-xl transition-colors duration-300 ${isSelected ? t.bg : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                            <Icon className={`h-5 w-5 ${isSelected ? t.color : 'text-slate-400 group-hover:text-slate-300'}`} />
                          </div>
                          <div>
                            <h3 className={`text-sm font-semibold mb-0.5 transition-colors duration-300 ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                              {t.label}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-1">{t.desc}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div 
                            layoutId="activeType" 
                            className="absolute inset-0 rounded-2xl border-2 border-primary-500 pointer-events-none" 
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} 
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Amount & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-300 tracking-wide uppercase">Amount</label>
                    {/* Direction Indicator */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                      direction === 'inbound' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {direction === 'inbound' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {direction}
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IndianRupee className="h-5 w-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                    </div>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-slate-100 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-slate-600 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-300 tracking-wide uppercase">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((m) => {
                      const Icon = m.icon;
                      const isSelected = paymentMethod === m.value;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setPaymentMethod(m.value)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                              : 'bg-slate-900/50 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200'
                          }`}
                        >
                          <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? 'text-primary-400' : 'text-slate-500'}`} />
                          <span className={`text-xs font-medium ${isSelected ? 'text-primary-400' : 'text-slate-300'}`}>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Calendar className="h-4 w-4 text-slate-500" /> Payment Date
                  </label>
                  <input
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <FileText className="h-4 w-4 text-slate-500" /> Transaction ID <span className="opacity-50">(opt.)</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Bank ref, Cheque no..."
                    maxLength={100}
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 ml-1">Notes / Remarks <span className="opacity-50">(opt.)</span></label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional details about this transaction..."
                  maxLength={500}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/80 rounded-xl text-slate-200 text-sm placeholder:text-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

            </form>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-slate-800/50 bg-slate-900/80 backdrop-blur-md flex items-center justify-end gap-3 shrink-0">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border-none rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              form="payment-form" 
              type="submit" 
              variant="primary" 
              isLoading={isSubmitting}
              className="px-8 py-2.5 rounded-xl shadow-lg shadow-primary-500/20"
            >
              Confirm Payment
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RecordPaymentModal;
