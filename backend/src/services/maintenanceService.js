const mongoose = require('mongoose');
const MaintenanceLog = require('../models/MaintenanceLog');
const Equipment = require('../models/Equipment');
const AppError = require('../utils/AppError');

/**
 * Create a new maintenance log and lock the equipment to 'maintenance' status.
 *
 * Business rules:
 * - Equipment must exist
 * - Equipment cannot be in 'retired' status
 * - Equipment cannot already have an open maintenance log
 * - Atomically: creates log + sets equipment.status = 'maintenance'
 */
const createMaintenanceLog = async ({
  equipmentId,
  reportedById,
  description,
  priority,
  estimatedCost,
  scheduledDate,
  triggeredByReturn = null,
}) => {
  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) throw new AppError('Equipment not found.', 404);

  if (equipment.status === 'retired') {
    throw new AppError('Cannot create a maintenance log for retired equipment.', 400);
  }

  // Guard: cannot have two open logs for the same equipment
  const existingOpenLog = await MaintenanceLog.findOne({
    equipment: equipmentId,
    status: 'open',
  });
  if (existingOpenLog) {
    throw new AppError(
      'This equipment already has an open maintenance log. Complete the existing log before creating a new one.',
      409
    );
  }

  const session = await mongoose.startSession();
  let log;

  try {
    session.startTransaction();

    [log] = await MaintenanceLog.create(
      [
        {
          equipment: equipmentId,
          reportedBy: reportedById,
          description: description.trim(),
          priority: priority || 'medium',
          estimatedCost: estimatedCost != null ? parseFloat(estimatedCost) : null,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          triggeredByReturn,
        },
      ],
      { session }
    );

    await Equipment.findByIdAndUpdate(
      equipmentId,
      { status: 'maintenance' },
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  return MaintenanceLog.findById(log._id)
    .populate('equipment', 'name category images condition status')
    .populate('reportedBy', 'name role')
    .lean();
};

/**
 * Complete an open maintenance log and release the equipment back to 'available'.
 *
 * Business rules:
 * - Log must exist
 * - Log must be in 'open' status
 * - Atomically: updates log + sets equipment.status = 'available'
 */
const completeMaintenanceLog = async ({
  logId,
  completedById,
  technicianNotes,
  actualCost,
}) => {
  const log = await MaintenanceLog.findById(logId).populate('equipment');
  if (!log) throw new AppError('Maintenance log not found.', 404);

  if (log.status === 'completed') {
    throw new AppError('This maintenance log has already been completed.', 400);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const now = new Date();
    log.status = 'completed';
    log.completedBy = completedById;
    log.completedAt = now;
    log.technicianNotes = technicianNotes ? technicianNotes.trim() : null;
    log.actualCost = actualCost != null ? parseFloat(actualCost) : null;
    await log.save({ session });

    await Equipment.findByIdAndUpdate(
      log.equipment._id,
      { status: 'available' },
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  return MaintenanceLog.findById(log._id)
    .populate('equipment', 'name category images condition status')
    .populate('reportedBy', 'name role')
    .populate('completedBy', 'name role')
    .lean();
};

/**
 * Get a single maintenance log by ID.
 */
const getMaintenanceLogById = async (id) => {
  const log = await MaintenanceLog.findById(id)
    .populate('equipment', 'name category images condition status serialNumber')
    .populate('reportedBy', 'name role')
    .populate('completedBy', 'name role')
    .populate('triggeredByReturn', 'returnDate conditionAtReturn damageDescription damageCharges')
    .lean();

  if (!log) throw new AppError('Maintenance log not found.', 404);
  return log;
};

/**
 * List maintenance logs with pagination, filtering, and search.
 *
 * Search: matches equipment name or log description.
 */
const listMaintenanceLogs = async ({ page = 1, limit = 15, status, equipmentId, search }) => {
  const filter = {};
  if (status) filter.status = status;
  if (equipmentId) filter.equipment = equipmentId;

  // Search across referenced Equipment names and log description
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');

    const matchedEquipment = await Equipment.find({ name: regex }).select('_id').lean();

    const orConditions = [{ description: regex }];
    if (matchedEquipment.length) {
      orConditions.push({ equipment: { $in: matchedEquipment.map((e) => e._id) } });
    }

    filter.$and = [...(filter.$and || []), { $or: orConditions }];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    MaintenanceLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('equipment', 'name category images condition status')
      .populate('reportedBy', 'name role')
      .populate('completedBy', 'name role')
      .lean(),
    MaintenanceLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  };
};

module.exports = {
  createMaintenanceLog,
  completeMaintenanceLog,
  getMaintenanceLogById,
  listMaintenanceLogs,
};
