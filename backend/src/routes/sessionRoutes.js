const express = require('express');
const {
  bookSession,
  confirmSession,
  cancelSession,
  getSessions,
  getSession,
  completeSession,
} = require('../controllers/sessionController');
const { isAuthenticated, isSenior } = require('../middleware/auth');
const { validateSessionBooking } = require('../middleware/validation');

const router = express.Router();

// All routes are protected & authorised
router.post('/book', isAuthenticated, bookSession);
router.put('/:sessionId/confirm', isAuthenticated, isSenior, confirmSession);
router.put('/:sessionId/cancel', isAuthenticated, cancelSession);
router.put('/:sessionId/complete', isAuthenticated, isSenior, completeSession);
router.get('/', isAuthenticated, getSessions);
router.get('/:sessionId', isAuthenticated, getSession);

module.exports = router;
