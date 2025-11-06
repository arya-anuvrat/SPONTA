const express = require('express');
const router = express.Router();

// TODO: Implement event routes
// - GET / - Get all events
// - GET /:id - Get event by ID
// - POST / - Create new event
// - POST /:id/join - Join an event
// - POST /:id/leave - Leave an event
// - GET /nearby - Get nearby events

router.get('/', (req, res) => {
  res.json({ message: 'Event routes - To be implemented' });
});

module.exports = router;

