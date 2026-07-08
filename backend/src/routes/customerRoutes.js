const express = require('express');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const validate = require('../utils/validate');
const { updateCustomerValidation, listCustomersValidation } = require('../validators/customerValidator');
const { getAllCustomers, getCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');

const router = express.Router();

// All customer routes require authentication — Admin and Staff only
router.use(protect, authorize('admin', 'staff'));

router.get('/', listCustomersValidation, validate, getAllCustomers);
router.get('/:id', getCustomer);
router.patch('/:id', updateCustomerValidation, validate, updateCustomer);

// Delete is Admin-only
router.delete('/:id', authorize('admin'), deleteCustomer);

module.exports = router;
