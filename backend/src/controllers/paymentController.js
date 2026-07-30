const catchAsync = require('../utils/catchAsync');
const paymentService = require('../services/paymentService');
const { buildInvoice } = require('../utils/invoice');

// POST /api/v1/payments
const recordPayment = catchAsync(async (req, res) => {
  const {
    rentalId, amount, paymentType, paymentMethod,
    direction, transactionId, paidAt, notes,
  } = req.body;

  const payment = await paymentService.recordPayment({
    rentalId, amount, paymentType, paymentMethod,
    direction, transactionId, paidAt, notes,
    recordedById: req.user._id,
  });

  res.status(201).json({ status: 'success', data: { payment } });
});

// GET /api/v1/payments — admin/staff see all; customers see own
const listPayments = catchAsync(async (req, res) => {
  const { role, _id } = req.user;

  if (role === 'customer') {
    const result = await paymentService.listCustomerPayments({
      customerId: _id,
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({ status: 'success', data: result });
  }

  const { page, limit, paymentType, direction, rental, search } = req.query;
  const result = await paymentService.listAllPayments({ page, limit, paymentType, direction, rentalId: rental, search });
  res.status(200).json({ status: 'success', data: result });
});

// GET /api/v1/payments/:id
const getPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id);
  res.status(200).json({ status: 'success', data: { payment } });
});

// GET /api/v1/payments/rental/:rentalId — payments + summary for a specific rental
const getPaymentsByRental = catchAsync(async (req, res) => {
  const result = await paymentService.getPaymentsByRental(req.params.rentalId, req.user);
  res.status(200).json({ status: 'success', data: result });
});

// GET /api/v1/payments/invoice/:rentalId — full invoice document
const getInvoice = catchAsync(async (req, res) => {
  const invoice = await buildInvoice(req.params.rentalId, req.user);
  res.status(200).json({ status: 'success', data: { invoice } });
});

module.exports = { recordPayment, listPayments, getPayment, getPaymentsByRental, getInvoice };
