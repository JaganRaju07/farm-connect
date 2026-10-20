const jwt = require("jsonwebtoken");

/**
 * JWT Authentication Middleware for Root Backend
 * Validates the Authorization Bearer header against JWT_SECRET.
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_REQUIRED",
        message: "Authentication token is required"
      }
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      success: false,
      error: {
        code: "CONFIG_ERROR",
        message: "JWT_SECRET environment variable is not configured"
      }
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Session expired. Please log in again."
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid authentication token"
      }
    });
  }
};
