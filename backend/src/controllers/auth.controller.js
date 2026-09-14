const db = require('../config/database');

exports.completeRegistration = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.role;
    const data = req.body;

    const table = userType === 'farmer' ? 'farmers' : 'consumers';

    // Validate based on user type
    if (userType === 'farmer') {
      const required = ['name', 'latitude', 'longitude', 'address', 'city'];
      const missing = required.filter(f => !data[f]);
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: `Required fields missing: ${missing.join(', ')}`
          }
        });
      }
      
      const result = await db.query(
        `UPDATE farmers 
         SET name=$1, latitude=$2, longitude=$3, address=$4, city=$5, updated_at=CURRENT_TIMESTAMP
         WHERE id=$6 RETURNING *`,
        [data.name, data.latitude, data.longitude, data.address, data.city, userId]
      );
      
      res.json({
        success: true,
        message: 'Registration completed successfully',
        data: { user: result.rows[0] }
      });
      
    } else if (userType === 'consumer') {
      const required = ['name', 'latitude', 'longitude', 'delivery_address', 'city'];
      const missing = required.filter(f => !data[f]);
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: `Required fields missing: ${missing.join(', ')}`
          }
        });
      }

      const result = await db.query(
        `UPDATE consumers 
         SET name=$1, latitude=$2, longitude=$3, delivery_address=$4, city=$5, updated_at=CURRENT_TIMESTAMP
         WHERE id=$6 RETURNING *`,
        [data.name, data.latitude, data.longitude, data.delivery_address, data.city, userId]
      );
      
      res.json({
        success: true,
        message: 'Registration completed successfully',
        data: { user: result.rows[0] }
      });
    }

  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.role;
    const table = userType === 'farmer' ? 'farmers' : 'consumers';

    const result = await db.query(
      `SELECT * FROM ${table} WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    // Exclude internal fields from response
    const user = result.rows[0];
    delete user.profile_completed; // Internal tracking field

    res.json({
      success: true,
      data: {
        user,
        role: userType
      }
    });

  } catch (error) {
    next(error);
  }
};
