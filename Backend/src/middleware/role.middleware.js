const ApiError = require('../utils/ApiError');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to access this resource'));
  }
  next();
};

module.exports = { requireRole };
