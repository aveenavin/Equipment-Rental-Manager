const User = require('../models/User');

/**
 * Ensures the default admin account exists in the database.
 * Runs once on every server startup. Safe to call repeatedly — it is fully
 * idempotent and will never create a duplicate admin.
 *
 * Credentials  : 73aveen@gmail.com / admin123
 * Role         : admin
 * Status       : active
 * isVerified   : true
 */
const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ email: '73aveen@gmail.com' });

    if (existing) {
      console.log('Admin account already exists — skipping seed.');
      return;
    }

    await User.create({
      name: 'Admin',
      email: '73aveen@gmail.com',
      password: 'admin123', // hashed by the pre-save hook in User.js
      role: 'admin',
      status: 'active',
      isVerified: true,
    });

    console.log('✅ Default admin account created: 73aveen@gmail.com');
  } catch (error) {
    // Log but do not crash the server — a missing admin is recoverable.
    console.error('❌ Failed to seed admin account:', error.message);
  }
};

module.exports = seedAdmin;
