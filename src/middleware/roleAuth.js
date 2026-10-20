/**
 * Role Authorization Middleware for Root Backend
 * Validates that authenticated user has an authorized role.
 * Checks both req.user.role and req.user.adminRole for flexibility.
 */
module.exports = (allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "User not authenticated"
      }
    });
  }

  const userRoles = [req.user.role];
  if (req.user.adminRole) {
    userRoles.push(req.user.adminRole);
  }

  const hasRole = allowedRoles.some((role) => userRoles.includes(role));
  if (!hasRole) {
    return res.status(403).json({
      success: false,
      error: {
        code: "INSUFFICIENT_PERMISSIONS",
        message: `This endpoint requires one of these roles: ${allowedRoles.join(", ")}`
      }
    });
  }

  next();
};
