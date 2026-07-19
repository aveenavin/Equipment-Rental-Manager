require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const seedAdmin = require('./src/utils/seedAdmin');
const seedData = require('./src/utils/seedData');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, seed required data, then start server
connectDB().then(async () => {
  await seedAdmin();
  await seedData();

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
