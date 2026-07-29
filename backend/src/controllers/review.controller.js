const reviewService = require('../services/review.service');

exports.createReview = async (req, res, next) => {
 try {
 const consumerId = req.user.userId;
 const { productId, orderId, rating, reviewText, reviewImages } = req.body;

 if (!productId || !orderId || !rating) {
 return res.status(400).json({
 success: false,
 error: { code: 'MISSING_FIELDS', message: 'productId, orderId and rating are required' }
 });
 }

 const review = await reviewService.createReview(consumerId, {
 productId, orderId, rating, reviewText, reviewImages
 });

 res.status(201).json({
 success: true,
 message: 'Review submitted successfully',
 data: { review }
 });
 } catch (error) {
 next(error);
 }
};

exports.getProductReviews = async (req, res, next) => {
 try {
 const { id } = req.params;
 const { page, limit } = req.query;

 const data = await reviewService.getProductReviews(id, { page, limit });

 res.json({ success: true, data });
 } catch (error) {
 next(error);
 }
};

exports.checkCanReview = async (req, res, next) => {
 try {
 const consumerId = req.user.userId;
 const { productId, orderId } = req.query;

 const canReview = await reviewService.checkCanReview(consumerId, productId, orderId);

 res.json({ success: true, data: { canReview } });
 } catch (error) {
 next(error);
 }
};
