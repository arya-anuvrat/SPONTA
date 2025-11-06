const express = require('express');
const router = express.Router();

// TODO: Implement challenge routes
// - GET / - Get all challenges
// - GET /:id - Get challenge by ID
// - POST / - Create new challenge
// - POST /:id/accept - Accept a challenge
// - POST /:id/complete - Complete a challenge
// - GET /nearby - Get nearby challenges

router.get('/', (req, res) => {
  res.json({ message: 'Challenge routes - To be implemented' });
});

module.exports = router;

