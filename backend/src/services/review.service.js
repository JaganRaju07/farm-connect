const db = require('../config/database');

/**
* STUDY NOTE — Why One Review Per Order?
*
* Allowing unlimited reviews per product per consumer enables abuse:
* competitor farmers posting fake bad reviews repeatedly.
* Linking to order_id ensures the consumer actually purchased the product
* before reviewing it. This is the same pattern Amazon uses.
*/
async function createReview(consumerId, { productId, orderId, rating, reviewText, reviewImages }) {
 return await db.executeTransaction(async (client) => {
 // Verify the consumer actually ordered this product
 const orderCheck = await client.query(
 `SELECT o.id
 FROM orders o
 WHERE o.id = $1
 AND o.consumer_id = $2
 AND o.order_status IN ('delivered', 'completed')
 AND o.items::jsonb @> ('[{"productId": ' || $3 || '}]')::jsonb`,
 [orderId, consumerId, productId]
 );

 if (orderCheck.rows.length === 0) {
 throw Object.assign(
 new Error('You can only review products you have received'),
 { statusCode: 403, code: 'REVIEW_NOT_ELIGIBLE' }
 );
 }

 // Insert review
 const result = await client.query(
 `INSERT INTO product_reviews
 (product_id, consumer_id, order_id, rating, review_text, review_images)
 VALUES ($1, $2, $3, $4, $5, $6)
 RETURNING *`,
 [productId, consumerId, orderId, rating, reviewText || null, reviewImages || []]
 );

 return result.rows[0];
 });
}

async function getProductReviews(productId, { page = 1, limit = 10 } = {}) {
 const offset = (parseInt(page) - 1) * parseInt(limit);

 const [reviewsResult, summaryResult] = await Promise.all([
 db.query(
 `SELECT
 r.id, r.rating, r.review_text, r.review_images, r.created_at,
 c.name AS consumer_name,
 c.profile_photo_url AS consumer_photo
 FROM product_reviews r
 JOIN consumers c ON r.consumer_id = c.id
 WHERE r.product_id = $1 AND r.is_approved = TRUE
 ORDER BY r.created_at DESC
 LIMIT $2 OFFSET $3`,
 [productId, parseInt(limit), offset]
 ),
 db.query(
 `SELECT
 average_rating,
 review_count,
 COUNT(*) FILTER (WHERE r.rating = 5) AS five_star,
 COUNT(*) FILTER (WHERE r.rating = 4) AS four_star,
 COUNT(*) FILTER (WHERE r.rating = 3) AS three_star,
 COUNT(*) FILTER (WHERE r.rating = 2) AS two_star,
 COUNT(*) FILTER (WHERE r.rating = 1) AS one_star
 FROM products p
 LEFT JOIN product_reviews r ON r.product_id = p.id AND r.is_approved = TRUE
 WHERE p.id = $1
 GROUP BY p.average_rating, p.review_count`,
 [productId]
 )
 ]);

 return {
 reviews: reviewsResult.rows,
 summary: summaryResult.rows[0] || { average_rating: 0, review_count: 0 },
 page: parseInt(page),
 total: summaryResult.rows[0]?.review_count || 0
 };
}

async function checkCanReview(consumerId, productId, orderId) {
 const result = await db.query(
 `SELECT id FROM product_reviews
 WHERE consumer_id = $1 AND product_id = $2 AND order_id = $3`,
 [consumerId, productId, orderId]
 );
 return result.rows.length === 0;
}

async function getFarmerRatingSummary(farmerId) {
 const result = await db.query(
 `SELECT
 ROUND(AVG(r.rating)::NUMERIC, 2) AS overall_rating,
 COUNT(r.id)::INTEGER AS total_reviews,
 COUNT(DISTINCT r.product_id)::INTEGER AS products_reviewed
 FROM product_reviews r
 JOIN products p ON r.product_id = p.id
 WHERE p.farmer_id = $1 AND r.is_approved = TRUE`,
 [farmerId]
 );
 return result.rows[0];
}

module.exports = {
 createReview,
 getProductReviews,
 checkCanReview,
 getFarmerRatingSummary
};
