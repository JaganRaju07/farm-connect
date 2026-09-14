const db = require('../config/database');

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.role;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Max 50

    const result = await db.query(
      `SELECT
        id, title, message, notification_type,
        related_id, related_type, action_url,
        is_read, read_at, created_at
       FROM notifications
       WHERE user_id = $1 AND user_type = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [userId, userType, limit]
    );

    const unreadCount = result.rows.filter(n => !n.is_read).length;

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        unreadCount,
        total: result.rows.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.role;

    const result = await db.query(
      `UPDATE notifications
       SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND user_type = $2 AND is_read = FALSE
       RETURNING id`,
      [userId, userType]
    );

    res.json({
      success: true,
      message: `${result.rows.length} notifications marked as read`,
      data: { markedCount: result.rows.length }
    });
  } catch (error) {
    next(error);
  }
};

exports.markOneRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.role;
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid notification ID' }
      });
    }

    const result = await db.query(
      `UPDATE notifications
       SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND user_type = $3
       RETURNING id`,
      [notificationId, userId, userType]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Notification not found' }
      });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};
