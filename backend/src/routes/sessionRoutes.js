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
const { clearOldSessionsForUser } = require('../controllers/sessionController');
const { validateSessionBooking } = require('../middleware/validation');

const router = express.Router();

// All routes are protected 
router.post('/book', isAuthenticated, bookSession);
router.put('/:sessionId/confirm', isAuthenticated, isSenior, confirmSession);
router.put('/:sessionId/cancel', isAuthenticated, cancelSession);
router.put('/:sessionId/complete', isAuthenticated, isSenior, completeSession);
router.get('/', isAuthenticated, getSessions);
// Clear past sessions for current user (manual)
router.delete('/clear-past', isAuthenticated, clearOldSessionsForUser);
router.get('/:sessionId', isAuthenticated, getSession);

module.exports = router;
