const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.use(authenticateToken);
router.use(roleAuth(['consumer']));

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.toggleWishlist);

module.exports = router;
