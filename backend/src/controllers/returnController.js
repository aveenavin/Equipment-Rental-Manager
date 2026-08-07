const catchAsync = require('../utils/catchAsync');
const returnService = require('../services/returnService');

// POST /api/v1/returns
const processReturn = catchAsync(async (req, res) => {
  const { rentalId, conditionAtReturn, isDamaged, damageDescription, damageCharges, notes, returnDate } = req.body;

  const record = await returnService.processReturn({
    rentalId,
    processedById: req.user._id,
    conditionAtReturn,
    isDamaged,
    damageDescription,
    damageCharges,
    notes,
    returnDate,
  });

  res.status(201).json({ status: 'success', data: { return: record } });
});

// GET /api/v1/returns
const getAllReturns = catchAsync(async (req, res) => {
  const { page, limit, isDamaged, item, search } = req.query;
  const result = await returnService.listReturns({ page, limit, isDamaged, itemId: item, search });

  res.status(200).json({ status: 'success', data: result });
});

// GET /api/v1/returns/:id
const getReturn = catchAsync(async (req, res) => {
  const record = await returnService.getReturnById(req.params.id);
  res.status(200).json({ status: 'success', data: { return: record } });
});

// GET /api/v1/returns/rental/:rentalId
const getReturnByRental = catchAsync(async (req, res) => {
  const record = await returnService.getReturnByRentalId(req.params.rentalId);
  res.status(200).json({ status: 'success', data: { return: record } });
});

module.exports = { processReturn, getAllReturns, getReturn, getReturnByRental };
