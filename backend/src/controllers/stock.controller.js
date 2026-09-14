const stockService = require('../services/stock.service');

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const farmerId = req.user.userId;
    const products = await stockService.getLowStockProducts(farmerId);
    
    res.json({
      success: true,
      data: {
        products,
        count: products.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStockThreshold = async (req, res, next) => {
  try {
    const farmerId = req.user.userId;
    const productId = parseInt(req.params.id);
    const { threshold } = req.body;

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid product ID' }
      });
    }

    if (threshold === undefined || isNaN(parseInt(threshold)) || parseInt(threshold) < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_THRESHOLD',
          message: 'Threshold must be a non-negative integer'
        }
      });
    }

    const product = await stockService.updateStockThreshold(
      productId,
      farmerId,
      parseInt(threshold)
    );

    res.json({
      success: true,
      message: `Alert threshold updated to ${threshold} ${product.unit}`,
      data: { product }
    });

  } catch (error) {
    next(error);
  }
};
