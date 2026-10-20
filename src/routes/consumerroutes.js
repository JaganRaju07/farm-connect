const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// --- Consumer Registration (Public) ---
router.post('/register', consumerController.registerConsumer);

// --- Protected Consumer Orders ---
router.use(auth, roleAuth(['consumer', 'admin', 'super_admin', 'moderator']));

router.post('/orders', consumerController.placeOrder);
router.get('/orders', consumerController.getOrderHistory);

module.exports = router;
