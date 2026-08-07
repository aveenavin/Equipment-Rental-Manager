const mongoose = require('mongoose');
const MaintenanceLog = require('../models/MaintenanceLog');
const Item = require('../models/Item');
const AppError = require('../utils/AppError');

/**
 * Create a new maintenance log and lock the item to 'maintenance' status.
 *
 * Business rules:
 * - Item must exist
 * - Item cannot be in 'retired' status
 * - Item cannot already have an open maintenance log
 * - Atomically: creates log + sets item.status = 'maintenance'
 */
const createMaintenanceLog = async ({
  itemId,
  reportedById,
  description,
  priority,
  estimatedCost,
  scheduledDate,
  triggeredByReturn = null,
}) => {
  const item = await Item.findById(itemId);
  if (!item) throw new AppError('Item not found.', 404);

  if (item.status === 'retired') {
    throw new AppError('Cannot create a maintenance log for a retired item.', 400);
  }

  // Guard: cannot have two open logs for the same item
  const existingOpenLog = await MaintenanceLog.findOne({
    item: itemId,
    status: 'open',
  });
  if (existingOpenLog) {
    throw new AppError(
      'This item already has an open maintenance log. Complete the existing log before creating a new one.',
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
          item: itemId,
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

    await Item.findByIdAndUpdate(
      itemId,
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
    .populate('item', 'name category images condition status')
    .populate('reportedBy', 'name role')
    .lean();
};

/**
 * Complete an open maintenance log and release the item back to 'available'.
 *
 * Business rules:
 * - Log must exist
 * - Log must be in 'open' status
 * - Atomically: updates log + sets item.status = 'available'
 */
const completeMaintenanceLog = async ({
  logId,
  completedById,
  technicianNotes,
  actualCost,
}) => {
  const log = await MaintenanceLog.findById(logId).populate('item');
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

    await Item.findByIdAndUpdate(
      log.item._id,
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
    .populate('item', 'name category images condition status')
    .populate('reportedBy', 'name role')
    .populate('completedBy', 'name role')
    .lean();
};

/**
 * Get a single maintenance log by ID.
 */
const getMaintenanceLogById = async (id) => {
  const log = await MaintenanceLog.findById(id)
    .populate('item', 'name category images condition status serialNumber')
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
 * Search: matches item name or log description.
 */
const listMaintenanceLogs = async ({ page = 1, limit = 15, status, itemId, search }) => {
  const filter = {};
  if (status) filter.status = status;
  if (itemId) filter.item = itemId;

  // Search across referenced Item names and log description
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');

    const matchedItems = await Item.find({ name: regex }).select('_id').lean();

    const orConditions = [{ description: regex }];
    if (matchedItems.length) {
      orConditions.push({ item: { $in: matchedItems.map((e) => e._id) } });
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
      .populate('item', 'name category images condition status')
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
