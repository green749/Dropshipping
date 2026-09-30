import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  error?: string | boolean;
  icon?: React.ComponentType<{ className?: string }>;
  prefixText?: string;
  suffix?: React.ReactNode;
}

export const Input = React.memo(
  forwardRef<HTMLInputElement, InputProps>(
    ({ hasError, error, icon: Icon, prefixText, suffix, className = '', disabled, ...props }, ref) => {
      const isError = Boolean(hasError || error);

      return (
        <div className="relative flex items-center w-full">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-[#555279]/70 z-10">
              <Icon className="w-4 h-4" />
            </div>
          )}

          {prefixText && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555279] text-sm font-medium select-none pointer-events-none z-10">
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            disabled={disabled}
            aria-invalid={isError ? 'true' : 'false'}
            className={`w-full rounded-2xl text-xs transition-all duration-200 outline-none
              ${Icon ? '!pl-10' : prefixText ? '!pl-8' : 'px-3.5'}
              ${suffix ? '!pr-10' : 'pr-3.5'}
              py-2.5 bg-[#F8FAF8] hover:bg-white focus:bg-white text-[#16123F] placeholder-[#555279]/50
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

          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center text-[#555279] z-10 pointer-events-auto">
              {suffix}
            </div>
          )}
        </div>
      );
    }
  )
);

Input.displayName = 'Input';
