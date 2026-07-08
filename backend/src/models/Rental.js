const mongoose = require('mongoose');

const RENTAL_STATUSES = ['pending', 'confirmed', 'checked_out', 'returned', 'cancelled'];

const rentalSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
      index: true,
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required'],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    // Snapshot pricing at time of booking (never changes even if rates do)
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    rentalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: RENTAL_STATUSES,
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: null,
    },
    // Timestamps for status transitions
    confirmedAt: { type: Date, default: null },
    checkedOutAt: { type: Date, default: null },
    returnedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    // Staff member who performed checkout/return
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Reference to the Return record (set when equipment is returned)
    returnRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Return',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for fast availability queries
rentalSchema.index({ equipment: 1, status: 1, startDate: 1, endDate: 1 });

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental;
