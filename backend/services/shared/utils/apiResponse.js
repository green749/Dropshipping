export const sendSuccess = (res, message, data = null, statusCode = 200, pagination = null) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res, message, errors = [], statusCode = 400) => {
  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
  };
  return res.status(statusCode).json(response);
};
