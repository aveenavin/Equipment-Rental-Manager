/**
 * Custom NoSQL injection sanitizer — Express 5 compatible.
 *
 * express-mongo-sanitize@2.x tries to reassign req.query directly which
 * throws a TypeError on Express 5 because req.query is a read-only getter.
 * This middleware mutates request objects in-place instead of replacing them.
 *
 * Strips keys that start with '$' or contain '.' from req.body, req.params,
 * and req.query to prevent NoSQL injection attacks.
 */

const DANGEROUS_KEY = /^\$|\./;

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    if (DANGEROUS_KEY.test(key)) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
};

const mongoSanitize = (req, res, next) => {
  // Mutate in-place — never reassign req.query (read-only in Express 5)
  sanitizeObject(req.body);
  sanitizeObject(req.params);
  sanitizeObject(req.query);
  next();
};

module.exports = mongoSanitize;
