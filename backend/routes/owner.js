const express = require('express');
const router = express.Router();
const owner = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('OWNER'));

router.get('/dashboard', owner.dashboard);

module.exports = router;
