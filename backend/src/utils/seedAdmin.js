const User = require('../models/User');

/**
 * Ensures the default admin account exists in the database.
 * Runs once on every server startup — fully idempotent.
 *
 * Credentials are read from environment variables so they can be
 * safely managed via your hosting platform's secret store.
 *
 * Set in production:
 *   ADMIN_EMAIL    – admin login email
 *   ADMIN_PASSWORD – strong admin password (min 8 chars)
 */
const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || '73aveen@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const existing = await User.findOne({ email });

    if (existing) {
      return; // Already exists — nothing to do
    }

    await User.create({
      name: 'Admin',
      email,
      password, // hashed by the pre-save hook in User.js
      role: 'admin',
      status: 'active',
      isVerified: true,
    });

    console.log(`✅ Default admin account created: ${email}`);
  } catch (error) {
    // Log but do not crash the server — a missing admin is recoverable.
    console.error('❌ Failed to seed admin account:', error.message);
  }
};

module.exports = seedAdmin;
