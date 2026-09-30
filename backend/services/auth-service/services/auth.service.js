import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../../shared/utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt.js';
import { resolveDealer } from '../../shared/services/dealerResolver.service.js';

export const authService = {
  async register({ name, email, password, role }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await hashPassword(password);
    const user = await userRepository.create({
      name,
      email,
      password_hash: hashedPassword,
      role: role || 'DROPSHIPPER',
    });

    const dealerProfile = user.role === 'DEALER' ? await resolveDealer(user) : null;
    const payload = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      dealer_id: dealerProfile ? dealerProfile.id : undefined,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        ...user,
        dealer_id: dealerProfile ? dealerProfile.id : undefined,
      },
      accessToken,
      refreshToken,
    };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('Account is deactivated');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const plainUser = user.toJSON();
    delete plainUser.password_hash;

    const dealerProfile = plainUser.role === 'DEALER' ? await resolveDealer(plainUser) : null;
    const payload = {
      id: plainUser.id,
      role: plainUser.role,
      name: plainUser.name,
      email: plainUser.email,
      dealer_id: dealerProfile ? dealerProfile.id : undefined,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        ...plainUser,
        dealer_id: dealerProfile ? dealerProfile.id : undefined,
      },
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshTokenString) {
    if (!refreshTokenString) {
      const error = new Error('Refresh token is required');
      error.statusCode = 401;
      throw error;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshTokenString);
    } catch (err) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }

    const user = await userRepository.findById(decoded.id);
    if (!user || !user.is_active) {
      const error = new Error('User not found or account deactivated');
      error.statusCode = 401;
      throw error;
    }

    const dealerProfile = user.role === 'DEALER' ? await resolveDealer(user) : null;
    const payload = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      dealer_id: dealerProfile ? dealerProfile.id : undefined,
    };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    return {
      user: {
        ...(user.toJSON ? user.toJSON() : user),
        dealer_id: dealerProfile ? dealerProfile.id : undefined,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    const plainUser = user.toJSON ? user.toJSON() : user;
    delete plainUser.password_hash;
    const dealerProfile = plainUser.role === 'DEALER' ? await resolveDealer(plainUser) : null;
    return {
      ...plainUser,
      dealer_id: dealerProfile ? dealerProfile.id : undefined,
    };
  },

  async loginAsUser({ email, userId }, currentAdminUser) {
    if (currentAdminUser?.role !== 'DROPSHIPPER') {
      const error = new Error('Unauthorized: Only platform administrators can log in as another user.');
      error.statusCode = 403;
      throw error;
    }

    let user;
    if (userId) {
      user = await userRepository.findById(userId);
    } else if (email) {
      user = await userRepository.findByEmail(email.toLowerCase().trim());
    }

    if (!user) {
      const error = new Error('Target user not found');
      error.statusCode = 404;
      throw error;
    }

    const plainUser = user.toJSON ? user.toJSON() : user;
    delete plainUser.password_hash;

    const dealerProfile = plainUser.role === 'DEALER' ? await resolveDealer(plainUser) : null;
    const payload = {
      id: plainUser.id,
      role: plainUser.role,
      name: plainUser.name,
      email: plainUser.email,
      dealer_id: dealerProfile ? dealerProfile.id : undefined,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        ...plainUser,
        dealer_id: dealerProfile ? dealerProfile.id : undefined,
      },
      accessToken,
      refreshToken,
    };
  },

  async getAllUsers() {
    const users = await userRepository.findAll({
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']],
    });
    return users;
  },
};
