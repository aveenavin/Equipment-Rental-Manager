const { body, query } = require('express-validator');

const createRentalValidation = [
  body('equipment')
    .trim()
    .notEmpty().withMessage('Equipment ID is required')
    .isMongoId().withMessage('Invalid equipment ID'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date')
    .custom((value) => {
      const start = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) throw new Error('Start date cannot be in the past');
      return true;
    }),

  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      const end = new Date(value);
      const start = new Date(req.body.startDate);
      if (end <= start) throw new Error('End date must be after start date');
      return true;
    }),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

  body('deliveryAddress.street')
    .trim()
    .notEmpty().withMessage('Street address is required')
    .isLength({ max: 200 }).withMessage('Street address cannot exceed 200 characters'),

  body('deliveryAddress.city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ max: 100 }).withMessage('City cannot exceed 100 characters'),

  body('deliveryAddress.state')
    .trim()
    .notEmpty().withMessage('State is required')
    .isLength({ max: 100 }).withMessage('State cannot exceed 100 characters'),

  body('deliveryAddress.postalCode')
    .trim()
    .notEmpty().withMessage('Postal code is required')
    .matches(/^\d{6}$/).withMessage('Postal code must be a valid 6-digit Indian PIN code'),

  body('deliveryAddress.country')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Country cannot exceed 100 characters'),
];

const updateRentalStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['confirmed', 'checked_out', 'returned', 'cancelled'])
    .withMessage('Invalid status. Allowed: confirmed, checked_out, returned, cancelled'),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

const listRentalsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'checked_out', 'returned', 'cancelled', ''])
    .withMessage('Invalid status filter'),
];

module.exports = { createRentalValidation, updateRentalStatusValidation, listRentalsValidation };
