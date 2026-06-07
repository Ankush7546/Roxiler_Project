const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.get('/me', authenticate, auth.me);
router.put('/password', authenticate, auth.updatePassword);

module.exports = router;
