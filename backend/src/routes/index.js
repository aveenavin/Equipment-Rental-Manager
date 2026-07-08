const express = require('express');
const authRoutes = require('./authRoutes');
const equipmentRoutes = require('./equipmentRoutes');
const customerRoutes = require('./customerRoutes');

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

module.exports = router;
