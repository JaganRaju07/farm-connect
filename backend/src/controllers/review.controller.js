const reviewService = require('../services/review.service');

exports.getProductReviews = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid product ID' }
      });
    }

    const data = await reviewService.getProductReviews(productId, { page, limit });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const consumerId = req.user.userId;
    const { productId, orderId, rating, reviewText, reviewImages } = req.body;

    // Input validation
    if (!productId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'productId, orderId, and rating are required'
        }
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RATING',
          message: 'Rating must be an integer between 1 and 5'
        }
      });
    }

    const review = await reviewService.createReview(consumerId, {
      productId: parseInt(productId),
      orderId: parseInt(orderId),
      rating,
      reviewText: reviewText || null,
      reviewImages: reviewImages || []
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    // REVIEW_NOT_ELIGIBLE is a valid business error, not a server error
    if (error.code === 'REVIEW_NOT_ELIGIBLE') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'REVIEW_NOT_ELIGIBLE',
          message: error.message
        }
      });
    }

    // Duplicate review (PostgreSQL unique constraint violation — code 23505)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_REVIEWED',
          message: 'You have already reviewed this product for this order'
        }
      });
    }

    next(error);
  }
};

exports.checkCanReview = async (req, res, next) => {
  try {
    const consumerId = req.user.userId;
    const productId = parseInt(req.query.productId);
    const orderId = parseInt(req.query.orderId);

    if (isNaN(productId) || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'productId and orderId query params required' }
      });
    }

    const canReview = await reviewService.checkCanReview(consumerId, productId, orderId);

    res.json({
      success: true,
      data: { canReview }
    });
  } catch (error) {
    next(error);
  }
};
