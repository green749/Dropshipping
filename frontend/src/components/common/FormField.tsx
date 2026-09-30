import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  labelRight?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = React.memo(({
  label,
  htmlFor,
  error,
  helperText,
  required,
  labelRight,
  className = '',
  children,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={htmlFor}
            className="block text-xs font-semibold text-slate-700 tracking-tight select-none"
          >
            {label}
            {required && <span className="text-amber-500 ml-1 font-bold">*</span>}
          </label>
          {labelRight && <div className="text-xs text-slate-400">{labelRight}</div>}
        </div>
      )}

      {/* Input or Form Control */}
      <div>{children}</div>

      {/* Inline Error Message */}
      {error ? (
        <div
          role="alert"
          className="flex items-center gap-1.5 text-xs text-rose-500 font-medium mt-1 animate-fade-in"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

FormField.displayName = 'FormField';
