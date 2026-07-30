const mongoose = require('mongoose');
const Rental = require('../models/Rental');
const Equipment = require('../models/Equipment');
const AppError = require('../utils/AppError');
const { isEquipmentAvailable, calculateRentalDays, getBookedRanges } = require('../utils/availability');

/**
 * Valid status transitions map.
 * Only these transitions are permitted.
 */
const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked_out', 'cancelled'],
  checked_out: ['returned'],
  returned: [],
  cancelled: [],
};

/**
 * Equipment status to sync when rental status changes.
 */
const EQUIPMENT_STATUS_MAP = {
  confirmed: 'available',   // still available until actual checkout
  checked_out: 'rented',
  returned: 'available',
  cancelled: 'available',
};

/**
 * Create a new rental booking.
 * - Verifies equipment exists and is available (not retired/maintenance)
 * - Checks for date conflicts with existing active rentals
 * - Snapshots pricing at time of booking
 */
const createRental = async ({ customerId, body }) => {
  const { equipment: equipmentId, startDate, endDate, notes, deliveryAddress, contactNumber } = body;

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) throw new AppError('Equipment not found.', 404);

  if (equipment.status === 'retired') {
    throw new AppError('This equipment has been retired and is no longer available for rental.', 400);
  }
  if (equipment.status === 'maintenance') {
    throw new AppError('This equipment is currently under maintenance and cannot be rented.', 400);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const available = await isEquipmentAvailable(equipmentId, start, end);
  if (!available) {
    throw new AppError(
      'This equipment is already booked for the selected dates. Please choose different dates.',
      409
    );
  }

  const totalDays = calculateRentalDays(start, end);
  const rentalCost = parseFloat((totalDays * equipment.dailyRate).toFixed(2));
  const totalAmount = parseFloat((rentalCost + equipment.securityDeposit).toFixed(2));

  const rental = await Rental.create({
    customer: customerId,
    equipment: equipmentId,
    startDate: start,
    endDate: end,
    dailyRate: equipment.dailyRate,
    totalDays,
    rentalCost,
    securityDeposit: equipment.securityDeposit,
    totalAmount,
    deliveryAddress,
    contactNumber,
    notes: notes || null,
  });

  return rental.populate([
    { path: 'customer', select: 'name email' },
    { path: 'equipment', select: 'name category dailyRate images status' },
  ]);
};

/**
 * Update rental status with enforcement of allowed transitions.
 * Automatically syncs equipment availability on relevant transitions.
 */
const updateRentalStatus = async ({ rentalId, status, notes, handledById }) => {
  const rental = await Rental.findById(rentalId);
  if (!rental) throw new AppError('Rental not found.', 404);

  const allowed = ALLOWED_TRANSITIONS[rental.status];
  if (!allowed.includes(status)) {
    throw new AppError(
      `Cannot transition rental from "${rental.status}" to "${status}". Allowed: ${allowed.join(', ') || 'none'}.`,
      400
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Update rental
    rental.status = status;
    if (notes !== undefined) rental.notes = notes || null;
    if (handledById) rental.handledBy = handledById;

    // Record transition timestamps
    const now = new Date();
    if (status === 'confirmed') rental.confirmedAt = now;
    if (status === 'checked_out') rental.checkedOutAt = now;
    if (status === 'returned') rental.returnedAt = now;
    if (status === 'cancelled') rental.cancelledAt = now;

    await rental.save({ session });

    // Sync equipment status
    const newEquipmentStatus = EQUIPMENT_STATUS_MAP[status];
    if (newEquipmentStatus) {
      await Equipment.findByIdAndUpdate(
        rental.equipment,
        { status: newEquipmentStatus },
        { session }
      );
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  return rental.populate([
    { path: 'customer', select: 'name email phone' },
    { path: 'equipment', select: 'name category dailyRate images status' },
    { path: 'handledBy', select: 'name role' },
  ]);
};

/**
 * Get a single rental by ID.
 * Customers can only see their own rentals.
 */
const getRentalById = async ({ rentalId, requestingUser }) => {
  const rental = await Rental.findById(rentalId)
    .populate('customer', 'name email phone')
    .populate('equipment', 'name category dailyRate securityDeposit images status')
    .populate('handledBy', 'name role')
    .lean();

  if (!rental) throw new AppError('Rental not found.', 404);

  if (
    requestingUser.role === 'customer' &&
    rental.customer._id.toString() !== requestingUser._id.toString()
  ) {
    throw new AppError('You do not have permission to view this rental.', 403);
  }

  return rental;
};

/**
 * List rentals with filtering, search, and pagination.
 * Customers only see their own. Admin/Staff see all.
 *
 * Search: matches equipment name, customer name/email, or rental ID suffix.
 */
const listRentals = async ({ requestingUser, page = 1, limit = 15, status, equipmentId, search }) => {
  const filter = {};

  if (requestingUser.role === 'customer') {
    filter.customer = requestingUser._id;
  }

  if (status) filter.status = status;
  if (equipmentId) filter.equipment = equipmentId;

  // Search across referenced Equipment names, Customer names/emails, and rental ID suffix
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');

    const [matchedEquipment, matchedUsers] = await Promise.all([
      Equipment.find({ name: regex }).select('_id').lean(),
      mongoose.model('User').find({
        $or: [{ name: regex }, { email: regex }],
      }).select('_id').lean(),
    ]);

    const orConditions = [];
    if (matchedEquipment.length) {
      orConditions.push({ equipment: { $in: matchedEquipment.map((e) => e._id) } });
    }
    if (matchedUsers.length) {
      orConditions.push({ customer: { $in: matchedUsers.map((u) => u._id) } });
    }

    // Match rental ID suffix (last 6 chars, as shown in the UI)
    if (/^[a-f0-9]+$/i.test(search.trim())) {
      orConditions.push({ _id: { $regex: `${search.trim()}$`, $options: 'i' } });
    }

    if (orConditions.length) {
      filter.$and = [...(filter.$and || []), { $or: orConditions }];
    } else {
      // Search matched nothing — return empty
      return {
        rentals: [],
        pagination: { total: 0, page: 1, limit: parseInt(limit, 10), pages: 0 },
      };
    }
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [rentals, total] = await Promise.all([
    Rental.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('customer', 'name email')
      .populate('equipment', 'name category images status')
      .lean(),
    Rental.countDocuments(filter),
  ]);

  return {
    rentals,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  };
};

/**
 * Cancel own rental (customers can only cancel pending rentals).
 */
const cancelRental = async ({ rentalId, requestingUser }) => {
  const rental = await Rental.findById(rentalId);
  if (!rental) throw new AppError('Rental not found.', 404);

  if (
    requestingUser.role === 'customer' &&
    rental.customer.toString() !== requestingUser._id.toString()
  ) {
    throw new AppError('You do not have permission to cancel this rental.', 403);
  }

  if (rental.status !== 'pending') {
    throw new AppError(
      'Only pending rentals can be self-cancelled. Contact staff for further assistance.',
      400
    );
  }

  rental.status = 'cancelled';
  rental.cancelledAt = new Date();
  await rental.save();

  return rental;
};

/**
 * Get booked date ranges for a specific equipment item (for calendar display).
 */
const getEquipmentAvailability = async (equipmentId) => {
  const equipment = await Equipment.findById(equipmentId).select('status name').lean();
  if (!equipment) throw new AppError('Equipment not found.', 404);

  const bookedRanges = await getBookedRanges(equipmentId);
  return { equipment, bookedRanges };
};

module.exports = {
  createRental,
  updateRentalStatus,
  getRentalById,
  listRentals,
  cancelRental,
  getEquipmentAvailability,
};
