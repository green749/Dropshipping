/**
 * Centralized Session Storage Helpers & Constants
 * Single source of truth for session-scoped data across the application.
 */

export const SESSION_KEYS = {
  SELECTED_BUSINESS_ID: 'selected_business_id',
  SELECTED_BUSINESS: 'selected_business_object',
  BUSINESSES_LIST: 'businesses_list_cache',
  ALL_BUSINESSES_SENTINEL: '__ALL_BUSINESSES__',
} as const;

/** Sentinel value stored in sessionStorage to represent "All Businesses" (user's explicit choice) */
const ALL_SENTINEL = SESSION_KEYS.ALL_BUSINESSES_SENTINEL;

/**
 * Retrieves the currently active selected business ID from sessionStorage
 */
export const getStoredBusinessId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(SESSION_KEYS.SELECTED_BUSINESS_ID);
  } catch {
    return null;
  }
};

/**
 * Retrieves the currently active selected business object from sessionStorage
 */
export const getStoredBusiness = (): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEYS.SELECTED_BUSINESS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Persists or clears the selected business in sessionStorage.
 * When business is null, stores a sentinel so we know the user EXPLICITLY chose "All Businesses".
 */
export const setStoredBusiness = (business: any | null | undefined): void => {
  if (typeof window === 'undefined') return;
  try {
    if (business && business.id) {
      sessionStorage.setItem(SESSION_KEYS.SELECTED_BUSINESS, JSON.stringify(business));
      sessionStorage.setItem(SESSION_KEYS.SELECTED_BUSINESS_ID, business.id);
    } else {
      // Store sentinel to signal "All Businesses" was explicitly chosen
      sessionStorage.setItem(SESSION_KEYS.SELECTED_BUSINESS_ID, ALL_SENTINEL);
      sessionStorage.removeItem(SESSION_KEYS.SELECTED_BUSINESS);
    }
  } catch {
    // Ignore storage quota/permission errors
  }
};

/**
 * Returns true if the user has explicitly selected "All Businesses"
 */
export const isAllBusinessesSelected = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(SESSION_KEYS.SELECTED_BUSINESS_ID) === ALL_SENTINEL;
  } catch {
    return false;
  }
};

/**
 * Persists or clears the selected business ID in sessionStorage.
 * Passing null stores the "All Businesses" sentinel.
 */
export const setStoredBusinessId = (id: string | null | undefined): void => {
  if (typeof window === 'undefined') return;
  try {
    if (id) {
      sessionStorage.setItem(SESSION_KEYS.SELECTED_BUSINESS_ID, id);
    } else {
      // Store sentinel instead of removing, so we know the user chose "All"
      sessionStorage.setItem(SESSION_KEYS.SELECTED_BUSINESS_ID, ALL_SENTINEL);
      sessionStorage.removeItem(SESSION_KEYS.SELECTED_BUSINESS);
    }
  } catch {
    // Ignore storage quota/permission errors
  }
};

/**
 * Retrieves cached businesses list from sessionStorage
 */
export const getStoredBusinessesList = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(SESSION_KEYS.BUSINESSES_LIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Persists businesses list to sessionStorage
 */
export const setStoredBusinessesList = (list: any[]): void => {
  if (typeof window === 'undefined') return;
  try {
    if (Array.isArray(list) && list.length > 0) {
      sessionStorage.setItem(SESSION_KEYS.BUSINESSES_LIST, JSON.stringify(list));
    } else {
      sessionStorage.removeItem(SESSION_KEYS.BUSINESSES_LIST);
    }
  } catch {}
};

/**
 * Removes all business selection data from sessionStorage
 */
export const clearStoredBusinessData = (): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_KEYS.SELECTED_BUSINESS_ID);
    sessionStorage.removeItem(SESSION_KEYS.SELECTED_BUSINESS);
    sessionStorage.removeItem(SESSION_KEYS.BUSINESSES_LIST);
  } catch {}
};

export const clearStoredBusinessId = clearStoredBusinessData;

/**
 * Purges obsolete / fragmented localStorage keys to keep storage clean and single-sourced
 */
export const purgeLegacyLocalStorageKeys = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('dropship_selected_business');
    localStorage.removeItem('dropship_selected_business_id');
    localStorage.removeItem('dropship_businesses_cache');
    localStorage.removeItem('employees');
  } catch {}
};

