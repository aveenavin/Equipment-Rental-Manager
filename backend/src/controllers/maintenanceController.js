const catchAsync = require('../utils/catchAsync');
const maintenanceService = require('../services/maintenanceService');

// POST /api/v1/maintenance
const createLog = catchAsync(async (req, res) => {
  const { equipmentId, description, priority, estimatedCost, scheduledDate } = req.body;

  const log = await maintenanceService.createMaintenanceLog({
    equipmentId,
    reportedById: req.user._id,
    description,
    priority,
    estimatedCost,
    scheduledDate,
  });

  res.status(201).json({ status: 'success', data: { log } });
});

// PATCH /api/v1/maintenance/:id/complete
const completeLog = catchAsync(async (req, res) => {
  const { technicianNotes, actualCost } = req.body;

  const log = await maintenanceService.completeMaintenanceLog({
    logId: req.params.id,
    completedById: req.user._id,
    technicianNotes,
    actualCost,
  });

  res.status(200).json({ status: 'success', data: { log } });
});

// GET /api/v1/maintenance
const getAllLogs = catchAsync(async (req, res) => {
  const { page, limit, status, equipment } = req.query;
  const result = await maintenanceService.listMaintenanceLogs({
    page,
    limit,
    status,
    equipmentId: equipment,
  });

  res.status(200).json({ status: 'success', data: result });
});

// GET /api/v1/maintenance/:id
const getLog = catchAsync(async (req, res) => {
  const log = await maintenanceService.getMaintenanceLogById(req.params.id);
  res.status(200).json({ status: 'success', data: { log } });
});

module.exports = { createLog, completeLog, getAllLogs, getLog };
