const { body, query } = require('express-validator');

const VALID_CATEGORIES = [
  'heavy-machinery',
  'power-tools',
  'lifting-equipment',
  'compressors',
  'generators',
  'scaffolding',
  'vehicles',
  'other',
];

const VALID_STATUSES = ['available', 'rented', 'maintenance', 'retired'];
const VALID_CONDITIONS = ['excellent', 'good', 'fair', 'poor'];

const createItemValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('dailyRate')
    .notEmpty().withMessage('Daily rate is required')
    .isFloat({ min: 0 }).withMessage('Daily rate must be a non-negative number'),

  body('securityDeposit')
    .notEmpty().withMessage('Security deposit is required')
    .isFloat({ min: 0 }).withMessage('Security deposit must be a non-negative number'),

  body('condition')
    .optional()
    .isIn(VALID_CONDITIONS).withMessage(`Condition must be one of: ${VALID_CONDITIONS.join(', ')}`),

  body('serialNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Serial number cannot exceed 100 characters'),
];

const updateItemValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),

  body('category')
    .optional()
    .trim()
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('dailyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Daily rate must be a non-negative number'),

  body('securityDeposit')
    .optional()
    .isFloat({ min: 0 }).withMessage('Security deposit must be a non-negative number'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('condition')
    .optional()
    .isIn(VALID_CONDITIONS).withMessage(`Condition must be one of: ${VALID_CONDITIONS.join(', ')}`),

  body('serialNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Serial number cannot exceed 100 characters'),
];

const listItemValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

  query('category')
    .optional()
    .isIn([...VALID_CATEGORIES, '']).withMessage('Invalid category filter'),

  query('status')
    .optional()
    .isIn([...VALID_STATUSES, '']).withMessage('Invalid status filter'),
];

module.exports = {
  createItemValidation,
  updateItemValidation,
  listItemValidation,
};
