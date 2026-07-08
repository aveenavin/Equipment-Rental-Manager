const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to access this resource.', 401)
    );
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  if (user.status === 'suspended') {
    return next(
      new AppError('Your account has been suspended. Please contact support.', 403)
    );
  }

  req.user = user;
  next();
});

module.exports = protect;
