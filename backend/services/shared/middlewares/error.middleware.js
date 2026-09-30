import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', formattedErrors, 422);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 'Duplicate entry violation', formattedErrors, 409);
  }

  if (err.name === 'SequelizeValidationError') {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 'Database validation failed', formattedErrors, 422);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token provided', [], 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token has expired', [], 401);
  }

  if (
    err.name === 'SequelizeDatabaseError' &&
    (err.parent?.code === '22P02' ||
      (err.message && err.message.toLowerCase().includes('invalid input syntax for type uuid')))
  ) {
    return sendError(res, 'Invalid ID format. Must be a valid UUID.', [], 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, [], statusCode);
};
