const express = require('express');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const validate = require('../utils/validate');
const {
  createLogValidation,
  completeLogValidation,
  listLogsValidation,
} = require('../validators/maintenanceValidator');
const {
  createLog,
  completeLog,
  getAllLogs,
  getLog,
} = require('../controllers/maintenanceController');

const router = express.Router();

// All maintenance routes require authentication — Admin and Staff only
router.use(protect, authorize('admin', 'staff'));

// List all maintenance logs
router.get('/', listLogsValidation, validate, getAllLogs);

// Get single maintenance log
router.get('/:id', getLog);

// Create a new maintenance log (locks equipment to 'maintenance')
router.post('/', createLogValidation, validate, createLog);

// Complete a maintenance log (releases equipment back to 'available')
router.patch('/:id/complete', completeLogValidation, validate, completeLog);

module.exports = router;
