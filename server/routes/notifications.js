const express = require('express');
const { auth } = require('../middleware/auth');
const { list, markRead } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', auth, list);
router.put('/read', auth, markRead);

module.exports = router;
