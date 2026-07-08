const { validationResult } = require('express-validator');
const AppError = require('./AppError');

// Middleware that reads express-validator results and returns a 400 AppError if invalid
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((e) => e.msg)
      .join('. ');
    return next(new AppError(messages, 400));
  }
  next();
};

module.exports = validate;
