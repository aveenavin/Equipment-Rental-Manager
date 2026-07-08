const express = require('express');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

// Admin and Staff only
router.use(protect, authorize('admin', 'staff'));

router.get('/', getDashboard);

module.exports = router;
