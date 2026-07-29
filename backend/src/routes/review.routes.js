const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authenticateToken = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Public — anyone can read reviews
router.get('/product/:id', reviewController.getProductReviews);

// Protected — only consumers can write reviews
router.post('/', authenticateToken, roleAuth(['consumer']), reviewController.createReview);
router.get('/can-review', authenticateToken, roleAuth(['consumer']), reviewController.checkCanReview);

module.exports = router;
