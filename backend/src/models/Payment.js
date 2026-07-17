const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  
  {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: [true, 'Rental reference is required'],
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
    },

    // Payment classification
    paymentType: {
      type: String,
      enum: ['advance', 'balance', 'damage_charge', 'deposit_refund'],
      required: [true, 'Payment type is required'],
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'online'],
      required: [true, 'Payment method is required'],
    },

    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than zero'],
    },

    // Payment direction: 'inbound' = customer pays us, 'outbound' = we pay customer (refund)
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
    },

    status: {
      type: String,
      enum: ['completed', 'refunded'],
      default: 'completed',
    },

    // Optional external reference (bank ref, card transaction ID, etc.)
    transactionId: {
      type: String,
      trim: true,
      maxlength: [100, 'Transaction ID cannot exceed 100 characters'],
      default: null,
    },

    // Staff/admin who recorded this payment
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorded by is required'],
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: null,
    },
  },


  { timestamps: true }


);

// Compound index for per-rental payment lookup and type filtering
paymentSchema.index({ rental: 1, paymentType: 1 });
paymentSchema.index({ customer: 1, createdAt: -1 });

// Compound index for admin list — filtered by type, sorted by date
paymentSchema.index({ paymentType: 1, paidAt: -1 });

// Compound index for dashboard revenue aggregation — filtered by direction + date range
paymentSchema.index({ direction: 1, status: 1, paidAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
