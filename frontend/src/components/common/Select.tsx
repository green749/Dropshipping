import React, { useState, useRef, useEffect, forwardRef, useMemo, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  value?: string | number;
  hasError?: boolean;
  error?: string | boolean;
  icon?: React.ComponentType<{ className?: string }>;
  options?: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'borderless';
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      value = '',
      hasError,
      error,
      icon: Icon,
      options: propOptions,
      placeholder = 'Select an option...',
      variant = 'default',
      onChange,
      className = '',
      disabled = false,
      children,
      name,
      id,
      ...props
    },
    ref
  ) => {
    const isError = Boolean(hasError || error);
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);

    // Extract options from props or from <option> children
    const parsedOptions = useMemo<SelectOption[]>(() => {
      if (propOptions && propOptions.length > 0) {
        return propOptions;
      }

      const extracted: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === 'option') {
          extracted.push({
            value: (child.props as any).value ?? '',
            label: (child.props as any).children ?? (child.props as any).value,
            disabled: Boolean((child.props as any).disabled),
          });
        }
      });
      return extracted;
    }, [propOptions, children]);

    // Find selected option
    const selectedOption = useMemo(() => {
      return parsedOptions.find((opt) => String(opt.value) === String(value));
    }, [parsedOptions, value]);

    // Calculate open direction when opening
    const handleToggleOpen = () => {
      if (disabled) return;
      if (!isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenUpward(spaceBelow < 260 && spaceAbove > spaceBelow);
        
        // Find index of selected option to highlight
        const selIdx = parsedOptions.findIndex((opt) => String(opt.value) === String(value));
        setFocusedIndex(selIdx >= 0 ? selIdx : 0);
      }
      setIsOpen((prev) => !prev);
    };

    // Handle outside click to close
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Handle selection
    const handleSelect = useCallback(
      (opt: SelectOption) => {
        if (opt.disabled || disabled) return;
        setIsOpen(false);
        onChange?.({
          target: {
            value: String(opt.value),
            name,
          },
        });
      },
      [disabled, name, onChange]
    );

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggleOpen();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < parsedOptions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : parsedOptions.length - 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < parsedOptions.length) {
          handleSelect(parsedOptions[focusedIndex]);
        }
      } else if (e.key === 'Tab') {
        setIsOpen(false);
      }
    };

    return (
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className={`relative w-full select-none ${className}`}
      >
        {/* Hidden native select for accessibility and form integration */}
        <select
          ref={ref}
          value={value}
          name={name}
          id={id}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          onChange={(e) => onChange?.({ target: { value: e.target.value, name } })}
          {...props}
        >
          {parsedOptions.map((opt) => (
            <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
              {typeof opt.label === 'string' ? opt.label : String(opt.value)}
            </option>
          ))}
        </select>

        {/* Custom Select Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleToggleOpen}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={isError ? 'true' : 'false'}
          className={`w-full min-h-[42px] rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 outline-none flex items-center justify-between text-left cursor-pointer
            ${Icon ? 'pl-9' : 'pl-3.5'} pr-3 py-2.5
            ${
              variant === 'borderless'
                ? disabled
                  ? 'bg-transparent opacity-60 cursor-not-allowed border-none'
                  : isOpen
                  ? 'bg-[#F0F6F2] border-none ring-2 ring-[#75C9B7]/25 shadow-none'
                  : 'bg-transparent hover:bg-[#F0F6F2] border-none shadow-none focus:bg-[#F0F6F2]'
                : disabled
                ? 'bg-slate-100 opacity-60 cursor-not-allowed border border-slate-200'
                : isOpen
                ? 'bg-white border-[#75C9B7] ring-4 ring-[#75C9B7]/20 shadow-xs'
                : isError
                ? 'bg-rose-50/40 border border-rose-400 focus:ring-4 focus:ring-rose-200 focus:border-rose-500'
                : 'bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-[#75C9B7] focus:border-[#75C9B7] focus:ring-4 focus:ring-[#75C9B7]/20 shadow-2xs'
            }
          `}
        >
          {Icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <span
            className={`block truncate ${
              selectedOption && String(selectedOption.value) !== ''
                ? 'text-slate-900 font-semibold'
                : 'text-slate-400 font-normal'
            }`}
          >
            {selectedOption && String(selectedOption.value) !== ''
              ? selectedOption.label
              : placeholder}
          </span>

          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ml-2 ${
              isOpen ? 'rotate-180 text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
        </button>

        {/* Custom Styled Floating Dropdown Menu */}
        {isOpen && (
          <div
            ref={listboxRef}
            role="listbox"
            className={`absolute left-0 right-0 z-[9999] max-h-60 overflow-y-auto rounded-2xl bg-white/98 backdrop-blur-md border border-slate-200/90 p-1.5 shadow-[0_16px_36px_-6px_rgba(22,18,63,0.16),0_4px_12px_-2px_rgba(22,18,63,0.06)] animate-scale-up custom-scrollbar ${
              openUpward ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'
            }`}
          >
            {parsedOptions.length === 0 ? (
              <div className="py-3 px-3.5 text-center text-xs text-slate-400">
                No options available
              </div>
            ) : (
              parsedOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isFocused = idx === focusedIndex;
                const isPlaceholder = String(opt.value) === '';

                return (
                  <button
                    key={String(opt.value) || `opt-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 flex items-center justify-between group cursor-pointer
                      ${
                        opt.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#75C9B7]/15 text-[#16123F] font-bold shadow-2xs'
                          : isFocused
                          ? 'bg-slate-100/90 text-slate-900 font-medium'
                          : isPlaceholder
                          ? 'text-slate-400 font-normal hover:bg-slate-50 hover:text-slate-600'
                          : 'text-slate-700 hover:bg-slate-50/90 hover:text-slate-950 font-medium'
                      }
                    `}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && !isPlaceholder && (
                      <Check className="w-4 h-4 text-[#16123F] shrink-0 ml-2 animate-fade-in" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
