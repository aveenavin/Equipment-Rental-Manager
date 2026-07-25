require('dotenv').config();

// ─── Production Environment Validation ───────────────────────────────────────
// Fail fast: exit immediately if critical env vars are missing in production.
if (process.env.NODE_ENV === 'production') {
  const REQUIRED_ENV_VARS = [
    'MONGO_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'CLIENT_URL',
  ];

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables for production:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('Set these variables on your hosting platform and redeploy.');
    process.exit(1);
  }
}

// ─── Cloudinary Credential Check ─────────────────────────────────────────────
// Warn at startup (all environments) so image upload failures are caught early
// rather than only discovered at request time.
const CLOUDINARY_PLACEHOLDERS = [
  'your_cloudinary_cloud_name',
  'your_cloudinary_api_key',
  'your_cloudinary_api_secret',
];
if (
  CLOUDINARY_PLACEHOLDERS.includes(process.env.CLOUDINARY_CLOUD_NAME) ||
  CLOUDINARY_PLACEHOLDERS.includes(process.env.CLOUDINARY_API_KEY) ||
  CLOUDINARY_PLACEHOLDERS.includes(process.env.CLOUDINARY_API_SECRET) ||
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn(' CLOUDINARY WARNING:');

}

const app = require('./src/app');
const connectDB = require('./src/config/db');
const seedAdmin = require('./src/utils/seedAdmin');
const seedData = require('./src/utils/seedData');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, seed required data, then start server
connectDB().then(async () => {
  await seedAdmin();

  // Only seed demo data in non-production environments.
  // In production, data seeding must be explicitly enabled via SEED_DATA=true.
  if (process.env.NODE_ENV !== 'production' || process.env.SEED_DATA === 'true') {
    await seedData();
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle SIGTERM signal (e.g., from deployment platforms)
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated.');
    });
  });
});
