const { verify } = require('../config/jwt');
const { unauthorized } = require('../utils/apiResponse');

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'No token provided');
  }
  try {
    req.user = verify(header.split(' ')[1]);
    next();
  } catch {
    return unauthorized(res, 'Invalid or expired token');
  }
};

module.exports = auth;
