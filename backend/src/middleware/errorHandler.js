const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ success: false, error: 'Record already exists' });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ success: false, error: 'Referenced record not found' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error';

  res.status(status).json({ success: false, error: message });
};

module.exports = errorHandler;
