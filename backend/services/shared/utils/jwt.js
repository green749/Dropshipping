import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT.ACCESS_SECRET, {
    expiresIn: env.JWT.ACCESS_EXPIRES_IN || '15m',
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT.REFRESH_SECRET, {
    expiresIn: env.JWT.REFRESH_EXPIRES_IN || '7d',
  });
};

export const generateToken = generateAccessToken;

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT.ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT.REFRESH_SECRET);
};

export const verifyToken = verifyAccessToken;
