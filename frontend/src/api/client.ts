import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getCookie, setAuthCookies, clearAuthCookies } from '../utils/cookie';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Request Interceptor ─────────────────────────────────────────────────
// Attach JWT access token (from cookie) + CSRF token (from cookie)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getCookie('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // CSRF: read from cookie 'csrf-token' if server sets it
    const csrfMatch = document.cookie.match(/csrf-token=([^;]+)/);
    if (csrfMatch && config.headers) {
      config.headers['X-CSRF-Token'] = csrfMatch[1];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Silent Refresh Queue State ──────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Response Interceptor with Automatic Token Refresh ──────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register');

    // If 401 Unauthorized and not already retried or auth endpoint
    if (status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      const refreshToken = getCookie('refreshToken');

      if (refreshToken) {
        if (isRefreshing) {
          // If a refresh is already in flight, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (newAccessToken: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                resolve(apiClient(originalRequest));
              },
              reject: (err: any) => {
                reject(err);
              },
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call refresh endpoint with refresh token
          const refreshRes = await axios.post(
            '/api/v1/auth/refresh',
            { refreshToken },
            { withCredentials: true }
          );

          const payload = refreshRes.data?.data || refreshRes.data;
          const newAccessToken = payload?.accessToken || getCookie('accessToken');
          const newRefreshToken = payload?.refreshToken || refreshToken;

          if (newAccessToken) {
            setAuthCookies({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
              user: payload?.user,
            });

            processQueue(null, newAccessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return apiClient(originalRequest);
          } else {
            throw new Error('No access token returned from refresh');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          clearAuthCookies();
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/accept-invite')
          ) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available, clear session & redirect to login
        clearAuthCookies();
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/accept-invite')
        ) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject({
      statusCode: status || 500,
      message,
      data: error.response?.data,
    });
  }
);
