const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const { getFarmerRatingSummary } = require('../services/review.service');

// Add these two routes — IMPORTANT: /products/low-stock must come BEFORE /products/:id
router.get('/products/low-stock', stockController.getLowStockProducts);
router.patch('/products/:id/threshold', stockController.updateStockThreshold);

router.get('/rating-summary', async (req, res, next) => {
  try {
    const farmerId = req.user.userId;
    const summary = await getFarmerRatingSummary(farmerId);
    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
