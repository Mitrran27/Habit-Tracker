const success = (res, data = {}, status = 200) =>
  res.status(status).json({ success: true, data });

const created = (res, data = {}) => success(res, data, 201);

const error = (res, message = 'Something went wrong', status = 500, details = null) =>
  res.status(status).json({ success: false, error: message, ...(details && { details }) });

const notFound = (res, entity = 'Resource') =>
  error(res, `${entity} not found`, 404);

const unauthorized = (res, message = 'Unauthorized') =>
  error(res, message, 401);

const forbidden = (res, message = 'Forbidden') =>
  error(res, message, 403);

const badRequest = (res, message = 'Bad request', details = null) =>
  error(res, message, 400, details);

module.exports = { success, created, error, notFound, unauthorized, forbidden, badRequest };
