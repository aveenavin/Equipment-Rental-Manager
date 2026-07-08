const catchAsync = require('../utils/catchAsync');
const rentalService = require('../services/rentalService');

// GET /api/v1/rentals
const getAllRentals = catchAsync(async (req, res) => {
  const { page, limit, status, equipment } = req.query;
  const result = await rentalService.listRentals({
    requestingUser: req.user,
    page,
    limit,
    status,
    equipmentId: equipment,
  });

  res.status(200).json({ status: 'success', data: result });
});

// GET /api/v1/rentals/:id
const getRental = catchAsync(async (req, res) => {
  const rental = await rentalService.getRentalById({
    rentalId: req.params.id,
    requestingUser: req.user,
  });

  res.status(200).json({ status: 'success', data: { rental } });
});

// POST /api/v1/rentals
const createRental = catchAsync(async (req, res) => {
  const rental = await rentalService.createRental({
    customerId: req.user._id,
    body: req.body,
  });

  res.status(201).json({ status: 'success', data: { rental } });
});

// PATCH /api/v1/rentals/:id/status  (Admin/Staff only)
const updateStatus = catchAsync(async (req, res) => {
  const rental = await rentalService.updateRentalStatus({
    rentalId: req.params.id,
    status: req.body.status,
    notes: req.body.notes,
    handledById: req.user._id,
  });

  res.status(200).json({ status: 'success', data: { rental } });
});

// PATCH /api/v1/rentals/:id/cancel  (Customer — own pending rentals only)
const cancelRental = catchAsync(async (req, res) => {
  const rental = await rentalService.cancelRental({
    rentalId: req.params.id,
    requestingUser: req.user,
  });

  res.status(200).json({ status: 'success', data: { rental } });
});

// GET /api/v1/rentals/availability/:equipmentId
const getAvailability = catchAsync(async (req, res) => {
  const data = await rentalService.getEquipmentAvailability(req.params.equipmentId);
  res.status(200).json({ status: 'success', data });
});

module.exports = {
  getAllRentals,
  getRental,
  createRental,
  updateStatus,
  cancelRental,
  getAvailability,
};
