const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const AppError = require('../utils/AppError');
const { computePaymentSummary } = require('../utils/invoice');

/**
 * Record a new payment against a rental.
 * - Validates the rental exists and is not cancelled
 * - Guards against overpayment (inbound) beyond total amount
 * - Customers cannot record payments themselves; only admin/staff
 */
const recordPayment = async ({
  rentalId,
  amount,
  paymentType,
  paymentMethod,
  direction,
  transactionId,
  paidAt,
  notes,
  recordedById,
}) => {
  const rental = await Rental.findById(rentalId).populate('customer', 'name email');
  if (!rental) throw new AppError('Rental not found.', 404);

  if (rental.status === 'cancelled') {
    throw new AppError('Cannot record payments for a cancelled rental.', 400);
  }

  const parsedAmount = parseFloat(amount);

  // Guard against inbound overpayment
  if (direction === 'inbound') {
    const existing = await Payment.find({ rental: rentalId, direction: 'inbound', status: 'completed' });
    const alreadyPaid = parseFloat(existing.reduce((sum, p) => sum + p.amount, 0).toFixed(2));
    const afterPayment = parseFloat((alreadyPaid + parsedAmount).toFixed(2));
    if (afterPayment > rental.totalAmount + 0.01) {
      throw new AppError(
        `Payment of ₹${parsedAmount} would exceed the total amount due (₹${rental.totalAmount}). Already paid: ₹${alreadyPaid.toFixed(2)}.`,
        400
      );
    }
  }

  const payment = await Payment.create({
    rental: rentalId,
    customer: rental.customer._id,
    amount: parsedAmount,
    paymentType,
    paymentMethod,
    direction,
    transactionId: transactionId || null,
    paidAt: paidAt ? new Date(paidAt) : new Date(),
    notes: notes || null,
    recordedBy: recordedById,
  });

  return payment.populate([
    { path: 'rental', select: 'startDate endDate totalAmount status' },
    { path: 'customer', select: 'name email' },
    { path: 'recordedBy', select: 'name role' },
  ]);
};

/**
 * Get all payments for a specific rental with a live payment summary.
 */
const getPaymentsByRental = async (rentalId, requestingUser) => {
  const rental = await Rental.findById(rentalId).lean();
  if (!rental) throw new AppError('Rental not found.', 404);

  // Customers can only view payments for their own rentals
  if (
    requestingUser.role === 'customer' &&
    rental.customer.toString() !== requestingUser._id.toString()
  ) {
    throw new AppError('You do not have permission to view these payments.', 403);
  }

  const payments = await Payment.find({ rental: rentalId })
    .populate('recordedBy', 'name role')
    .sort({ paidAt: 1 })
    .lean();

  const summary = computePaymentSummary(payments, rental.totalAmount);

  return { payments, summary, rental };
};

/**
 * Get a single payment by ID.
 */
const getPaymentById = async (paymentId) => {
  const payment = await Payment.findById(paymentId)
    .populate('rental', 'startDate endDate totalAmount status')
    .populate('customer', 'name email')
    .populate('recordedBy', 'name role')
    .lean();

  if (!payment) throw new AppError('Payment not found.', 404);
  return payment;
};

/**
 * List all payments with optional filters. Admin/Staff only.
 */
const listAllPayments = async ({ page = 1, limit = 20, paymentType, direction, rentalId }) => {
  const filter = {};
  if (paymentType) filter.paymentType = paymentType;
  if (direction) filter.direction = direction;
  if (rentalId) filter.rental = rentalId;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('customer', 'name email')
      .populate('rental', 'startDate endDate totalAmount status')
      .populate('recordedBy', 'name role')
      .lean(),
    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  };
};

/**
 * List payments for a specific customer (customers see own only).
 */
const listCustomerPayments = async ({ customerId, page = 1, limit = 20 }) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [payments, total] = await Promise.all([
    Payment.find({ customer: customerId })
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('rental', 'startDate endDate totalAmount status')
      .populate('recordedBy', 'name role')
      .lean(),
    Payment.countDocuments({ customer: customerId }),
  ]);

  return {
    payments,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  };
};

module.exports = {
  recordPayment,
  getPaymentsByRental,
  getPaymentById,
  listAllPayments,
  listCustomerPayments,
};
