const wishlistService = require('../services/wishlist.service');

exports.toggleWishlist = async (req, res, next) => {
 try {
 const consumerId = req.user.userId;
 const { productId } = req.body;

 if (!productId) {
 return res.status(400).json({
 success: false,
 error: { code: 'MISSING_FIELD', message: 'productId is required' }
 });
 }

 const result = await wishlistService.toggleWishlist(consumerId, productId);
 res.json({ success: true, ...result });
 } catch (error) {
 next(error);
 }
};

exports.getWishlist = async (req, res, next) => {
 try {
 const consumerId = req.user.userId;
 const items = await wishlistService.getWishlist(consumerId);
 res.json({ success: true, data: { items, count: items.length } });
 } catch (error) {
 next(error);
 }
};
