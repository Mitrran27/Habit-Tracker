const { verify } = require('../config/jwt');
const { unauthorized } = require('../utils/apiResponse');
const User = require('../models/User');

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'No token provided');
  }
  try {
    req.user = verify(header.split(' ')[1]);
    // Update last_seen asynchronously — don't block the request
    User.touchLastSeen(req.user.id).catch(() => {});
    next();
  } catch {
    return unauthorized(res, 'Invalid or expired token');
  }
};

module.exports = auth;
