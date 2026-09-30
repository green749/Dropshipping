import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  error?: string | boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ hasError, error, className = '', disabled, rows = 3, ...props }, ref) => {
    const isError = Boolean(hasError || error);

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        rows={rows}
        aria-invalid={isError ? 'true' : 'false'}
        className={`w-full rounded-2xl text-sm transition-all duration-200 outline-none px-4 py-3 bg-[#F8F9FB] hover:bg-white focus:bg-white text-[#051747] placeholder-slate-400 resize-none
          ${
            isError
              ? 'border-2 border-rose-500/80 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/30'
              : 'border border-[#C7DDCC] hover:border-[#75C9B7] focus:border-[#75C9B7] focus:ring-2 focus:ring-[#75C9B7]/25'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
