// backend/src/services/admin.service.js

const db = require('../config/database');

/**
 * Get platform analytics for admin dashboard
 * These are the key metrics Manas will look at during the demo
 */
async function getPlatformAnalytics() {
  // Run all queries in parallel for performance
  const [farmers, consumers, products, orders, revenue] = await Promise.all([
    
    // Farmer stats
    db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_verified = TRUE) as verified,
        COUNT(*) FILTER (WHERE verification_status = 'pending') as pending_verification,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week
      FROM farmers WHERE is_active = TRUE
    `),

    // Consumer stats
    db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week
      FROM consumers WHERE is_active = TRUE
    `),

    // Product stats
    db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = TRUE) as active,
        COUNT(DISTINCT category) as categories
      FROM products
    `),

    // Order stats
    db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE order_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE order_status = 'delivered' OR order_status = 'completed') as delivered,
        COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as this_week
      FROM orders
    `),

    // Revenue stats
    db.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_gmv,
        COALESCE(SUM(total_amount) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0) as last_30_days
      FROM orders
      WHERE order_status NOT IN ('cancelled')
    `)
  ]);

  return {
    farmers: farmers.rows[0],
    consumers: consumers.rows[0],
    products: products.rows[0],
    orders: orders.rows[0],
    revenue: revenue.rows[0]
  };
}

/**
 * Get farmers pending verification
 * Admin approves/rejects these
 */
async function getPendingFarmers(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  
  const result = await db.query(`
    SELECT 
      f.*,
      COUNT(p.id) as product_count
    FROM farmers f
    LEFT JOIN products p ON f.id = p.farmer_id AND p.is_active = TRUE
    WHERE f.verification_status = 'pending'
    GROUP BY f.id
    ORDER BY f.created_at ASC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  const countResult = await db.query(
    `SELECT COUNT(*) FROM farmers WHERE verification_status = 'pending'`
  );

  return {
    farmers: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page,
    limit
  };
}

/**
 * Verify or reject a farmer
 * @param {number} farmerId
 * @param {'approved' | 'rejected'} decision
 * @param {string} adminNote - Reason for rejection
 */
async function verifyFarmer(farmerId, decision, adminNote = null) {
  const { createNotification } = require('./notification.service');
  
  const result = await db.query(`
    UPDATE farmers
    SET 
      verification_status = $1,
      is_verified = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `, [
    decision, 
    decision === 'approved', 
    farmerId
  ]);

  if (result.rows.length === 0) {
    throw new Error('Farmer not found');
  }

  const farmer = result.rows[0];

  // Notify farmer about verification decision
  const notifTitle = decision === 'approved' 
    ? 'Profile Approved!' 
    : 'Profile Needs Attention';
  const notifMessage = decision === 'approved'
    ? 'Your farmer profile has been verified. You can now list products!'
    : `Your profile was not approved. ${adminNote || 'Please contact support.'}`;

  await createNotification(
    farmerId, 'farmer',
    notifTitle, notifMessage,
    decision === 'approved' ? 'profile_verified' : 'profile_rejected'
  );

  return farmer;
}

module.exports = {
  getPlatformAnalytics,
  getPendingFarmers,
  verifyFarmer
};
