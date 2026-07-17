const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  
  {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: [true, 'Rental reference is required'],
      unique: true, // One return record per rental
      index: true,
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff member processing return is required'],
    },

    // Actual return date (may differ from planned endDate)
    returnDate: {
      type: Date,
      required: [true, 'Return date is required'],
      default: Date.now,
    },

    // Equipment condition assessment at time of return
    conditionAtReturn: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: [true, 'Condition at return is required'],
    },

    // Damage tracking
    isDamaged: {
      type: Boolean,
      default: false,
    },
    damageDescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Damage description cannot exceed 1000 characters'],
      default: null,
    },
    damageCharges: {
      type: Number,
      min: [0, 'Damage charges cannot be negative'],
      default: 0,
    },

    // Security deposit handling
    depositRefunded: {
      type: Number,
      min: [0, 'Deposit refunded cannot be negative'],
      required: true,
    },
    depositDeducted: {
      type: Number,
      min: [0, 'Deposit deducted cannot be negative'],
      default: 0,
    },

    // Equipment status set after return
    equipmentStatusAfterReturn: {
      type: String,
      enum: ['available', 'maintenance'],
      required: true,
    },

    // General return notes
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: null,
    },
  },

  { timestamps: true }



);

const Return = mongoose.model('Return', returnSchema);

module.exports = Return;
