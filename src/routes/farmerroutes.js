const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');

// --- Farmer Authentication ---
// This was causing your crash - it MUST exist in the controller
router.post('/register', farmerController.registerFarmer);

// --- Farmer Dashboard & Profile ---
router.get('/dashboard', farmerController.getDashboard);

// --- Product Management (CRUD) ---
router.post('/products', farmerController.addProduct);
router.get('/products', farmerController.getAllProducts);
router.put('/products/:id', farmerController.updateProduct);
router.delete('/products/:id', farmerController.deleteProduct);

// --- Order Management ---
router.get('/orders', farmerController.getOrders);

module.exports = router;