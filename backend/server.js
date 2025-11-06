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
// TODO: Import and use route files
// const authRoutes = require('./src/routes/authRoutes');
// const userRoutes = require('./src/routes/userRoutes');
// const challengeRoutes = require('./src/routes/challengeRoutes');
// const eventRoutes = require('./src/routes/eventRoutes');

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/challenges', challengeRoutes);
// app.use('/api/events', eventRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SPONTA API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

