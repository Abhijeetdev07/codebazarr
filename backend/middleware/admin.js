// Admin authorization middleware
// This middleware should be used after the 'protect' middleware
// It checks if the authenticated user has admin role

exports.isAdmin = (req, res, next) => {
  // Check if user exists (should be set by protect middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Please login first.'
    });
  }

  // Check if user role is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // User is admin, proceed to next middleware/controller
  next();
};

// Alternative: Check for multiple roles
exports.checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please login first.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};
