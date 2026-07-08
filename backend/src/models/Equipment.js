const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'heavy-machinery',
        'power-tools',
        'lifting-equipment',
        'compressors',
        'generators',
        'scaffolding',
        'vehicles',
        'other',
      ],
    },
    dailyRate: {
      type: Number,
      required: [true, 'Daily rental rate is required'],
      min: [0, 'Daily rate cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: [0, 'Security deposit cannot be negative'],
    },
    status: {
      type: String,
      enum: ['available', 'rented', 'maintenance', 'retired'],
      default: 'available',
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good',
    },
    serialNumber: {
      type: String,
      trim: true,
      default: null,
    },
    images: {
      type: [imageSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'A maximum of 5 images are allowed per equipment item',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name before saving
equipmentSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      + '-' + Date.now();
  }
  next();
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;
