const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', admin.dashboard);
router.post('/users', admin.createUser);
router.get('/users', admin.listUsers);
router.get('/users/:id', admin.userDetails);
router.post('/stores', admin.createStore);
router.get('/stores', admin.listStores);
router.get('/owners', admin.listOwners);

module.exports = router;
