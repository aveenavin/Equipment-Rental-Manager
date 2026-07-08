const express = require('express');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const validate = require('../utils/validate');
const {
  createRentalValidation,
  updateRentalStatusValidation,
  listRentalsValidation,
} = require('../validators/rentalValidator');
const {
  getAllRentals,
  getRental,
  createRental,
  updateStatus,
  cancelRental,
  getAvailability,
} = require('../controllers/rentalController');

const router = express.Router();

// All rental routes require authentication
router.use(protect);

// Availability check — any authenticated user
router.get('/availability/:equipmentId', getAvailability);

// List rentals — customers see own, admin/staff see all
router.get('/', listRentalsValidation, validate, getAllRentals);

// Get single rental
router.get('/:id', getRental);

// Create rental — customers, admin, staff can book
router.post('/', authorize('customer', 'admin', 'staff'), createRentalValidation, validate, createRental);

// Cancel own rental — any authenticated user (service enforces ownership + pending-only rule)
router.patch('/:id/cancel', cancelRental);

// Status transitions — admin and staff only
router.patch(
  '/:id/status',
  authorize('admin', 'staff'),
  updateRentalStatusValidation,
  validate,
  updateStatus
);

module.exports = router;
