const express = require('express');
const { registerValidation, loginValidation } = require('../validators/authValidator');
const validate = require('../utils/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const protect = require('../middleware/protect');
const { register, login, logout, refresh, getMe } = require('../controllers/authController');

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

module.exports = router;
