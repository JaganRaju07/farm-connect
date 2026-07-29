const express = require('express');
const router = express.Router();
const stockService = require('../services/stock.service');
const { getFarmerRatingSummary } = require('../services/review.service');

// Low stock products
router.get('/products/low-stock', async (req, res, next) => {
 try {
 const farmerId = req.user.userId;
 const products = await stockService.getLowStockProducts(farmerId);
 res.json({ success: true, data: { products, count: products.length } });
 } catch (error) {
 next(error);
 }
});

// Update low stock threshold for a product
router.patch('/products/:id/threshold', async (req, res, next) => {
 try {
 const farmerId = req.user.userId;
 const productId = req.params.id;
 const { threshold } = req.body;

 const product = await stockService.updateStockThreshold(productId, farmerId, threshold);
 res.json({ success: true, data: { product } });
 } catch (error) {
 next(error);
 }
});

router.get('/rating-summary', async (req, res, next) => {
 try {
 const summary = await getFarmerRatingSummary(req.user.userId);
 res.json({ success: true, data: { summary } });
 } catch (error) {
 next(error);
 }
});

module.exports = router;
