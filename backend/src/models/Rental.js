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
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item is required'],
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
    // Delivery address for this specific rental booking
    deliveryAddress: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
        maxlength: [200, 'Street address cannot exceed 200 characters'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        maxlength: [100, 'State cannot exceed 100 characters'],
      },
      postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
        trim: true,
        match: [/^\d{6}$/, 'Postal code must be a 6-digit Indian PIN code'],
      },
      country: {
        type: String,
        trim: true,
        maxlength: [100, 'Country cannot exceed 100 characters'],
        default: 'India',
      },
    },

    // Contact number for this specific booking
    contactNumber: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'],
      default: null,
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

    // Reference to the Return record (set when item is returned)
    returnRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Return',
      default: null,
    },
  },



  { timestamps: true }



);

// Compound index for fast availability queries
rentalSchema.index({ item: 1, status: 1, startDate: 1, endDate: 1 });

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental;
