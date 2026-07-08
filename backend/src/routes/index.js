const express = require('express');
const authRoutes = require('./authRoutes');
const equipmentRoutes = require('./equipmentRoutes');
const customerRoutes = require('./customerRoutes');
const rentalRoutes = require('./rentalRoutes');
const returnRoutes = require('./returnRoutes');
const paymentRoutes = require('./paymentRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/customers', customerRoutes);
router.use('/rentals', rentalRoutes);
router.use('/returns', returnRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
