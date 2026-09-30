/**
 * Cookie Utilities for Access & Refresh Token Session Management
 */
import { clearStoredBusinessId, purgeLegacyLocalStorageKeys } from './sessionStorage';

export interface CookieOptions {
  days?: number;
  minutes?: number;
  seconds?: number;
  path?: string;
  sameSite?: 'Lax' | 'Strict' | 'None';
}

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${encodeURIComponent(name)}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions | number = 7
): void => {
  if (typeof document === 'undefined') return;

  let durationMs = 7 * 24 * 60 * 60 * 1000;
  let path = '/';
  let sameSite = 'Lax';

  if (typeof options === 'number') {
    durationMs = options * 24 * 60 * 60 * 1000;
  } else if (typeof options === 'object') {
    if (options.seconds !== undefined) {
      durationMs = options.seconds * 1000;
    } else if (options.minutes !== undefined) {
      durationMs = options.minutes * 60 * 1000;
    } else if (options.days !== undefined) {
      durationMs = options.days * 24 * 60 * 60 * 1000;
    }
    if (options.path) path = options.path;
    if (options.sameSite) sameSite = options.sameSite;
  }

  const expires = new Date(Date.now() + durationMs).toUTCString();
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=${sameSite}${secureFlag}`;
};

export const removeCookie = (name: string, path = '/'): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
};

/**
 * Access Token: 15 minutes
 * Refresh Token: 7 days
 */
export const setAuthCookies = (tokens: {
  accessToken?: string | null;
  token?: string | null;
  refreshToken?: string | null;
  user?: any;
}): void => {
  const access = tokens.accessToken || tokens.token;
  if (access) {
    // 15 minutes expiry
    setCookie('accessToken', access, { minutes: 15 });
    // Remove legacy duplicate 'token' cookie if present
    removeCookie('token');
  }

  if (tokens.refreshToken) {
    // 7 days expiry
    setCookie('refreshToken', tokens.refreshToken, { days: 7 });
  }

  if (tokens.user) {
    // 7 days expiry for cached user display info
    setCookie('auth_user', JSON.stringify(tokens.user), { days: 7 });
  }
};

export const clearAuthCookies = (): void => {
  removeCookie('accessToken');
  removeCookie('token');
  removeCookie('refreshToken');
  removeCookie('auth_user');
  clearStoredBusinessId();
  purgeLegacyLocalStorageKeys();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch {}
  }
};
