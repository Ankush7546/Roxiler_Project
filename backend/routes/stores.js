const express = require('express');
const router = express.Router();
const store = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('USER'));

router.get('/', store.listStores);
router.post('/:storeId/rating', store.submitRating);

module.exports = router;
