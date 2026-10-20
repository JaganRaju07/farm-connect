const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyFarmer, getPendingFarmers, getPlatformAnalytics } = require('../services/admin.service');

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
    }

    // Query admin record by case-insensitive email
    const result = await db.query(
      `SELECT id, name, email, phone, password_hash, role, is_active
       FROM admins
       WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    const admin = result.rows[0];

    // Check if account is active
    if (admin.is_active === false) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Admin account has been deactivated. Please contact support.'
        }
      });
    }

    // Verify password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Ensure JWT secret is securely configured via environment
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not configured');
    }

    // Issue signed JWT containing the administrator role
    const token = jwt.sign(
      {
        userId: admin.id,
        email: admin.email,
        role: 'admin',
        adminRole: admin.role
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    );

    // Return authenticated admin profile (never expose password_hash)
    res.json({
      success: true,
      message: 'Admin authentication successful',
      data: {
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone || 'N/A',
          role: 'admin',
          adminRole: admin.role
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.getPendingVerifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await getPendingFarmers(page, limit);
    res.json({
      success: true,
      data: {
        verifications: data.farmers,
        count: data.total,
        page: data.page,
        limit: data.limit
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.approveFarmerVerification = async (req, res, next) => {
  try {
    const farmerId = parseInt(req.params.farmerId, 10);
    const adminId = req.user.userId;
    const { notes } = req.body;

    if (isNaN(farmerId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FARMER_ID', message: 'Invalid farmer ID' }
      });
    }

    const farmer = await verifyFarmer(farmerId, 'approved', notes);

    res.json({
      success: true,
      message: `${farmer.name} has been verified and approved`,
      data: { farmer }
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectFarmerVerification = async (req, res, next) => {
  try {
    const farmerId = parseInt(req.params.farmerId, 10);
    const adminId = req.user.userId;
    const { reason } = req.body;

    if (isNaN(farmerId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FARMER_ID', message: 'Invalid farmer ID' }
      });
    }

    // Rejection reason is mandatory
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REASON_REQUIRED',
          message: 'Rejection reason must be at least 10 characters'
        }
      });
    }

    const farmer = await verifyFarmer(farmerId, 'rejected', reason.trim());

    res.json({
      success: true,
      message: `${farmer.name}'s application has been rejected`,
      data: { farmer }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const analytics = await getPlatformAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await getPlatformAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

exports.getFarmers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status;

    if (status === 'pending') {
      const pendingData = await getPendingFarmers(page, limit);
      return res.json({
        success: true,
        data: pendingData
      });
    }

    const offset = (page - 1) * limit;
    const result = await db.query(
      `SELECT id, name, phone, email, city, verification_status, is_verified, is_active, created_at
       FROM farmers
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM farmers WHERE is_active = TRUE');

    res.json({
      success: true,
      data: {
        farmers: result.rows,
        total: parseInt(countResult.rows[0].count, 10),
        page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.suspendFarmer = async (req, res, next) => {
  try {
    const farmerId = parseInt(req.params.id, 10);
    if (isNaN(farmerId)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid farmer ID' } });
    }
    await db.query('UPDATE farmers SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [farmerId]);
    res.json({ success: true, message: 'Farmer account suspended' });
  } catch (error) {
    next(error);
  }
};

exports.reinstateFarmer = async (req, res, next) => {
  try {
    const farmerId = parseInt(req.params.id, 10);
    if (isNaN(farmerId)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid farmer ID' } });
    }
    await db.query('UPDATE farmers SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [farmerId]);
    res.json({ success: true, message: 'Farmer account reinstated' });
  } catch (error) {
    next(error);
  }
};

exports.getConsumers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT id, name, phone, email, city, is_active, created_at
       FROM consumers
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM consumers WHERE is_active = TRUE');

    res.json({
      success: true,
      data: {
        consumers: result.rows,
        total: parseInt(countResult.rows[0].count, 10),
        page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT o.*, f.name as farmer_name, c.name as consumer_name
       FROM orders o
       LEFT JOIN farmers f ON o.farmer_id = f.id
       LEFT JOIN consumers c ON o.consumer_id = c.id
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM orders');

    res.json({
      success: true,
      data: {
        orders: result.rows,
        total: parseInt(countResult.rows[0].count, 10),
        page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};
