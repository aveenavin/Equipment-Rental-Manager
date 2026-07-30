const mongoose = require('mongoose');
const Return = require('../models/Return');
const Rental = require('../models/Rental');
const Equipment = require('../models/Equipment');
const MaintenanceLog = require('../models/MaintenanceLog');
const AppError = require('../utils/AppError');

/**
 * Process a physical equipment return.
 *
 * Business rules:
 * - Rental must be in 'checked_out' status
 * - Creates a Return record
 * - Atomically updates: Rental (→ returned, links returnRecord), Equipment (status + condition)
 * - Deposit logic: damageCharges are deducted from securityDeposit; remainder is refunded
 * - If damaged: equipment → maintenance; otherwise → available
 * - Equipment condition is updated to reflect the returned condition
 */
const processReturn = async ({
  rentalId,
  processedById,
  conditionAtReturn,
  isDamaged,
  damageDescription,
  damageCharges,
  notes,
  returnDate,
}) => {
  // Validate rental exists and is in checked_out status
  const rental = await Rental.findById(rentalId).populate('equipment');
  if (!rental) throw new AppError('Rental not found.', 404);
  if (rental.status !== 'checked_out') {
    throw new AppError(
      `Only checked-out rentals can be returned. Current status: "${rental.status}".`,
      400
    );
  }

  // Check if return was already processed (should never happen due to unique index, but guard anyway)
  const existingReturn = await Return.findOne({ rental: rentalId });
  if (existingReturn) throw new AppError('A return record already exists for this rental.', 409);

  const damaged = isDamaged === true || isDamaged === 'true';
  const charges = damaged ? parseFloat(damageCharges || 0) : 0;
  const depositDeducted = Math.min(charges, rental.securityDeposit);
  const depositRefunded = Math.max(0, rental.securityDeposit - depositDeducted);
  const equipmentStatusAfterReturn = damaged ? 'maintenance' : 'available';
  const actualReturnDate = returnDate ? new Date(returnDate) : new Date();

  const session = await mongoose.startSession();
  let returnRecord;

  try {
    session.startTransaction();

    // 1. Create the Return record
    [returnRecord] = await Return.create(
      [
        {
          rental: rental._id,
          equipment: rental.equipment._id,
          customer: rental.customer,
          processedBy: processedById,
          returnDate: actualReturnDate,
          conditionAtReturn,
          isDamaged: damaged,
          damageDescription: damaged && damageDescription ? damageDescription.trim() : null,
          damageCharges: charges,
          depositRefunded,
          depositDeducted,
          equipmentStatusAfterReturn,
          notes: notes ? notes.trim() : null,
        },
      ],
      { session }
    );

    // 2. Update rental: status → returned, link return record, set timestamps
    rental.status = 'returned';
    rental.returnedAt = actualReturnDate;
    rental.handledBy = processedById;
    rental.returnRecord = returnRecord._id;
    await rental.save({ session });

    // 3. Update equipment: status + condition
    await Equipment.findByIdAndUpdate(
      rental.equipment._id,
      {
        status: equipmentStatusAfterReturn,
        condition: conditionAtReturn,
      },
      { session }
    );

    // 4. If damaged: automatically create a MaintenanceLog so the
    //    maintenance list stays the single source of truth for all
    //    equipment currently in 'maintenance' status.
    if (damaged) {
      await MaintenanceLog.create(
        [
          {
            equipment: rental.equipment._id,
            reportedBy: processedById,
            description: damageDescription
              ? `Post-return damage: ${damageDescription.trim()}`
              : 'Post-return damage reported during return inspection.',
            priority: 'high',
            triggeredByReturn: returnRecord._id,
          },
        ],
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

  // Return populated record
  return Return.findById(returnRecord._id)
    .populate('rental', 'startDate endDate totalDays rentalCost securityDeposit totalAmount notes')
    .populate('equipment', 'name category images condition status')
    .populate('customer', 'name email phone')
    .populate('processedBy', 'name role')
    .lean();
};

/**
 * Get a single return record by ID.
 */
const getReturnById = async (id) => {
  const record = await Return.findById(id)
    .populate('rental', 'startDate endDate totalDays rentalCost securityDeposit totalAmount status notes contactNumber')
    .populate('equipment', 'name category images condition status')
    .populate('customer', 'name email phone')
    .populate('processedBy', 'name role')
    .lean();

  if (!record) throw new AppError('Return record not found.', 404);
  return record;
};

/**
 * Get the return record for a specific rental.
 */
const getReturnByRentalId = async (rentalId) => {
  const record = await Return.findOne({ rental: rentalId })
    .populate('rental', 'startDate endDate totalDays rentalCost securityDeposit totalAmount status notes contactNumber')
    .populate('equipment', 'name category images condition status')
    .populate('customer', 'name email phone')
    .populate('processedBy', 'name role')
    .lean();

  if (!record) throw new AppError('No return record found for this rental.', 404);
  return record;
};

/**
 * List all return records with pagination, filterable by damage status.
 *
 * Search: matches equipment name or customer name/email.
 */
const listReturns = async ({ page = 1, limit = 15, isDamaged, equipmentId, search }) => {
  const filter = {};
  if (isDamaged !== undefined && isDamaged !== '') {
    filter.isDamaged = isDamaged === 'true' || isDamaged === true;
  }
  if (equipmentId) filter.equipment = equipmentId;

  // Search across referenced Equipment names and Customer names/emails
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

    if (orConditions.length) {
      filter.$and = [...(filter.$and || []), { $or: orConditions }];
    } else {
      return {
        returns: [],
        pagination: { total: 0, page: 1, limit: parseInt(limit, 10), pages: 0 },
      };
    }
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [returns, total] = await Promise.all([
    Return.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('equipment', 'name category images')
      .populate('customer', 'name email')
      .populate('processedBy', 'name role')
      .lean(),
    Return.countDocuments(filter),
  ]);

  return {
    returns,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  };
};

module.exports = { processReturn, getReturnById, getReturnByRentalId, listReturns };
