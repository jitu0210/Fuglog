const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  list, getById, create, update, remove, related, like, dislike, wishlist,
} = require('../controllers/postController');

const router = express.Router();

router.get('/', optionalAuth, list);
router.get('/:id', optionalAuth, getById);
router.get('/:id/related', optionalAuth, related);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);
router.post('/:id/like', auth, like);
router.post('/:id/dislike', auth, dislike);
router.post('/:id/wishlist', auth, wishlist);

module.exports = router;
