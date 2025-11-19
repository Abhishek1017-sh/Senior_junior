const express = require('express');
const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  withdrawConnectionRequest,
  getConnections,
  getPendingConnections,
  getPendingConnectionsCount,
  removeConnection,
} = require('../controllers/connectionController');
const { isAuthenticated, isSenior } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/request/:seniorId', isAuthenticated, sendConnectionRequest);
router.post('/accept/:juniorId', isAuthenticated, isSenior, acceptConnectionRequest);
router.post('/reject/:juniorId', isAuthenticated, isSenior, rejectConnectionRequest);
// Junior can withdraw a previously sent connection request
router.delete('/withdraw/:seniorId', isAuthenticated, withdrawConnectionRequest);
router.get('/', isAuthenticated, getConnections);
router.get('/pending', isAuthenticated, getPendingConnections);
router.get('/pending/count', isAuthenticated, getPendingConnectionsCount);
router.delete('/:connectionId', isAuthenticated, removeConnection);

module.exports = router;
