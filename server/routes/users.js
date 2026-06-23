const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  getTrendingTags, getProfile, getUserPosts, getUserWishlist,
  updateProfile, follow,
} = require('../controllers/userController');

const router = express.Router();

router.get('/trending-tags', getTrendingTags);
router.get('/:id', getProfile);
router.get('/:id/posts', optionalAuth, getUserPosts);
router.get('/:id/wishlist', optionalAuth, getUserWishlist);
router.put('/profile', auth, updateProfile);
router.post('/:id/follow', auth, follow);

module.exports = router;
