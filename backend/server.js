require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SPONTA API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
const authRoutes = require('./src/routes/authRoutes');
const challengeRoutes = require('./src/routes/challengeRoutes');
// const userRoutes = require('./src/routes/userRoutes');
const eventRoutes = require('./src/routes/eventRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);
  
  // Handle custom application errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name || 'Error',
      message: err.message,
      ...(err.errors && { errors: err.errors }), // Include validation errors if present
    });
  }
  
  // Handle unexpected errors
  res.status(err.statusCode || 500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SPONTA API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

