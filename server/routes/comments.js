const express = require('express');
const { auth } = require('../middleware/auth');
const { list, create, update, remove } = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

router.get('/', list);
router.post('/', auth, create);
router.put('/:commentId', auth, update);
router.delete('/:commentId', auth, remove);

module.exports = router;
