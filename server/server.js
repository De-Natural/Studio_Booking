const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Connect to Database
connectDB();

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route imports
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');
const settingsRoutes = require('./routes/settings.routes');
const { getAvailability, getTimeslots } = require('./controllers/booking.controller');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Special endpoints to match exact URL contracts
app.get('/api/availability', getAvailability);
app.get('/api/timeslots', getTimeslots);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
