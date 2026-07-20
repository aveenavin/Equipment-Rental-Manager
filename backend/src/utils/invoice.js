const Rental = require('../models/Rental');
const Return = require('../models/Return');
const Payment = require('../models/Payment');
const AppError = require('./AppError');

/**
 * Generates a professional invoice number from a rental ID and creation date.
 * Format: INV-YYYY-XXXXXX (last 6 chars of rental ObjectId)
 */
const generateInvoiceNumber = (rentalId, createdAt) => {
  const year = new Date(createdAt).getFullYear();
  const suffix = rentalId.toString().slice(-6).toUpperCase();
  return `INV-${year}-${suffix}`;
};

/**
 * Computes payment summary for a rental.
 * Returns totalPaid, totalRefunded, netPaid, and balance.
 */
const computePaymentSummary = (payments, totalAmount) => {
  const inbound = payments
    .filter((p) => p.direction === 'inbound' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const outbound = payments
    .filter((p) => p.direction === 'outbound' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  // Balance = what the customer still owes (inbound payments only)
  // Outbound refunds are tracked separately; they don't reduce what's owed
  const balance = parseFloat((totalAmount - inbound).toFixed(2));
  const netCashFlow = parseFloat((inbound - outbound).toFixed(2));

  return {
    totalPaid: parseFloat(inbound.toFixed(2)),
    totalRefunded: parseFloat(outbound.toFixed(2)),
    netPaid: parseFloat(inbound.toFixed(2)),
    netCashFlow,
    balance: Math.max(0, balance),
    isFullyPaid: balance <= 0,
  };
};

/**
 * Build full invoice data for a rental.
 * Compiles rental + equipment + customer + payment history + return record.
 * Callable by admin/staff (all rentals) and customers (own rentals only).
 */
const buildInvoice = async (rentalId, requestingUser) => {
  const rental = await Rental.findById(rentalId)
    .populate('customer', 'name email phone')
    .populate('equipment', 'name category serialNumber images')
    .populate('handledBy', 'name role')
    .lean();

  if (!rental) throw new AppError('Rental not found.', 404);

  // Customers can only see their own invoices
  if (
    requestingUser.role === 'customer' &&
    rental.customer._id.toString() !== requestingUser._id.toString()
  ) {
    throw new AppError('You do not have permission to view this invoice.', 403);
  }

  // Get payments for this rental
  const payments = await Payment.find({ rental: rentalId })
    .populate('recordedBy', 'name role')
    .sort({ paidAt: 1 })
    .lean();

  // Get return record (if returned)
  const returnRecord = await Return.findOne({ rental: rentalId })
    .populate('processedBy', 'name role')
    .lean();

  // Build line items
  const lineItems = [
    {
      description: `Equipment Rental — ${rental.equipment.name}`,
      detail: `${rental.totalDays} day${rental.totalDays !== 1 ? 's' : ''} × $${rental.dailyRate}/day`,
      amount: rental.rentalCost,
      type: 'rental',
    },
    {
      description: 'Security Deposit',
      detail: 'Refundable upon return in acceptable condition',
      amount: rental.securityDeposit,
      type: 'deposit',
    },
  ];

  // Add damage charges if returned with damage
  if (returnRecord?.isDamaged && returnRecord.damageCharges > 0) {
    lineItems.push({
      description: 'Damage Charges',
      detail: returnRecord.damageDescription || 'Equipment returned with damage',
      amount: returnRecord.damageCharges,
      type: 'damage',
    });
  }

  // Deposit refund
  if (returnRecord?.depositRefunded > 0) {
    lineItems.push({
      description: 'Deposit Refund',
      detail: `Security deposit refunded to customer`,
      amount: -returnRecord.depositRefunded,
      type: 'refund',
    });
  }

  const paymentSummary = computePaymentSummary(payments, rental.totalAmount);

  // Determine invoice status
  let invoiceStatus = 'unpaid';
  if (rental.status === 'cancelled') invoiceStatus = 'cancelled';
  else if (paymentSummary.isFullyPaid) invoiceStatus = 'paid';
  else if (paymentSummary.netPaid > 0) invoiceStatus = 'partial';

  return {
    invoiceNumber: generateInvoiceNumber(rental._id, rental.createdAt),
    issuedAt: rental.createdAt,
    status: invoiceStatus,

    customer: rental.customer,
    equipment: rental.equipment,

    rental: {
      id: rental._id,
      startDate: rental.startDate,
      endDate: rental.endDate,
      totalDays: rental.totalDays,
      dailyRate: rental.dailyRate,
      status: rental.status,
      notes: rental.notes,
    },

    lineItems,

    totals: {
      subtotal: rental.rentalCost,
      securityDeposit: rental.securityDeposit,
      totalAmount: rental.totalAmount,
      damageCharges: returnRecord?.damageCharges || 0,
      depositRefunded: returnRecord?.depositRefunded || 0,
    },

    paymentSummary,
    payments,

    returnRecord: returnRecord
      ? {
        returnDate: returnRecord.returnDate,
        conditionAtReturn: returnRecord.conditionAtReturn,
        isDamaged: returnRecord.isDamaged,
        damageDescription: returnRecord.damageDescription,
        damageCharges: returnRecord.damageCharges,
        depositDeducted: returnRecord.depositDeducted,
        depositRefunded: returnRecord.depositRefunded,
        processedBy: returnRecord.processedBy,
      }
      : null,
  };
};

module.exports = { buildInvoice, computePaymentSummary, generateInvoiceNumber };
