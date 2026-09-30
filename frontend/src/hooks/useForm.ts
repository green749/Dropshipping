import { useState, useCallback } from 'react';
import { extractFormErrors } from '../utils/errorParser';

export type FormValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validate?: (values: T) => FormValidationErrors<T> | Promise<FormValidationErrors<T>>;
  onSubmit?: (values: T) => Promise<void> | void;
}

export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: FormValidationErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  generalError: string | null;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: (field: keyof T, message: string | undefined) => void;
  setErrors: (errors: FormValidationErrors<T>) => void;
  setGeneralError: (message: string | null) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  resetForm: (newValues?: Partial<T>) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<boolean>;
  getFieldProps: (field: keyof T) => {
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: (e: React.FocusEvent<any>) => void;
    hasError: boolean;
    error: string | undefined;
  };
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormValidationErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrorsState((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      const finalValue = type === 'checkbox' ? checked : value;
      setFieldValue(name as keyof T, finalValue as any);
    },
    [setFieldValue]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const field = e.target.name as keyof T;
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (validate) {
        const clientErrors = validate(values);
        if (clientErrors && typeof (clientErrors as any).then === 'function') {
          (clientErrors as Promise<FormValidationErrors<T>>).then((resolved) => {
            if (resolved[field]) {
              setErrorsState((prev) => ({ ...prev, [field]: resolved[field] }));
            }
          });
        } else {
          const syncErrors = clientErrors as FormValidationErrors<T>;
          if (syncErrors[field]) {
            setErrorsState((prev) => ({ ...prev, [field]: syncErrors[field] }));
          }
        }
      }
    },
    [validate, values]
  );

  const setFieldError = useCallback((field: keyof T, message: string | undefined) => {
    setErrorsState((prev) => {
      if (!message) {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      }
      return { ...prev, [field]: message };
    });
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const setErrors = useCallback((newErrors: FormValidationErrors<T>) => {
    setErrorsState(newErrors);
    // Mark fields with errors as touched so they display immediately
    const touchedUpdate: Partial<Record<keyof T, boolean>> = {};
    for (const key of Object.keys(newErrors) as (keyof T)[]) {
      if (newErrors[key]) touchedUpdate[key] = true;
    }
    setTouched((prev) => ({ ...prev, ...touchedUpdate }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrorsState((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrorsState({});
    setGeneralError(null);
  }, []);

  const resetForm = useCallback(
    (newValues?: Partial<T>) => {
      setValues(newValues ? { ...initialValues, ...newValues } : initialValues);
      setErrorsState({});
      setTouched({});
      setGeneralError(null);
      setIsSubmitting(false);
    },
    [initialValues]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent): Promise<boolean> => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      setGeneralError(null);

      // Run client validation if provided
      if (validate) {
        const clientErrors = await Promise.resolve(validate(values));
        const hasErrors = Object.values(clientErrors).some(Boolean);

        if (hasErrors) {
          setErrors(clientErrors);
          return false;
        }
      }

      if (!onSubmit) return true;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
        setIsSubmitting(false);
        return true;
      } catch (err: unknown) {
        setIsSubmitting(false);
        const parsed = extractFormErrors<T>(err);

        if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
          setErrors(parsed.fieldErrors as FormValidationErrors<T>);
        }
        if (parsed.generalError) {
          setGeneralError(parsed.generalError);
        }
        return false;
      }
    },
    [validate, values, setErrors, onSubmit]
  );

  const getFieldProps = useCallback(
    (field: keyof T) => {
      const err = touched[field] ? errors[field] : undefined;
      return {
        name: String(field),
        value: values[field] ?? '',
        onChange: handleChange,
        onBlur: handleBlur,
        hasError: Boolean(err),
        error: err,
      };
    },
    [values, errors, touched, handleChange, handleBlur]
  );

  const isValid = Object.values(errors).every((err) => !err);

  return {
    values,
    errors,
    touched,
    generalError,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setErrors,
    setGeneralError,
    clearError,
    clearErrors,
    resetForm,
    handleSubmit,
    getFieldProps,
  };
}
