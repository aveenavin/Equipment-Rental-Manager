const express = require('express');
const { registerValidation, loginValidation, resendVerificationValidation } = require('../validators/authValidator');
const validate = require('../utils/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const protect = require('../middleware/protect');
const {
  register,
  login,
  logout,
  refresh,
  getMe,
  verifyEmail,
  resendVerification,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

// Email verification
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerificationValidation, validate, resendVerification);

module.exports = router;
