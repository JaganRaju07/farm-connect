/**
* Role Authorization Middleware
*/
const roleAuth = (allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'User not authenticated' }
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `This endpoint requires one of these roles: ${allowedRoles.join(', ')}`
      }
    });
  }

  next();
};

module.exports = roleAuth;
