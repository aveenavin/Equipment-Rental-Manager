const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('./middleware/sanitize');

const { globalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const apiRouter = require('./routes/index');

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Global rate limiter
app.use(globalLimiter);

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// NoSQL injection sanitization
app.use(mongoSanitize);

// API routes
app.use('/api/v1', apiRouter);

// Unhandled route handler
app.all('/{*path}', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server.`, 404));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
