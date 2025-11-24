const express = require('express');
const { submitReport } = require('../controllers/reportController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// POST /api/reports - submit a report (authenticated)
router.post('/', isAuthenticated, submitReport);

module.exports = router;
