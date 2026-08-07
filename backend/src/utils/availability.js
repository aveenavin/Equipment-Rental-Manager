const Rental = require('../models/Rental');

/**
 * Returns true if the item is available for the requested date range.
 * Blocks if any active rental overlaps: (existingStart < requestEnd) AND (existingEnd > requestStart)
 *
 * @param {string} itemId
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {string|null} excludeRentalId  — exclude a specific rental ID (for updates)
 */
const isItemAvailable = async (itemId, startDate, endDate, excludeRentalId = null) => {
  const query = {
    item: itemId,
    status: { $in: ['pending', 'confirmed', 'checked_out'] },
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  };

  if (excludeRentalId) {
    query._id = { $ne: excludeRentalId };
  }

  const conflict = await Rental.findOne(query).lean();
  return conflict === null;
};

/**
 * Returns all booked date ranges for a given item.
 * Used by the frontend calendar to block unavailable dates.
 */
const getBookedRanges = async (itemId) => {
  const rentals = await Rental.find({
    item: itemId,
    status: { $in: ['pending', 'confirmed', 'checked_out'] },
  })
    .select('startDate endDate status')
    .lean();

  return rentals.map((r) => ({
    start: r.startDate,
    end: r.endDate,
    status: r.status,
  }));
};

/**
 * Calculates total rental days (inclusive of start, exclusive of end).
 * Minimum 1 day.
 */
const calculateRentalDays = (startDate, endDate) => {
  const ms = new Date(endDate) - new Date(startDate);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

module.exports = { isItemAvailable, getBookedRanges, calculateRentalDays };
