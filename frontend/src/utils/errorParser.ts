/**
 * Utility to extract field-level inline errors and general errors from API responses or exceptions.
 * Compatible with Express/Zod 422 responses, Sequelize errors, Redux rejected payloads, and Axios responses.
 */

export interface FormErrors<T = Record<string, any>> {
  fieldErrors: Partial<Record<keyof T, string>>;
  generalError?: string;
}

export function extractFormErrors<T = Record<string, any>>(err: unknown): FormErrors<T> {
  const result: FormErrors<T> = {
    fieldErrors: {},
  };

  if (!err) return result;

  // 1. If err is a simple string
  if (typeof err === 'string') {
    result.generalError = err;
    return result;
  }

  const errorObj = err as any;

  // 2. Check for nested Axios/Backend structure: { data: { errors, message } } or { response: { data: ... } }
  const data = errorObj.data || errorObj.response?.data;

  // If backend returned a list of field validation errors (e.g. Zod or Sequelize errors)
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    for (const item of data.errors) {
      if (item.field && item.message) {
        // Support both snake_case and camelCase mapping if needed
        (result.fieldErrors as any)[item.field] = item.message;
      }
    }
  }

  // Also check top-level errorObj.errors if direct object was thrown
  if (Array.isArray(errorObj.errors) && errorObj.errors.length > 0) {
    for (const item of errorObj.errors) {
      if (item.field && item.message) {
        (result.fieldErrors as any)[item.field] = item.message;
      }
    }
  }

  // 3. Extract general message
  const generalMsg =
    data?.message ||
    errorObj.message ||
    (typeof errorObj === 'object' && errorObj.error ? String(errorObj.error) : undefined);

  // If we have field errors and message is generic "Validation failed", don't clutter with redundant general banner
  if (Object.keys(result.fieldErrors).length > 0) {
    if (generalMsg && !/validation failed/i.test(generalMsg)) {
      result.generalError = generalMsg;
    }
  } else {
    result.generalError = generalMsg || 'An unexpected error occurred. Please try again.';
  }

  return result;
}
