const { body, query } = require('express-validator');

const processReturnValidation = [
  body('rentalId')
    .trim()
    .notEmpty().withMessage('Rental ID is required')
    .isMongoId().withMessage('Invalid rental ID'),

  body('conditionAtReturn')
    .notEmpty().withMessage('Condition at return is required')
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('Condition must be one of: excellent, good, fair, poor'),

  body('isDamaged')
    .optional()
    .isBoolean().withMessage('isDamaged must be a boolean'),

  body('damageDescription')
    .if(body('isDamaged').equals('true'))
    .notEmpty().withMessage('Damage description is required when equipment is damaged')
    .isLength({ max: 1000 }).withMessage('Damage description cannot exceed 1000 characters'),

  body('damageCharges')
    .optional()
    .isFloat({ min: 0 }).withMessage('Damage charges must be a non-negative number'),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

  body('returnDate')
    .optional()
    .isISO8601().withMessage('Return date must be a valid ISO 8601 date'),
];

const listReturnsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

module.exports = { processReturnValidation, listReturnsValidation };
