const express = require('express');
const { auth } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { register, login, me } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', auth, me);

module.exports = router;
