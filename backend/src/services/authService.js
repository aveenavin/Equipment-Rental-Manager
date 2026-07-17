const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { sendVerificationEmail, sendResendVerificationEmail } = require('../utils/emailService');

/**
 * Generate a raw token and its SHA-256 hash.
 * The raw token is sent to the user; the hash is stored in the DB.
 * This ensures a compromised database cannot be used to verify emails.
 */
const generateVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return { rawToken, hashedToken, expires };
};

/**
 * Register a new customer account.
 * Does NOT issue JWT tokens — user must verify email before login is allowed.
 *
 * Special case: if the email already exists but the account is unverified AND
 * the verification token is expired, we replace the old account and send a
 * fresh verification email. This prevents the "stuck unverified" dead-end.
 */
const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email }).select(
    '+verificationToken +verificationTokenExpires'
  );

  if (existing) {
    // Account is fully verified — block registration
    if (existing.isVerified) {
      throw new AppError('An account with this email already exists.', 409);
    }

    // Account exists, unverified, token still valid — tell user to check inbox
    if (existing.verificationTokenExpires && existing.verificationTokenExpires > Date.now()) {
      throw new AppError(
        'A verification email was already sent to this address. Please check your inbox or request a new link.',
        409
      );
    }

    // Account exists, unverified, token expired — delete stale record and re-register
    await User.findByIdAndDelete(existing._id);
  }

  const { rawToken, hashedToken, expires } = generateVerificationToken();

  const user = await User.create({
    name,
    email,
    password,
    isVerified: false,
    verificationToken: hashedToken,
    verificationTokenExpires: expires,
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

  try {
    await sendVerificationEmail(email, name, verifyUrl);
  } catch (emailErr) {
    console.error('[authService.register] Failed to send verification email:', emailErr);
    await User.findByIdAndDelete(user._id);
    throw new AppError(
      'Failed to send verification email. Please try again later.',
      500
    );
  }

  return { email };
};

/**
 * Login — issues JWT only after verifying credentials and email verification status.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.status === 'suspended') {
    throw new AppError('Your account has been suspended. Please contact support.', 403);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in.', 403);
  }

  const payload = { id: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { user, accessToken, refreshToken };
};

/**
 * Verify a user's email using the raw token from the verification link.
 * Finds the user by the SHA-256 hash of the incoming token.
 */
const verifyEmail = async (rawToken) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  }).select('+verificationToken +verificationTokenExpires');

  if (!user) {
    throw new AppError(
      'Verification link is invalid or has expired. Please request a new one.',
      400
    );
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return { user };
};

/**
 * Resend a verification email.
 * Invalidates the previous token and generates a fresh one.
 * Returns the same generic response whether or not the email exists
 * to prevent email enumeration attacks.
 */
const resendVerification = async (email) => {
  const user = await User.findOne({ email }).select(
    '+verificationToken +verificationTokenExpires +isVerified'
  );

  // Generic response — do not reveal whether this email is registered
  if (!user) {
    return { email };
  }

  if (user.isVerified) {
    throw new AppError('This account is already verified. Please log in.', 400);
  }

  const { rawToken, hashedToken, expires } = generateVerificationToken();

  user.verificationToken = hashedToken;
  user.verificationTokenExpires = expires;
  await user.save();

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

  try {
    await sendResendVerificationEmail(email, user.name, verifyUrl);
  } catch {
    throw new AppError(
      'Failed to send verification email. Please try again later.',
      500
    );
  }

  return { email };
};

module.exports = { register, login, verifyEmail, resendVerification };
