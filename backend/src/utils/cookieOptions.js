const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * sameSite strategy:
 *  - 'strict'  → frontend and backend on the SAME domain (default)
 *  - 'none'    → frontend and backend on DIFFERENT domains (e.g. Vercel + Render)
 *                Requires HTTPS (secure: true) — only valid in production.
 *
 * Set COOKIE_SAME_SITE=none in your hosting env when frontend/backend are on
 * different origins (cross-site). Leave unset for same-domain deploys.
 */
const getSameSite = () => {
  const override = process.env.COOKIE_SAME_SITE;
  if (override === 'none' && isProduction()) return 'none';
  return isProduction() ? 'strict' : 'lax';
};

const accessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: getSameSite(),
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutes in ms
});

const refreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: getSameSite(),
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
});

const clearCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: getSameSite(),
  path: '/',
  expires: new Date(0),
});

module.exports = {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
};
