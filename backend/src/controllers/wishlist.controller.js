const wishlistService = require('../services/wishlist.service');

exports.getWishlist = async (req, res, next) => {
  try {
    const consumerId = req.user.userId;
    const items = await wishlistService.getWishlist(consumerId);
    
    res.json({
      success: true,
      data: {
        items,
        count: items.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const consumerId = req.user.userId;
    const { productId } = req.body;

    if (!productId || isNaN(parseInt(productId))) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELD', message: 'productId is required' }
      });
    }

    const result = await wishlistService.toggleWishlist(
      consumerId,
      parseInt(productId)
    );

    res.json({
      success: true,
      message: result.message,
      data: { saved: result.saved }
    });
  } catch (error) {
    next(error);
  }
};
