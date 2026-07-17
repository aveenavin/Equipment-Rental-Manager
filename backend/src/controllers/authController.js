const authService = require('../services/authService');
const {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} = require('../utils/cookieOptions');
const { verifyRefreshToken, signAccessToken } = require('../utils/jwt');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');

// Helper: set auth cookies and send JSON response
const sendAuthResponse = (res, statusCode, user, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, accessTokenCookieOptions());
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions());

  // Explicitly remove password before sending (handles newly created documents)
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.verificationToken;
  delete userObj.verificationTokenExpires;

  res.status(statusCode).json({
    status: 'success',
    data: { user: userObj },
  });
};

// POST /api/v1/auth/register
// Registration no longer logs the user in — returns email for the "check your email" page.
const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const { email: registeredEmail } = await authService.register({ name, email, password });

  res.status(201).json({
    status: 'success',
    message: 'Account created! Please check your email to verify your account.',
    data: { email: registeredEmail },
  });
});

// POST /api/v1/auth/login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({ email, password });
  sendAuthResponse(res, 200, user, accessToken, refreshToken);
});

// POST /api/v1/auth/logout
const logout = (req, res) => {
  res.clearCookie('accessToken', clearCookieOptions());
  res.clearCookie('refreshToken', clearCookieOptions());
  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
};

// POST /api/v1/auth/refresh
const refresh = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return next(new AppError('No refresh token provided. Please log in again.', 401));
  }

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists. Please log in again.', 401));
  }

  if (user.status === 'suspended') {
    return next(new AppError('Your account has been suspended.', 403));
  }

  const newAccessToken = signAccessToken({ id: user._id, role: user.role });
  res.cookie('accessToken', newAccessToken, accessTokenCookieOptions());

  res.status(200).json({ status: 'success', message: 'Access token refreshed.' });
});

// GET /api/v1/auth/me
const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});

// GET /api/v1/auth/verify/:token
const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.params.token);

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully. You can now log in.',
  });
});

// POST /api/v1/auth/resend-verification
const resendVerification = catchAsync(async (req, res) => {
  await authService.resendVerification(req.body.email);

  // Always return 200 — never reveal whether the email is registered (enumeration prevention)
  res.status(200).json({
    status: 'success',
    message: 'If that email is registered and unverified, a new verification link has been sent.',
  });
});

module.exports = { register, login, logout, refresh, getMe, verifyEmail, resendVerification };
