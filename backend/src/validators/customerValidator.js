const { body, query } = require('express-validator');

const updateCustomerValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters'),

  body('phone')
    .optional({ nullable: true })
    .trim()
    .matches(/^[+\d\s\-()]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('status')
    .optional()
    .isIn(['active', 'suspended'])
    .withMessage('Status must be either "active" or "suspended"'),
];

const listCustomersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['active', 'suspended', ''])
    .withMessage('Status must be "active" or "suspended"'),
];

module.exports = { updateCustomerValidation, listCustomersValidation };
