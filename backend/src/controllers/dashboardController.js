const catchAsync = require('../utils/catchAsync');
const { getDashboardData } = require('../services/dashboardService');

// GET /api/v1/dashboard
const getDashboard = catchAsync(async (req, res) => {
  const data = await getDashboardData();
  res.status(200).json({ status: 'success', data });
});

module.exports = { getDashboard };
