const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema(

  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment reference is required'],
      index: true,
    },

    // Staff/admin who opened the log
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reported by is required'],
    },

    // Staff/admin who completed the log
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    status: {
      type: String,
      enum: ['open', 'completed'],
      default: 'open',
      index: true,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    // What is wrong / why is it in maintenance
    description: {
      type: String,
      required: [true, 'Maintenance description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // Filled in when the log is completed
    technicianNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Technician notes cannot exceed 2000 characters'],
      default: null,
    },

    estimatedCost: {
      type: Number,
      min: [0, 'Estimated cost cannot be negative'],
      default: null,
    },

    actualCost: {
      type: Number,
      min: [0, 'Actual cost cannot be negative'],
      default: null,
    },

    scheduledDate: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // Optional: link to the return record that triggered this log (for damaged returns)
    triggeredByReturn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Return',
      default: null,
    },
  },

  { timestamps: true }

);

// Compound index: fast lookup of open logs for a specific equipment item
maintenanceLogSchema.index({ equipment: 1, status: 1 });

// Admin list: sorted by recency, filtered by status
maintenanceLogSchema.index({ status: 1, createdAt: -1 });

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);

module.exports = MaintenanceLog;
