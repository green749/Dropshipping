import { describe, it, expect } from 'vitest';
import { extractFormErrors } from '../../utils/errorParser';

describe('extractFormErrors Utility', () => {
  it('extracts field-level inline errors from backend validation structure', () => {
    const backendError = {
      statusCode: 422,
      message: 'Validation failed',
      data: {
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'Invalid email address' },
          { field: 'password', message: 'Password must be at least 8 characters' },
        ],
      },
    };

    const parsed = extractFormErrors(backendError);
    expect(parsed.fieldErrors.email).toBe('Invalid email address');
    expect(parsed.fieldErrors.password).toBe('Password must be at least 8 characters');
    expect(parsed.generalError).toBeUndefined(); // Generic "Validation failed" is omitted when inline field errors exist
  });

  it('handles general error strings when no field errors exist', () => {
    const error = 'Invalid username or password';
    const parsed = extractFormErrors(error);

    expect(parsed.fieldErrors).toEqual({});
    expect(parsed.generalError).toBe('Invalid username or password');
  });

  it('extracts error from nested Axios response data object', () => {
    const axiosError = {
      response: {
        data: {
          success: false,
          message: 'Product SKU already exists in catalog',
          errors: [{ field: 'sku', message: 'SKU must be unique' }],
        },
      },
    };

    const parsed = extractFormErrors(axiosError);
    expect(parsed.fieldErrors.sku).toBe('SKU must be unique');
    expect(parsed.generalError).toBe('Product SKU already exists in catalog');
  });

  it('gracefully handles null or empty errors', () => {
    const parsed = extractFormErrors(null);
    expect(parsed.fieldErrors).toEqual({});
    expect(parsed.generalError).toBeUndefined();
  });
});
