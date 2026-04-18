const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Line 6 / Endpoint setup
router.get('/search', productController.searchNearbyProducts);
router.get('/category/:categoryName', productController.getProductsByCategory);

module.exports = router;