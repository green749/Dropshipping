import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isNonEmptyString,
  isPositiveNumber,
  isRequired,
  isValidSku,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('returns true for standard email formats', () => {
      expect(isValidEmail('admin@dropship.com')).toBe(true);
      expect(isValidEmail('dealer.user+tag@example.co.uk')).toBe(true);
    });

    it('returns false for invalid email formats', () => {
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@missinguser.com')).toBe(false);
      expect(isValidEmail('missingdomain@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('validates a strong password meeting all criteria', () => {
      const res = isValidPassword('ValidPass123');
      expect(res.valid).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    it('fails when length is under 8 characters', () => {
      const res = isValidPassword('Pass1');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('8 characters');
    });

    it('fails when uppercase letter is missing', () => {
      const res = isValidPassword('lowercase123');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('uppercase letter');
    });

    it('fails when number is missing', () => {
      const res = isValidPassword('NoNumbersHere');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('number');
    });
  });

  describe('isNonEmptyString', () => {
    it('returns true for strings containing visible text', () => {
      expect(isNonEmptyString('Dropship')).toBe(true);
      expect(isNonEmptyString('  spaced  ')).toBe(true);
    });

    it('returns false for empty, whitespace-only, or non-string values', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('returns true for positive numeric numbers and strings', () => {
      expect(isPositiveNumber(49.99)).toBe(true);
      expect(isPositiveNumber('120')).toBe(true);
    });

    it('returns false for zero, negative, or invalid numeric values', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-15)).toBe(false);
      expect(isPositiveNumber('not-a-number')).toBe(false);
      expect(isPositiveNumber(null)).toBe(false);
    });
  });

  describe('isRequired', () => {
    it('returns true for non-empty strings and valid numbers', () => {
      expect(isRequired('test')).toBe(true);
      expect(isRequired(0)).toBe(true);
      expect(isRequired(42)).toBe(true);
    });

    it('returns false for empty string, null, or undefined', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });
  });

  describe('isValidSku', () => {
    it('validates correct alphanumeric SKU formats', () => {
      expect(isValidSku('SKU-1001')).toBe(true);
      expect(isValidSku('DLR_ITEM_20')).toBe(true);
      expect(isValidSku('A123')).toBe(true);
    });

    it('rejects invalid or too short SKUs', () => {
      expect(isValidSku('A!')).toBe(false);
      expect(isValidSku('')).toBe(false);
      expect(isValidSku('ab')).toBe(false);
    });
  });
});

