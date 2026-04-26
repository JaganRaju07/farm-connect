const express = require('express');
const router = express.Router();
const { placeOrder } = require('../services/order.service');

// Handle POST /api/orders/place
router.post('/place', async (req, res) => {
  try {
    const newOrder = await placeOrder(req.body);
    
    res.status(201).json({ 
        success: true, 
        message: "Order placed successfully!", 
        order: newOrder 
    });
  } catch (error) {
    console.error("Order error:", error);
    res.status(400).json({ 
        success: false, 
        message: error.message 
    });
  }
});

module.exports = router;