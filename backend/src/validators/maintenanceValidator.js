const { body, query } = require('express-validator');

const createLogValidation = [
  body('itemId')
    .trim()
    .notEmpty().withMessage('Item ID is required')
    .isMongoId().withMessage('Invalid item ID'),

  body('description')
    .trim()
    .notEmpty().withMessage('Maintenance description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),

  body('estimatedCost')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Estimated cost must be a non-negative number'),

  body('scheduledDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Scheduled date must be a valid ISO 8601 date'),
];

const completeLogValidation = [
  body('technicianNotes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Technician notes cannot exceed 2000 characters'),

  body('actualCost')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Actual cost must be a non-negative number'),
];

const listLogsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['open', 'completed']).withMessage('Status must be open or completed'),
  query('item').optional().isMongoId().withMessage('Invalid item ID'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters'),
];

module.exports = { createLogValidation, completeLogValidation, listLogsValidation };
