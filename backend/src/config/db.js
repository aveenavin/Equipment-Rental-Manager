const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const isProd = process.env.NODE_ENV === 'production';

  if (!uri || uri === 'PASTE_YOUR_ATLAS_URI_HERE') {
    if (isProd) {
      // Hard exit in production — a missing DB URI is unrecoverable
      console.error('❌ MONGO_URI is not set. Cannot start server in production.');
      process.exit(1);
    }

    console.warn('\n==================================================================');
    console.warn('⚠️  DATABASE CONFIGURATION WARNING:');
    console.warn('MONGO_URI is not set or is still using the placeholder in backend/.env.');
    console.warn('Please update it with your actual MongoDB Atlas connection string.');
    console.warn('The API server will run, but database operations will fail.');
    console.warn('==================================================================\n');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
