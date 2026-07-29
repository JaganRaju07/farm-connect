const db = require('../config/database');

async function toggleWishlist(consumerId, productId) {
 // Check if already saved
 const existing = await db.query(
 'SELECT id FROM consumer_wishlist WHERE consumer_id = $1 AND product_id = $2',
 [consumerId, productId]
 );

 if (existing.rows.length > 0) {
 // Remove from wishlist
 await db.query(
 'DELETE FROM consumer_wishlist WHERE consumer_id = $1 AND product_id = $2',
 [consumerId, productId]
 );
 return { saved: false, message: 'Removed from saved products' };
 } else {
 // Add to wishlist
 await db.query(
 'INSERT INTO consumer_wishlist (consumer_id, product_id) VALUES ($1, $2)',
 [consumerId, productId]
 );
 return { saved: true, message: 'Product saved successfully' };
 }
}

async function getWishlist(consumerId) {
 const result = await db.query(
 `SELECT
 p.id, p.name, p.category, p.price, p.unit,
 p.stock_available, p.primary_image_url, p.is_organic,
 p.average_rating, p.review_count,
 p.is_active,
 f.name AS farmer_name, f.city AS farmer_city,
 w.created_at AS saved_at
 FROM consumer_wishlist w
 JOIN products p ON w.product_id = p.id
 JOIN farmers f ON p.farmer_id = f.id
 WHERE w.consumer_id = $1
 ORDER BY w.created_at DESC`,
 [consumerId]
 );
 return result.rows;
}

async function isProductSaved(consumerId, productId) {
 const result = await db.query(
 'SELECT id FROM consumer_wishlist WHERE consumer_id = $1 AND product_id = $2',
 [consumerId, productId]
 );
 return result.rows.length > 0;
}

module.exports = { toggleWishlist, getWishlist, isProductSaved };
