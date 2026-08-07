import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, CheckCircle, Package,
  IndianRupee, ClipboardList, Calendar, ShieldCheck, Wrench
} from 'lucide-react';
import Button from '../ui/Button';
import { processReturn } from '../../services/returnService';

const CONDITIONS = [
  { value: 'excellent', label: 'Excellent', desc: 'Like new, no wear', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { value: 'good', label: 'Good', desc: 'Minor wear, fully functional', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { value: 'fair', label: 'Fair', desc: 'Visible wear, functional', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { value: 'poor', label: 'Poor', desc: 'Heavy wear or damage', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
];

const ProcessReturnModal = ({ rental, onClose, onProcessed }) => {
  const [conditionAtReturn, setConditionAtReturn] = useState('good');
  const [isDamaged, setIsDamaged] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [damageCharges, setDamageCharges] = useState('');
  const [notes, setNotes] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const securityDeposit = rental.securityDeposit || 0;
  const charges = isDamaged ? parseFloat(damageCharges || 0) : 0;
  const depositDeducted = Math.min(charges, securityDeposit);
  const depositRefunded = Math.max(0, securityDeposit - depositDeducted);
  const itemStatusAfterReturn = isDamaged ? 'maintenance' : 'available';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!conditionAtReturn) return setError('Please select the item condition.');
    if (isDamaged && !damageDescription.trim()) return setError('Damage description is required when item is damaged.');

    setIsSubmitting(true);
    try {
      await processReturn({
        rentalId: rental._id,
        conditionAtReturn,
        isDamaged,
        damageDescription: isDamaged ? damageDescription : undefined,
        damageCharges: isDamaged ? charges : 0,
        notes: notes || undefined,
        returnDate,
      });
      toast.success('Return processed successfully.');
      onProcessed();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process return. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="relative overflow-hidden px-8 py-6 border-b border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent pointer-events-none" />
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 shadow-inner">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 tracking-tight drop-shadow-sm uppercase">Item Return</h2>
                <p className="text-sm font-medium text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" /> {rental.item?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
                  >
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Actual Return Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all group bg-slate-950/30 border-slate-700/50 hover:bg-slate-800/50 h-[46px]">
                    <div
                      onClick={() => setIsDamaged(!isDamaged)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${isDamaged ? 'bg-red-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isDamaged ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className={`text-sm font-bold ${isDamaged ? 'text-red-400' : 'text-slate-300 group-hover:text-white transition-colors'}`}>
                      Report Damage
                    </span>
                  </label>
                </div>
              </div>

              {/* Condition Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Item Condition <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {CONDITIONS.map((c) => {
                    const isSelected = conditionAtReturn === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setConditionAtReturn(c.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? `${c.bg} ${c.border} shadow-lg ring-1 ring-inset ring-${c.border.split('-')[1]}`
                            : 'bg-slate-950/30 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
                        }`}
                      >
                        <p className={`text-sm font-bold ${isSelected ? c.color : 'text-slate-300'}`}>{c.label}</p>
                        <p className={`text-[10px] leading-tight mt-1 ${isSelected ? c.color.replace('400', '400/70') : 'text-slate-500'}`}>{c.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Damage Details Area */}
              <AnimatePresence>
                {isDamaged && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-5">
                      <div className="flex items-center gap-2 text-red-400 font-bold tracking-tight">
                        <AlertTriangle className="h-5 w-5" /> Damage Report Details
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Description <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={damageDescription}
                            onChange={(e) => setDamageDescription(e.target.value)}
                            placeholder="What exactly is damaged?"
                            maxLength={1000}
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-red-900/50 text-slate-200 placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Charges (₹)
                          </label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500/70 pointer-events-none" />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={damageCharges}
                              onChange={(e) => setDamageCharges(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-red-900/50 text-red-100 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Financial Summary & Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Additional Notes</label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any other observations..."
                    maxLength={500}
                    className="w-full h-[120px] px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700/50 text-slate-200 placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                  />
                </div>

                {/* Return Summary */}
                <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <ClipboardList className="h-4 w-4 text-slate-500" /> Settlement Summary
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-400">Security Deposit</span>
                        <span className="text-slate-200 bg-slate-950 px-2 py-1 rounded-md">₹{securityDeposit.toFixed(2)}</span>
                      </div>
                      <AnimatePresence>
                        {isDamaged && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="flex justify-between items-center text-sm font-medium py-1">
                              <span className="text-red-400/80">Damage Deductions</span>
                              <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">-₹{depositDeducted.toFixed(2)}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-slate-300">Total Refund</span>
                      <span className={`text-2xl font-black tracking-tight ${depositRefunded > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        ₹{depositRefunded.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-950/50 px-3 py-2 rounded-lg">
                      Next Status:
                      <span className={`flex items-center gap-1.5 ${itemStatusAfterReturn === 'maintenance' ? 'text-yellow-500' : 'text-emerald-500'}`}>
                        {itemStatusAfterReturn === 'maintenance' ? <><Wrench className="h-3 w-3" /> Maintenance</> : <><CheckCircle className="h-3 w-3" /> Available</>}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-4">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="flex-1 border border-slate-700/50 hover:bg-slate-800">
                  Cancel
                </Button>
                <Button type="submit" className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]" isLoading={isSubmitting}>
                  <ShieldCheck className="h-4 w-4" /> Finalize Return
                </Button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProcessReturnModal;
