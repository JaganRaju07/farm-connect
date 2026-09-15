// backend/src/services/dashboard.service.js
const db = require('../config/database');

/**
 * STUDY NOTE — Promise.all for Parallel Queries:
 *
 * Farmer dashboard needs 5 separate queries:
 * - Overview stats (total orders, revenue)
 * - Orders by status breakdown
 * - Top performing products
 * - Recent 10 orders
 * - Monthly revenue for last 6 months
 *
 * Sequential approach (SLOW):
 *   await query1 -> 60ms
 *   await query2 -> 50ms
 *   await query3 -> 55ms
 *   Total: 165ms minimum
 *
 * Parallel with Promise.all (FAST):
 *   Start all 5 simultaneously -> 60ms (time of slowest)
 *   Total: 60ms
 *
 * For a dashboard that runs on every page load, this difference
 * makes the app feel significantly more responsive.
 */
async function getFarmerDashboardData(farmerId) {
  const [
    overviewResult,
    statusBreakdownResult,
    topProductsResult,
    recentOrdersResult,
    monthlyTrendResult
  ] = await Promise.all([
    // 1. Overview: revenue + order counts in one query
    db.query(`
      SELECT
        COUNT(DISTINCT o.id)                                                AS total_orders,
        COUNT(DISTINCT o.id) FILTER (WHERE o.order_status = 'pending')      AS pending_count,
        COUNT(DISTINCT o.id) FILTER (WHERE o.order_status = 'confirmed')    AS confirmed_count,
        COUNT(DISTINCT o.id) FILTER (WHERE o.order_status IN
          ('packed','out_for_delivery'))                                    AS in_progress_count,
        COUNT(DISTINCT o.id) FILTER (WHERE o.order_status = 'delivered')    AS delivered_count,
        COUNT(DISTINCT o.id) FILTER (WHERE o.order_status = 'completed')    AS completed_count,
        COUNT(DISTINCT o.id) FILTER (WHERE o.order_status = 'cancelled')    AS cancelled_count,
        COALESCE(SUM(o.total_amount)
          FILTER (WHERE o.payment_status = 'paid'), 0)                      AS total_earnings,
        COALESCE(SUM(o.total_amount) FILTER (
          WHERE o.payment_status = 'paid'
            AND DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', NOW())
        ), 0)                                                               AS this_month_earnings,
        COALESCE(SUM(o.total_amount)
          FILTER (WHERE o.payment_status = 'cod_pending'
            AND o.order_status NOT IN ('cancelled')), 0)                    AS pending_collection,
        COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = TRUE)              AS active_products,
        COUNT(DISTINCT p.id)                                                AS total_products
      FROM farmers f
      LEFT JOIN orders o   ON f.id = o.farmer_id
      LEFT JOIN products p ON f.id = p.farmer_id
      WHERE f.id = $1
    `, [farmerId]),

    // 2. Orders grouped by status (for pie/bar chart on frontend)
    db.query(`
      SELECT
        order_status,
        COUNT(*)::INTEGER AS order_count
      FROM orders
      WHERE farmer_id = $1
      GROUP BY order_status
      ORDER BY order_count DESC
    `, [farmerId]),

    // 3. Top 5 products by revenue generated
    db.query(`
      SELECT
        p.id,
        p.name,
        p.category,
        p.price,
        p.unit,
        p.stock_available,
        p.primary_image_url AS image_url,
        p.order_count,
        p.view_count,
        COALESCE(recent.revenue, 0) AS revenue_generated,
        COALESCE(recent.times_ordered, 0) AS times_ordered
      FROM products p
      LEFT JOIN (
        SELECT
          elem->>'productId' AS product_id,
          COUNT(DISTINCT o.id) AS times_ordered,
          SUM((elem->>'quantity')::NUMERIC * (elem->>'price')::NUMERIC) AS revenue
        FROM orders o,
        LATERAL jsonb_array_elements(
          CASE WHEN jsonb_typeof(o.items::jsonb) = 'array'
               THEN o.items::jsonb
               ELSE '[]'::jsonb END
        ) AS elem
        WHERE o.farmer_id = $1
          AND o.order_status NOT IN ('cancelled')
        GROUP BY elem->>'productId'
      ) recent ON recent.product_id = p.id::TEXT
      WHERE p.farmer_id = $1
        AND p.is_active = TRUE
      ORDER BY COALESCE(recent.revenue, 0) DESC
      LIMIT 5
    `, [farmerId]),

    // 4. Recent 10 orders for quick view panel
    db.query(`
      SELECT
        o.id,
        o.order_number,
        o.order_status,
        o.payment_status,
        o.total_amount,
        o.delivery_distance_km,
        o.delivery_city,
        o.created_at,
        o.delivered_at,
        c.name AS consumer_name,
        c.phone AS consumer_phone
      FROM orders o
      JOIN consumers c ON o.consumer_id = c.id
      WHERE o.farmer_id = $1
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [farmerId]),

    // 5. Monthly revenue trend — last 6 months
    db.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month_label,
        DATE_TRUNC('month', created_at) AS month_start,
        COUNT(*)::INTEGER AS order_count,
        COALESCE(SUM(total_amount)
          FILTER (WHERE payment_status = 'paid'), 0) AS revenue,
        COALESCE(SUM(total_amount), 0) AS gmv
      FROM orders
      WHERE farmer_id = $1
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month_start ASC
    `, [farmerId])
  ]);

  return {
    overview: overviewResult.rows[0],
    statusBreakdown: statusBreakdownResult.rows,
    topProducts: topProductsResult.rows,
    recentOrders: recentOrdersResult.rows,
    monthlyTrend: monthlyTrendResult.rows
  };
}

async function getConsumerDashboardData(consumerId) {
  const [statsResult, recentOrdersResult, favouriteFarmersResult] = await Promise.all([
    // Consumer stats overview
    db.query(`
      SELECT
        COUNT(*)::INTEGER AS total_orders,
        COUNT(*) FILTER (WHERE order_status NOT IN
          ('delivered','completed','cancelled'))::INTEGER AS active_orders,
        COUNT(*) FILTER (WHERE order_status = 'completed')::INTEGER AS completed_orders,
        COUNT(*) FILTER (WHERE order_status = 'cancelled')::INTEGER AS cancelled_orders,
        COALESCE(SUM(total_amount)
          FILTER (WHERE order_status IN ('delivered','completed')), 0) AS total_spent,
        COALESCE(SUM(total_amount) FILTER (
          WHERE order_status IN ('delivered','completed')
            AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
        ), 0) AS spent_this_month,
        COUNT(*) FILTER (
          WHERE order_status = 'pending'
            AND created_at >= NOW() - INTERVAL '24 hours'
        )::INTEGER AS new_orders_today
      FROM orders
      WHERE consumer_id = $1
    `, [consumerId]),

    // Recent 5 orders
    db.query(`
      SELECT
        o.id,
        o.order_number,
        o.order_status,
        o.payment_status,
        o.total_amount,
        o.created_at,
        o.delivery_distance_km,
        f.name          AS farmer_name,
        f.city          AS farmer_city,
        f.profile_photo_url AS farmer_photo,
        f.phone         AS farmer_phone
      FROM orders o
      JOIN farmers f ON o.farmer_id = f.id
      WHERE o.consumer_id = $1
      ORDER BY o.created_at DESC
      LIMIT 5
    `, [consumerId]),

    // Top 3 farmers this consumer orders from most
    db.query(`
      SELECT
        f.id,
        f.name,
        f.city,
        f.profile_photo_url,
        f.farming_type,
        COUNT(o.id)::INTEGER AS order_count
      FROM orders o
      JOIN farmers f ON o.farmer_id = f.id
      WHERE o.consumer_id = $1
        AND o.order_status NOT IN ('cancelled')
      GROUP BY f.id
      ORDER BY order_count DESC
      LIMIT 3
    `, [consumerId])
  ]);

  return {
    stats: statsResult.rows[0],
    recentOrders: recentOrdersResult.rows,
    favouriteFarmers: favouriteFarmersResult.rows
  };
}

module.exports = {
  getFarmerDashboardData,
  getConsumerDashboardData
};
