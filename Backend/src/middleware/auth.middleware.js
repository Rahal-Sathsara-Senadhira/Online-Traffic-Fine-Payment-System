const { verifyToken } = require('../utils/jwt.util');
const ApiError = require('../utils/ApiError');

const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'TOKEN_MISSING', 'Authorization token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'TOKEN_EXPIRED', 'Token has expired'));
    }
    return next(new ApiError(401, 'TOKEN_INVALID', 'Invalid token'));
  }
};

module.exports = { protect };
