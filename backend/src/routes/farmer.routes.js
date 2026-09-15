const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const { getFarmerRatingSummary } = require('../services/review.service');
const { getFarmerDashboardData } = require('../services/dashboard.service');
const { getOrdersForFarmer, updateOrderStatus } = require('../services/order.service');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

router.use(authenticateToken);
router.use(requireRole('farmer'));

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

router.get('/dashboard', async (req, res, next) => {
  try {
    const farmerId = req.user.userId;
    const dashboardData = await getFarmerDashboardData(farmerId);
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const farmerId = req.user.userId;
    const { status, limit, offset } = req.query;
    
    const orders = await getOrdersForFarmer(
      farmerId, 
      status, 
      limit ? parseInt(limit) : 20, 
      offset ? parseInt(offset) : 0
    );
    
    res.json({
      success: true,
      data: { orders, count: orders.length }
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const farmerId = req.user.userId;
    const orderId = req.params.id;
    const { status, farmerNotes } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, error: { message: 'Status is required' }});
    }

    const updatedOrder = await updateOrderStatus(orderId, farmerId, status, farmerNotes);
    
    res.json({
      success: true,
      data: { order: updatedOrder }
    });
  } catch (error) {
    if (error.message.includes('not a valid order status') || error.message.includes('Cannot change order')) {
      return res.status(400).json({ success: false, error: { message: error.message }});
    }
    next(error);
  }
});

// GET /products
router.get('/products', async (req, res, next) => {
  try {
    const farmerId = req.user.userId;
    const result = await db.query(
      'SELECT * FROM products WHERE farmer_id = $1 ORDER BY created_at DESC',
      [farmerId]
    );
    res.json({ success: true, data: { products: result.rows, count: result.rows.length } });
  } catch (err) { next(err); }
});

// POST /products
router.post('/products', async (req, res, next) => {
  try {
    const farmerId = req.user.userId;
    const { name, category, description, price, unit, stock_available, is_organic, image_url } = req.body;
    
    const result = await db.query(
      `INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available, is_organic, primary_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [farmerId, name, category, description, price, unit, stock_available, is_organic || false, image_url]
    );
    res.status(201).json({ success: true, data: { product: result.rows[0] } });
  } catch (err) { next(err); }
});

// PUT /products/:id
router.put('/products/:id', async (req, res, next) => {
  try {
    const farmerId = req.user.userId;
    const productId = req.params.id;
    const { name, category, description, price, unit, stock_available, is_organic, image_url, is_active } = req.body;
    
    // Build update dynamically
    const updates = [];
    const values = [];
    let idx = 1;
    
    if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name); }
    if (category !== undefined) { updates.push(`category = $${idx++}`); values.push(category); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
    if (price !== undefined) { updates.push(`price = $${idx++}`); values.push(price); }
    if (unit !== undefined) { updates.push(`unit = $${idx++}`); values.push(unit); }
    if (stock_available !== undefined) { updates.push(`stock_available = $${idx++}`); values.push(stock_available); }
    if (is_organic !== undefined) { updates.push(`is_organic = $${idx++}`); values.push(is_organic); }
    if (image_url !== undefined) { updates.push(`primary_image_url = $${idx++}`); values.push(image_url); }
    if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(is_active); }
    
    if (updates.length === 0) return res.json({ success: true });
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(productId, farmerId);
    
    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${idx++} AND farmer_id = $${idx++} RETURNING *`;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    
    res.json({ success: true, data: { product: result.rows[0] } });
  } catch (err) { next(err); }
});

// DELETE /products/:id
router.delete('/products/:id', async (req, res, next) => {
  try {
    const farmerId = req.user.userId;
    const productId = req.params.id;
    
    const result = await db.query('DELETE FROM products WHERE id = $1 AND farmer_id = $2 RETURNING id', [productId, farmerId]);
    
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
