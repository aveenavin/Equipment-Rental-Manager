const express = require('express');
const AppError = require('../utils/AppError');
const authRoutes = require('./authRoutes');
const itemRoutes = require('./itemRoutes');
const customerRoutes = require('./customerRoutes');
const rentalRoutes = require('./rentalRoutes');
const returnRoutes = require('./returnRoutes');
const paymentRoutes = require('./paymentRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/customers', customerRoutes);
router.use('/rentals', rentalRoutes);
router.use('/returns', returnRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/maintenance', maintenanceRoutes);

// Catch-all for unknown /api/v1/* routes — must be last
router.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server.`, 404));
});

module.exports = router;
