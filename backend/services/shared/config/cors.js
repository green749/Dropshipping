import { env } from './env.js';

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = [
      env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'http://localhost:5179',
      'http://localhost:3000',
    ];

    if (
      allowed.includes(origin) ||
      /^http:\/\/localhost:[0-9]+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:[0-9]+$/.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
};
