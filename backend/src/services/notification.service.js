const db = require('../config/database');

/**
 * Create notification for a user
 * Called internally whenever an order status changes
 * 
 * STUDY NOTE — When to create notifications:
 * - Order placed → notify farmer ("New order received!")
 * - Order confirmed → notify consumer ("Your order is confirmed")
 * - Order packed → notify consumer ("Your order is packed")
 * - Order out_for_delivery → notify consumer ("On the way!")
 * - Order delivered → notify both
 * - Payment received → notify both
 */

async function createNotification(userId, userType, title, message, type, referenceId = null, referenceType = null) {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, user_type, title, message, type, reference_id, reference_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, userType, title, message, type, referenceId, referenceType]
    );
  } catch (error) {
    // Notifications are non-critical — log but don't crash
    console.error('Failed to create notification:', error.message);
  }
}

/**
 * Trigger order-related notifications for both parties
 * Call this from order.service.js after every status update
 */
async function notifyOrderStatusChange(order, newStatus) {
  const messages = {
    confirmed: {
      consumer: { title: 'Order Confirmed', message: `Your order #${order.order_number} has been confirmed by the farmer.` },
      farmer: null
    },
    packed: {
      consumer: { title: 'Order Packed', message: `Your order #${order.order_number} is packed and ready for delivery.` },
      farmer: null
    },
    out_for_delivery: {
      consumer: { title: 'Out for Delivery', message: `Your order #${order.order_number} is on its way to you!` },
      farmer: null
    },
    delivered: {
      consumer: { title: 'Delivered', message: `Your order #${order.order_number} has been delivered. Enjoy fresh produce!` },
      farmer: { title: 'Order Delivered', message: `Order #${order.order_number} delivered. Collect payment from customer.` }
    },
    paid: {
      farmer: { title: 'Payment Received', message: `Payment confirmed for order #${order.order_number}.` },
      consumer: { title: 'Payment Confirmed', message: `Your payment for order #${order.order_number} is confirmed.` }
    }
  };

  const notif = messages[newStatus];
  if (!notif) return;

  if (notif.consumer) {
    await createNotification(
      order.consumer_id, 'consumer',
      notif.consumer.title, notif.consumer.message,
      `order_${newStatus}`, order.id, 'order'
    );
  }

  if (notif.farmer) {
    await createNotification(
      order.farmer_id, 'farmer',
      notif.farmer.title, notif.farmer.message,
      `order_${newStatus}`, order.id, 'order'
    );
  }
}

/**
 * Get notifications for a user
 * Deekshitha will expose this via GET /api/v1/notifications
 */
async function getUserNotifications(userId, userType, limit = 20) {
  const result = await db.query(
    `SELECT * FROM notifications
     WHERE user_id = $1 AND user_type = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [userId, userType, limit]
  );
  return result.rows;
}

/**
 * Mark notifications as read
 */
async function markAsRead(userId, userType, notificationIds = []) {
  if (notificationIds.length === 0) {
    // Mark all as read
    await db.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE user_id = $1 AND user_type = $2 AND is_read = FALSE`,
      [userId, userType]
    );
  } else {
    await db.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE id = ANY($1) AND user_id = $2 AND user_type = $3`,
      [notificationIds, userId, userType]
    );
  }
}

/**
 * Get unread count (for notification badge in header)
 */
async function getUnreadCount(userId, userType) {
  const result = await db.query(
    `SELECT COUNT(*) FROM notifications
     WHERE user_id = $1 AND user_type = $2 AND is_read = FALSE`,
    [userId, userType]
  );
  return parseInt(result.rows[0].count, 10);
}

module.exports = {
  createNotification,
  notifyOrderStatusChange,
  getUserNotifications,
  markAsRead,
  getUnreadCount
};
