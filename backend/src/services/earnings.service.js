// backend/src/services/earnings.service.js
const db = require('../config/database');

/**
 * STUDY NOTE — Date Filtering Patterns:
 *
 * Farmers want to see earnings for custom date ranges:
 * - This week
 * - This month
 * - Last 3 months
 * - Custom date range (from/to)
 *
 * We convert the period shortcut into actual SQL date boundaries
 * so the query is the same regardless of how the frontend asks.
 */
function getDateBounds(period, from, to) {
  if (period === 'week') {
    return {
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      toDate: new Date()
    };
  }
  if (period === 'month') {
    return {
      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      toDate: new Date()
    };
  }
  if (period === 'quarter') {
    return {
      fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      toDate: new Date()
    };
  }
  return {
    fromDate: from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    toDate: to ? new Date(to) : new Date()
  };
}

async function getFarmerEarnings(farmerId, { period, from, to } = {}) {
  const { fromDate, toDate } = getDateBounds(period, from, to);

  const ordersResult = await db.query(`
    SELECT
      o.id,
      o.order_number,
      o.order_status,
      o.payment_status,
      o.subtotal,
      o.delivery_fee,
      o.total_amount,
      o.delivery_distance_km,
      o.created_at,
      o.delivered_at,
      o.completed_at,
      c.name AS consumer_name,
      c.phone AS consumer_phone
    FROM orders o
    JOIN consumers c ON o.consumer_id = c.id
    WHERE o.farmer_id = $1
      AND o.created_at BETWEEN $2 AND $3
      AND o.order_status NOT IN ('cancelled')
    ORDER BY o.created_at DESC
  `, [farmerId, fromDate, toDate]);

  const orders = ordersResult.rows;
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const pendingOrders = orders.filter(o => o.payment_status === 'cod_pending');

  const summary = {
    totalEarned: paidOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
    pendingAmount: pendingOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
    totalOrders: orders.length,
    paidOrders: paidOrders.length,
    pendingOrders: pendingOrders.length,
    averageOrderValue: orders.length > 0
      ? orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) / orders.length
      : 0
  };

  return {
    period: { from: fromDate, to: toDate, label: period || 'custom' },
    summary,
    orders
  };
}

module.exports = { getFarmerEarnings };
