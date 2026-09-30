/**
 * Form validation helper functions
 */

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return true;
  const trimmed = phone.trim();
  if (!trimmed) return true;
  if (!/^\+?[0-9\s\-()]{7,20}$/.test(trimmed)) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function sanitizePhoneInput(val: string): string {
  return val.replace(/[^0-9+\s\-()]/g, '');
}

export function isValidPassword(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number.' };
  }
  return { valid: true };
}

export function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

export function isPositiveNumber(val: unknown): boolean {
  if (typeof val === 'number') return !isNaN(val) && val > 0;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return !isNaN(parsed) && parsed > 0;
  }
  return false;
}

export function isRequired(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (typeof val === 'number') return !isNaN(val);
  return true;
}

export function isMinLength(val: string, min: number): boolean {
  return typeof val === 'string' && val.trim().length >= min;
}

export function isPositiveDecimal(val: unknown): boolean {
  return isPositiveNumber(val);
}

export function isValidSku(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  return /^[A-Z0-9_-]{3,30}$/i.test(val.trim());
}

