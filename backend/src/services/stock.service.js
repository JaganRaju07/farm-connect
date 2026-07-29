const db = require('../config/database');

/**
* Get all products with stock below their threshold
* Used in farmer dashboard to show which products need restocking
*/
async function getLowStockProducts(farmerId) {
 const result = await db.query(
 `SELECT
 id, name, category, unit,
 stock_available,
 low_stock_threshold,
 primary_image_url,
 last_low_stock_alert
 FROM products
 WHERE farmer_id = $1
 AND is_active = TRUE
 AND stock_available < low_stock_threshold
 ORDER BY stock_available ASC`,
 [farmerId]
 );
 return result.rows;
}

/**
* Update low stock threshold for a product
*/
async function updateStockThreshold(productId, farmerId, threshold) {
 const result = await db.query(
 `UPDATE products
 SET low_stock_threshold = $1, updated_at = CURRENT_TIMESTAMP
 WHERE id = $2 AND farmer_id = $3
 RETURNING id, name, low_stock_threshold, stock_available`,
 [threshold, productId, farmerId]
 );

 if (result.rows.length === 0) {
 throw Object.assign(
 new Error('Product not found or unauthorized'),
 { statusCode: 404 }
 );
 }

 return result.rows[0];
}

module.exports = { getLowStockProducts, updateStockThreshold };
