import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  X, AlertTriangle, CheckCircle, Package,
  IndianRupee, ClipboardList, Calendar,
} from 'lucide-react';
import Button from '../ui/Button';
import { processReturn } from '../../services/returnService';

const CONDITIONS = [
  { value: 'excellent', label: 'Excellent', desc: 'Like new, no wear' },
  { value: 'good', label: 'Good', desc: 'Minor wear, fully functional' },
  { value: 'fair', label: 'Fair', desc: 'Visible wear, functional' },
  { value: 'poor', label: 'Poor', desc: 'Heavy wear or damage' },
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
  const equipmentStatusAfterReturn = isDamaged ? 'maintenance' : 'available';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!conditionAtReturn) return setError('Please select the equipment condition.');
    if (isDamaged && !damageDescription.trim()) return setError('Damage description is required when equipment is damaged.');

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-900/30 border border-emerald-800">
              <Package className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Process Equipment Return</h2>
              <p className="text-xs text-slate-400 truncate max-w-[260px]">{rental.equipment?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Return Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Actual Return Date <span className="text-red-400">*</span></span>
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Condition at Return */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Equipment Condition at Return <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setConditionAtReturn(c.value)}
                  className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                    conditionAtReturn === c.value
                      ? 'bg-primary-900/40 border-primary-600 text-primary-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Damage toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setIsDamaged(!isDamaged)}
                className={`relative w-10 h-6 rounded-full transition-colors ${isDamaged ? 'bg-red-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isDamaged ? 'translate-x-4' : ''}`} />
              </div>
              <span className={`text-sm font-medium ${isDamaged ? 'text-red-300' : 'text-slate-400'}`}>
                Equipment returned with damage
              </span>
            </label>
          </div>

          {/* Damage fields */}
          {isDamaged && (
            <div className="space-y-4 p-4 rounded-xl bg-red-950/20 border border-red-900/50">
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" /> Damage Details
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">
                  Damage Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  placeholder="Describe the damage in detail..."
                  maxLength={1000}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Damage Charges (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={damageCharges}
                    onChange={(e) => setDamageCharges(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Deposit summary */}
          <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" /> Return Summary
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Security Deposit</span>
              <span className="text-slate-200">₹{securityDeposit.toFixed(2)}</span>
            </div>
            {isDamaged && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Damage Charges</span>
                <span className="text-red-400">-₹{depositDeducted.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-700">
              <span className="text-slate-300">Deposit Refund</span>
              <span className={depositRefunded > 0 ? 'text-emerald-400' : 'text-red-400'}>
                ₹{depositRefunded.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span className="text-slate-500">Equipment status after return</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                equipmentStatusAfterReturn === 'maintenance'
                  ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'
                  : 'bg-emerald-900/40 text-emerald-400 border border-emerald-800'
              }`}>
                {equipmentStatusAfterReturn === 'maintenance' ? 'Sent to Maintenance' : 'Available'}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about the return..."
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 flex items-center gap-2" isLoading={isSubmitting}>
              <CheckCircle className="h-4 w-4" /> Confirm Return
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessReturnModal;
