import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';

// Access token: 15 minutes
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000,
  path: '/',
};

// Refresh token: 7 days
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      if (result && result.accessToken) {
        res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
      }
      if (result && result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      }
      return sendSuccess(res, 'User registered successfully', result, 201);
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        return sendError(res, 'Refresh token not provided in cookies or request payload', [], 401);
      }

      const result = await authService.refresh(refreshToken);

      res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(res, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      res.clearCookie('accessToken', { path: '/', sameSite: 'lax' });
      res.clearCookie('refreshToken', { path: '/', sameSite: 'lax' });
      return sendSuccess(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return sendSuccess(res, 'Current user profile retrieved', { user });
    } catch (error) {
      next(error);
    }
  },

  async loginAsUser(req, res, next) {
    try {
      const result = await authService.loginAsUser(req.body, req.user);

      res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(res, `Logged in as ${result.user.name} (${result.user.role})`, result);
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      if (req.user?.role !== 'DROPSHIPPER') {
        return sendError(res, 'Unauthorized: Only platform administrators can view users list.', [], 403);
      }
      const users = await authService.getAllUsers();
      return sendSuccess(res, 'Users list retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  },
};
