const Equipment = require('../models/Equipment');
const User = require('../models/User');
const Rental = require('../models/Rental');
const Return = require('../models/Return');
const Payment = require('../models/Payment');

/**
 * Build start-of-month dates for the last N months for trend queries.
 */
const getMonthRange = (months = 12) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  return { start, end: now };
};

/**
 * Fill in missing months with zero values so charts have continuous data.
 */
const fillMonthGaps = (data, months = 12) => {
  const now = new Date();
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const found = data.find((r) => r._id.year === year && r._id.month === month);
    result.push({
      label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
      year,
      month,
      value: found ? found.value : 0,
      count: found ? (found.count || 0) : 0,
    });
  }
  return result;
};

/**
 * Master dashboard aggregation — all queries run in parallel.
 */
const getDashboardData = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const { start: trendStart } = getMonthRange(12);

  const [
    // Equipment stats
    equipmentStats,

    // Customer count
    totalCustomers,

    // Rental counts by status
    rentalStatusCounts,

    // Financial stats
    revenueThisMonth,
    revenueLastMonth,
    totalRevenue,

    // Returns today
    returnsToday,

    // Equipment utilization by category
    equipmentByCategory,

    // Revenue trend (last 12 months)
    revenueTrend,

    // Rental trend (last 12 months)
    rentalTrend,

    // Recent activity
    recentRentals,
    recentPayments,
    recentReturns,
  ] = await Promise.all([
    // Equipment: total + by status breakdown
    Equipment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),

    // Customers count
    User.countDocuments({ role: 'customer', status: 'active' }),

    // Rentals grouped by status
    Rental.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),

    // Revenue this month (inbound payments only)
    Payment.aggregate([
      {
        $match: {
          direction: 'inbound',
          status: 'completed',
          paidAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),

    // Revenue last month
    Payment.aggregate([
      {
        $match: {
          direction: 'inbound',
          status: 'completed',
          paidAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),

    // All-time revenue
    Payment.aggregate([
      {
        $match: { direction: 'inbound', status: 'completed' },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // Returns today
    Return.countDocuments({ returnDate: { $gte: startOfToday } }),

    // Equipment utilization: rented count per category
    Equipment.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          rented: {
            $sum: { $cond: [{ $eq: ['$status', 'rented'] }, 1, 0] },
          },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] },
          },
          maintenance: {
            $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),

    // Revenue trend: sum of inbound payments by month for last 12 months
    Payment.aggregate([
      {
        $match: {
          direction: 'inbound',
          status: 'completed',
          paidAt: { $gte: trendStart },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' },
          },
          value: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Rental trend: count of rentals created per month for last 12 months
    Rental.aggregate([
      {
        $match: { createdAt: { $gte: trendStart } },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          value: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Recent rentals (last 8)
    Rental.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('customer', 'name email')
      .populate('equipment', 'name category images')
      .lean(),

    // Recent payments (last 6)
    Payment.find()
      .sort({ paidAt: -1 })
      .limit(6)
      .populate('customer', 'name email')
      .populate('recordedBy', 'name')
      .lean(),

    // Recent returns (last 6)
    Return.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('equipment', 'name images')
      .populate('customer', 'name')
      .lean(),
  ]);

  // ── Process equipment stats ──────────────────────────────────────────────
  const equipmentStatusMap = equipmentStats.reduce(
    (acc, { _id, count }) => ({ ...acc, [_id]: count }),
    {}
  );
  const totalEquipment = Object.values(equipmentStatusMap).reduce((s, c) => s + c, 0);

  // ── Process rental counts ────────────────────────────────────────────────
  const rentalStatusMap = rentalStatusCounts.reduce(
    (acc, { _id, count }) => ({ ...acc, [_id]: count }),
    {}
  );
  const activeRentals =
    (rentalStatusMap.pending || 0) +
    (rentalStatusMap.confirmed || 0) +
    (rentalStatusMap.checked_out || 0);
  const totalRentals = Object.values(rentalStatusMap).reduce((s, c) => s + c, 0);

  // ── Revenue ──────────────────────────────────────────────────────────────
  const revenueThisMonthVal = revenueThisMonth[0]?.total || 0;
  const revenueLastMonthVal = revenueLastMonth[0]?.total || 0;
  const totalRevenueVal = totalRevenue[0]?.total || 0;
  const revenueGrowth =
    revenueLastMonthVal > 0
      ? parseFloat((((revenueThisMonthVal - revenueLastMonthVal) / revenueLastMonthVal) * 100).toFixed(1))
      : revenueThisMonthVal > 0
      ? 100
      : 0;

  // ── Rental status for donut chart ────────────────────────────────────────
  const rentalStatusChart = [
    { name: 'Pending', value: rentalStatusMap.pending || 0, color: '#f59e0b' },
    { name: 'Confirmed', value: rentalStatusMap.confirmed || 0, color: '#3b82f6' },
    { name: 'Checked Out', value: rentalStatusMap.checked_out || 0, color: '#8b5cf6' },
    { name: 'Returned', value: rentalStatusMap.returned || 0, color: '#10b981' },
    { name: 'Cancelled', value: rentalStatusMap.cancelled || 0, color: '#6b7280' },
  ].filter((s) => s.value > 0);

  // ── Equipment by category for bar chart ─────────────────────────────────
  const categoryChart = equipmentByCategory.map((c) => ({
    name: c._id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    total: c.total,
    rented: c.rented,
    available: c.available,
    maintenance: c.maintenance,
  }));

  return {
    stats: {
      equipment: {
        total: totalEquipment,
        available: equipmentStatusMap.available || 0,
        rented: equipmentStatusMap.rented || 0,
        maintenance: equipmentStatusMap.maintenance || 0,
      },
      customers: { total: totalCustomers },
      rentals: {
        active: activeRentals,
        total: totalRentals,
        byStatus: rentalStatusMap,
      },
      revenue: {
        thisMonth: parseFloat(revenueThisMonthVal.toFixed(2)),
        lastMonth: parseFloat(revenueLastMonthVal.toFixed(2)),
        total: parseFloat(totalRevenueVal.toFixed(2)),
        growthPercent: revenueGrowth,
      },
      returnsToday,
    },
    charts: {
      revenueTrend: fillMonthGaps(revenueTrend, 12),
      rentalTrend: fillMonthGaps(rentalTrend, 12),
      rentalStatusChart,
      categoryChart,
    },
    recentActivity: {
      rentals: recentRentals,
      payments: recentPayments,
      returns: recentReturns,
    },
  };
};

module.exports = { getDashboardData };
