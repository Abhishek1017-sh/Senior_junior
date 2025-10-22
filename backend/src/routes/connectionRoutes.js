const express = require('express');
const {
  sendConnectionRequest,
  acceptConnectionRequest,
  getConnections,
  removeConnection,
} = require('../controllers/connectionController');
const { isAuthenticated, isSenior } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/request/:seniorId', isAuthenticated, sendConnectionRequest);
router.post('/accept/:juniorId', isAuthenticated, isSenior, acceptConnectionRequest);
router.get('/', isAuthenticated, getConnections);
router.delete('/:connectionId', isAuthenticated, removeConnection);

module.exports = router;
