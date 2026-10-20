const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// --- Farmer Registration (Public) ---
router.post('/register', farmerController.registerFarmer);

// --- Public Product Browsing ---
router.get('/products', farmerController.getAllProducts);

// --- Protected Farmer Routes ---
router.use(auth, roleAuth(['farmer', 'admin', 'super_admin', 'moderator']));

// --- Farmer Dashboard & Profile ---
router.get('/dashboard', farmerController.getDashboard);

// --- Product Management (CRUD) ---
router.post('/products', farmerController.addProduct);
router.put('/products/:id', farmerController.updateProduct);
router.delete('/products/:id', farmerController.deleteProduct);

// --- Order Management ---
router.get('/orders', farmerController.getOrders);

module.exports = router;
