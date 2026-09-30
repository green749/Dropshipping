import { sendError } from '../utils/apiResponse.js';

export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req[source]);
      req[source] = validatedData;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateUuidParams = (...paramNames) => {
  return (req, res, next) => {
    for (const name of paramNames) {
      const val = req.params[name];
      if (val && !UUID_REGEX.test(val)) {
        return sendError(res, `Invalid ID format for '${name}'. Must be a valid UUID.`, [], 400);
      }
    }
    next();
  };
};
