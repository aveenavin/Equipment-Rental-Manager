const { body, query } = require('express-validator');

const recordPaymentValidation = [
  body('rentalId')
    .notEmpty().withMessage('Rental ID is required')
    .isMongoId().withMessage('Invalid rental ID'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero'),

  body('paymentType')
    .notEmpty().withMessage('Payment type is required')
    .isIn(['advance', 'balance', 'damage_charge', 'deposit_refund'])
    .withMessage('Payment type must be one of: advance, balance, damage_charge, deposit_refund'),

  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['cash', 'card', 'bank_transfer', 'online'])
    .withMessage('Payment method must be one of: cash, card, bank_transfer, online'),

  body('direction')
    .notEmpty().withMessage('Payment direction is required')
    .isIn(['inbound', 'outbound'])
    .withMessage('Direction must be either: inbound or outbound'),

  body('transactionId')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Transaction ID cannot exceed 100 characters'),

  body('paidAt')
    .optional()
    .isISO8601().withMessage('paidAt must be a valid ISO 8601 date'),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

const listPaymentsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('paymentType')
    .optional()
    .isIn(['advance', 'balance', 'damage_charge', 'deposit_refund', ''])
    .withMessage('Invalid payment type filter'),
];

module.exports = { recordPaymentValidation, listPaymentsValidation };
