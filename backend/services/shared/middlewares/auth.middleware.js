import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/apiResponse.js';

export const createAuthenticateMiddleware = (UserModel = null) => {
  return async (req, res, next) => {
    try {
      let token = null;

      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies && (req.cookies.accessToken || req.cookies.token)) {
        token = req.cookies.accessToken || req.cookies.token;
      }

      if (!token) {
        return sendError(res, 'Authentication required. No token provided.', [], 401);
      }

      const decoded = verifyToken(token);

      if (UserModel) {
        const user = await UserModel.findByPk(decoded.id);
        if (!user || !user.is_active) {
          return sendError(res, 'User not found or account is deactivated.', [], 401);
        }
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          dealer_id: decoded.dealer_id || user.dealer_id,
        };
      } else {
        req.user = {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
          dealer_id: decoded.dealer_id,
        };
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return sendError(res, 'Invalid or expired token', [], 401);
      }
      next(error);
    }
  };
};

export const authenticate = createAuthenticateMiddleware();
