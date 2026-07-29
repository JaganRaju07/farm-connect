-- database/query_analysis.sql
-- Run each EXPLAIN ANALYZE and check the output
-- Look for "Seq Scan" on large tables — those need indexes

-- ─── 1. GPS Product Search (most critical query) ──────────────────────────────
EXPLAIN ANALYZE
SELECT
 p.id, p.name, p.price,
 calculate_distance_km(12.9716, 77.5946, f.latitude, f.longitude) AS distance_km
FROM products p
JOIN farmers f ON p.farmer_id = f.id
WHERE p.is_active = TRUE
 AND f.is_verified = TRUE
 AND calculate_distance_km(12.9716, 77.5946, f.latitude, f.longitude) <= 10
ORDER BY distance_km ASC;

-- ─── 2. Farmer Dashboard Overview ────────────────────────────────────────────
EXPLAIN ANALYZE
SELECT
 COUNT(*) AS total_orders,
 SUM(total_amount) FILTER (WHERE payment_status = 'paid') AS total_earnings
FROM orders
WHERE farmer_id = 1;

-- ─── 3. Product Reviews Fetch ─────────────────────────────────────────────────
EXPLAIN ANALYZE
SELECT r.*, c.name AS consumer_name
FROM product_reviews r
JOIN consumers c ON r.consumer_id = c.id
WHERE r.product_id = 1 AND r.is_approved = TRUE
ORDER BY r.created_at DESC;

-- ─── 4. Notification Unread Count ────────────────────────────────────────────
EXPLAIN ANALYZE
SELECT COUNT(*) FROM notifications
WHERE user_id = 1 AND user_type = 'farmer' AND is_read = FALSE;

-- ─── 5. Consumer Wishlist ─────────────────────────────────────────────────────
EXPLAIN ANALYZE
SELECT p.*, f.name AS farmer_name
FROM consumer_wishlist w
JOIN products p ON w.product_id = p.id
JOIN farmers f ON p.farmer_id = f.id
WHERE w.consumer_id = 1;
