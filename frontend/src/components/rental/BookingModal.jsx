import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, Calendar, IndianRupee, AlertCircle, Package } from 'lucide-react';
import Button from '../ui/Button';
import { createRental, fetchEquipmentAvailability } from '../../services/rentalService';

const toDateInputValue = (date) => date.toISOString().split('T')[0];

const isDateRangeBlocked = (start, end, bookedRanges) => {
  const s = new Date(start);
  const e = new Date(end);
  return bookedRanges.some((r) => {
    const rs = new Date(r.start);
    const re = new Date(r.end);
    return s < re && e > rs;
  });
};

const BookingModal = ({ equipment, onClose, onBooked }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookedRanges, setBookedRanges] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const res = await fetchEquipmentAvailability(equipment._id);
        setBookedRanges(res.data.data.bookedRanges);
      } catch {
        // Non-critical — still allow booking
      } finally {
        setAvailabilityLoading(false);
      }
    };
    loadAvailability();
  }, [equipment._id]);

  const totalDays =
    startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
      : 0;

  const rentalCost = totalDays * equipment.dailyRate;
  const totalAmount = rentalCost + equipment.securityDeposit;

  const isConflict =
    startDate && endDate && isDateRangeBlocked(startDate, endDate, bookedRanges);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) return setError('Please select both start and end dates.');
    if (new Date(endDate) <= new Date(startDate)) return setError('End date must be after start date.');
    if (isConflict) return setError('Selected dates overlap with an existing booking.');

    setIsSubmitting(true);
    try {
      await createRental({
        equipment: equipment._id,
        startDate,
        endDate,
        notes: notes || undefined,
      });
      toast.success('Rental booked successfully!');
      onBooked();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minEnd = startDate
    ? toDateInputValue(new Date(new Date(startDate).getTime() + 86400000))
    : toDateInputValue(new Date(today.getTime() + 86400000));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-900/30 border border-primary-800">
              <Package className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Book Equipment</h2>
              <p className="text-xs text-slate-400 truncate max-w-[250px]">{equipment.name}</p>
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

          {isConflict && !error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>These dates conflict with an existing booking. Please choose different dates.</span>
            </div>
          )}

          {/* Date pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Start Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  min={toDateInputValue(today)}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && new Date(endDate) <= new Date(e.target.value)) setEndDate('');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                End Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  min={minEnd}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or notes..."
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Price summary */}
          {totalDays > 0 && (
            <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Booking Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Duration</span>
                <span className="text-slate-200 font-medium">{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Rental Cost</span>
                <span className="text-slate-200">₹{rentalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Security Deposit</span>
                <span className="text-slate-200">₹{equipment.securityDeposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-700">
                <span className="text-slate-300 flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5" /> Total
                </span>
                <span className="text-primary-400 text-base">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isSubmitting}
              disabled={!startDate || !endDate || isConflict || availabilityLoading}
            >
              Confirm Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
