const express = require('express');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const validate = require('../utils/validate');
const { recordPaymentValidation, listPaymentsValidation } = require('../validators/paymentValidator');
const {
  recordPayment,
  listPayments,
  getPayment,
  getPaymentsByRental,
  getInvoice,
} = require('../controllers/paymentController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Invoice — any authenticated user (service enforces customer ownership)
router.get('/invoice/:rentalId', getInvoice);

// Per-rental payment summary — any authenticated user (service enforces ownership)
router.get('/rental/:rentalId', getPaymentsByRental);

// List all payments — role-scoped in controller
router.get('/', listPaymentsValidation, validate, listPayments);

// Get single payment
router.get('/:id', getPayment);

// Record a payment — admin and staff only
router.post('/', authorize('admin', 'staff'), recordPaymentValidation, validate, recordPayment);

module.exports = router;
