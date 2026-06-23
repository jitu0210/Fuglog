const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimiter');
const {
  list, getById, getByCode, create, update, remove, related, like, dislike, wishlist,
} = require('../controllers/postController');

const router = express.Router();

router.get('/', optionalAuth, list);
router.get('/code/:code', optionalAuth, getByCode);
router.get('/:id', optionalAuth, getById);
router.get('/:id/related', optionalAuth, related);
router.post('/', auth, writeLimiter, create);
router.put('/:id', auth, writeLimiter, update);
router.delete('/:id', auth, writeLimiter, remove);
router.post('/:id/like', auth, like);
router.post('/:id/dislike', auth, dislike);
router.post('/:id/wishlist', auth, wishlist);

module.exports = router;
