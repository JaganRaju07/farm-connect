const db = require('../config/database');

async function getPlatformAnalytics() {
 const [farmersResult, ordersResult, revenueResult, topCitiesResult] = await Promise.all([
 db.query(`
 SELECT
 COUNT(*) FILTER (WHERE is_verified = TRUE) AS verified_farmers,
 COUNT(*) FILTER (WHERE verification_status = 'pending') AS pending_approvals,
 COUNT(*) FILTER (WHERE is_active = TRUE) AS active_farmers,
 COUNT(*) AS total_farmers
 FROM farmers
 `),
 db.query(`
 SELECT
 COUNT(*) AS total_orders,
 COUNT(*) FILTER (WHERE order_status = 'completed') AS completed_orders,
 COUNT(*) FILTER (WHERE order_status = 'cancelled') AS cancelled_orders,
 COUNT(*) FILTER (WHERE order_status NOT IN
 ('completed','cancelled','delivered')) AS active_orders,
 ROUND(AVG(delivery_distance_km)::NUMERIC, 2) AS avg_delivery_km
 FROM orders
 `),
 db.query(`
 SELECT
 COALESCE(SUM(total_amount)
 FILTER (WHERE payment_status = 'paid'), 0) AS total_gmv,
 COALESCE(SUM(total_amount)
 FILTER (WHERE payment_status = 'paid'
 AND DATE_TRUNC('month', created_at) =
 DATE_TRUNC('month', NOW())), 0) AS this_month_gmv,
 COUNT(DISTINCT consumer_id) AS unique_consumers,
 COUNT(DISTINCT farmer_id) AS active_farmers
 FROM orders
 WHERE order_status NOT IN ('cancelled')
 `),
 db.query(`
 SELECT
 delivery_city AS city,
 COUNT(*) AS order_count
 FROM orders
 GROUP BY delivery_city
 ORDER BY order_count DESC
 LIMIT 5
 `)
 ]);

 return {
 farmers: farmersResult.rows[0],
 orders: ordersResult.rows[0],
 revenue: revenueResult.rows[0],
 topCities: topCitiesResult.rows
 };
}

module.exports = { getPlatformAnalytics };
