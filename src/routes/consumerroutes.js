const express = require('express');
const router = express.Router();

// 1. THIS IS THE CRITICAL LINE THAT FIXES THE ERROR:
const consumerController = require('../controllers/consumerController');

// 2. Your routes:
router.post('/register', consumerController.registerConsumer);
router.post('/orders', consumerController.placeOrder);
router.get('/orders', consumerController.getOrderHistory);

module.exports = router;