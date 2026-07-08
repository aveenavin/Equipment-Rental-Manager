const express = require('express');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const validate = require('../utils/validate');
const { processReturnValidation, listReturnsValidation } = require('../validators/returnValidator');
const { processReturn, getAllReturns, getReturn, getReturnByRental } = require('../controllers/returnController');

const router = express.Router();

// All return routes require authentication — Admin and Staff only
router.use(protect, authorize('admin', 'staff'));

// List all returns
router.get('/', listReturnsValidation, validate, getAllReturns);

// Get return by its own ID
router.get('/:id', getReturn);

// Get return record linked to a specific rental
router.get('/rental/:rentalId', getReturnByRental);

// Process a return (creates Return record + updates Rental + Equipment atomically)
router.post('/', processReturnValidation, validate, processReturn);

module.exports = router;
