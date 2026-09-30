import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
  maxMonthsFromStart?: number; // default 12
  label?: string;
}

// Robust date string helpers avoiding timezone pitfalls
const parseYMD = (str: string) => {
  if (!str) return { year: 0, month: 0, day: 0 };
  const parts = str.split('-').map(Number);
  return { year: parts[0] || 0, month: (parts[1] || 1) - 1, day: parts[2] || 1 };
};

const formatYMD = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const addMonthsToYMD = (ymdStr: string, monthsToAdd: number): string => {
  if (!ymdStr) return '';
  const { year, month, day } = parseYMD(ymdStr);
  const target = new Date(year, month + monthsToAdd, day);
  return formatYMD(target.getFullYear(), target.getMonth(), target.getDate());
};

const addDaysToYMD = (ymdStr: string, daysToAdd: number): string => {
  if (!ymdStr) return '';
  const { year, month, day } = parseYMD(ymdStr);
  const target = new Date(year, month, day + daysToAdd);
  return formatYMD(target.getFullYear(), target.getMonth(), target.getDate());
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  maxMonthsFromStart = 12,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectingStep, setSelectingStep] = useState<'START' | 'END'>('START');
  const containerRef = useRef<HTMLDivElement>(null);

  // Today string in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return formatYMD(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  // Compute maximum allowed end date based strictly on start date (12 months max)
  const maxEndDateStr = useMemo(() => {
    const base = startDate || todayStr;
    return addMonthsToYMD(base, maxMonthsFromStart);
  }, [startDate, todayStr, maxMonthsFromStart]);

  // Enforce automatic clamping if incoming endDate exceeds maxEndDateStr
  useEffect(() => {
    if (startDate && endDate && maxEndDateStr && endDate > maxEndDateStr) {
      onChange(startDate, maxEndDateStr);
    }
  }, [startDate, endDate, maxEndDateStr, onChange]);

  // Active view month/year for the calendar
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (startDate) {
      const { year, month } = parseYMD(startDate);
      return new Date(year, month, 1);
    }
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Ensure view aligns when opened
  useEffect(() => {
    if (isOpen) {
      const targetDate = selectingStep === 'END' && endDate ? endDate : startDate || todayStr;
      const { year, month } = parseYMD(targetDate);
      setViewDate(new Date(year, month, 1));
    }
  }, [isOpen, selectingStep]);

  // Click outside listener
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

  // Navigation limits
  const { todayYear, todayMonth } = useMemo(() => {
    const d = new Date();
    return { todayYear: d.getFullYear(), todayMonth: d.getMonth() };
  }, []);

  const { maxYear, maxMonth } = useMemo(() => {
    if (!maxEndDateStr) {
      const d = new Date();
      return { maxYear: d.getFullYear() + 1, maxMonth: d.getMonth() };
    }
    const { year, month } = parseYMD(maxEndDateStr);
    return { maxYear: year, maxMonth: month };
  }, [maxEndDateStr]);

  const currentViewScore = viewDate.getFullYear() * 12 + viewDate.getMonth();
  const minViewScore = todayYear * 12 + todayMonth;
  const maxViewScore = maxYear * 12 + maxMonth;

  const canGoPrev = currentViewScore > minViewScore;
  const canGoNext = currentViewScore < maxViewScore;

  // Month navigation
  const prevMonth = () => {
    if (!canGoPrev) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    if (!canGoNext) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Generate days matrix for the view month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isBeyondMax: boolean;
      isDisabled: boolean;
      isStart: boolean;
      isEnd: boolean;
      isInRange: boolean;
      isHoverRange: boolean;
      isToday: boolean;
    }> = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthTotalDays - i;
      const prevDate = new Date(year, month - 1, dNum);
      const dateStr = formatYMD(prevDate.getFullYear(), prevDate.getMonth(), dNum);
      days.push({
        dateStr,
        dayNum: dNum,
        isCurrentMonth: false,
        isPast: dateStr < todayStr,
        isBeyondMax: !!maxEndDateStr && dateStr > maxEndDateStr,
        isDisabled: true,
        isStart: dateStr === startDate,
        isEnd: dateStr === endDate,
        isInRange: Boolean(startDate && endDate && dateStr > startDate && dateStr < endDate),
        isHoverRange: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = formatYMD(year, month, day);
      const isPast = dateStr < todayStr;
      
      // End date cannot be before startDate or beyond maxEndDateStr (12 months strictly)
      let isBeyondMax = false;
      if (maxEndDateStr && dateStr > maxEndDateStr) {
        isBeyondMax = true;
      }
      if (selectingStep === 'END' && startDate && dateStr < startDate) {
        isBeyondMax = true;
      }

      const isDisabled = isPast || isBeyondMax;
      const isStart = dateStr === startDate;
      const isEnd = dateStr === endDate;
      const isInRange = Boolean(startDate && endDate && dateStr > startDate && dateStr < endDate);
      
      // Hover range preview when selecting end date
      let isHoverRange = false;
      if (selectingStep === 'END' && startDate && hoverDate && hoverDate >= startDate && hoverDate <= maxEndDateStr) {
        isHoverRange = dateStr > startDate && dateStr <= hoverDate;
      }

      days.push({
        dateStr,
        dayNum: day,
        isCurrentMonth: true,
        isPast,
        isBeyondMax,
        isDisabled,
        isStart,
        isEnd,
        isInRange,
        isHoverRange,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding days to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = formatYMD(nextDate.getFullYear(), nextDate.getMonth(), i);
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isPast: false,
        isBeyondMax: !!maxEndDateStr && dateStr > maxEndDateStr,
        isDisabled: true,
        isStart: dateStr === startDate,
        isEnd: dateStr === endDate,
        isInRange: Boolean(startDate && endDate && dateStr > startDate && dateStr < endDate),
        isHoverRange: false,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [viewDate, startDate, endDate, todayStr, maxEndDateStr, selectingStep, hoverDate]);

  // Handle day click
  const handleDateClick = (dateStr: string, isDisabled: boolean) => {
    if (isDisabled) return;

    if (selectingStep === 'START') {
      // Set start date
      let newEnd = endDate;
      const computedMax = addMonthsToYMD(dateStr, maxMonthsFromStart);

      // If current endDate is before new start or more than 12 months after, adjust it
      if (!endDate || endDate < dateStr || endDate > computedMax) {
        // default 7 days after, or clamped to computedMax
        const defaultEnd = addDaysToYMD(dateStr, 6);
        newEnd = defaultEnd > computedMax ? computedMax : defaultEnd;
      }

      onChange(dateStr, newEnd);
      setSelectingStep('END');
    } else {
      // Set end date
      if (dateStr < startDate) {
        // Clicked a date before start -> make it the new start
        const newMax = addMonthsToYMD(dateStr, maxMonthsFromStart);
        const adjustedEnd = startDate > newMax ? newMax : startDate;
        onChange(dateStr, adjustedEnd);
        setSelectingStep('END');
      } else {
        if (maxEndDateStr && dateStr > maxEndDateStr) {
          // Strictly disallow selecting beyond 12 months
          onChange(startDate, maxEndDateStr);
        } else {
          onChange(startDate, dateStr);
        }
        setSelectingStep('START');
        setIsOpen(false);
      }
    }
  };

  // Quick Preset Handlers
  const applyPreset = (daysCount: number) => {
    const start = startDate && startDate >= todayStr ? startDate : todayStr;
    const computedMax = addMonthsToYMD(start, maxMonthsFromStart);
    
    let endFormatted = addDaysToYMD(start, daysCount - 1);
    if (endFormatted > computedMax) {
      endFormatted = computedMax;
    }

    onChange(start, endFormatted);
    setIsOpen(false);
  };

  // Duration in days
  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const { year: sy, month: sm, day: sd } = parseYMD(startDate);
    const { year: ey, month: em, day: ed } = parseYMD(endDate);
    const s = new Date(sy, sm, sd);
    const e = new Date(ey, em, ed);
    const diffTime = e.getTime() - s.getTime();
    return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
  }, [startDate, endDate]);

  const monthYearLabel = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* ─── TRIGGER INPUT BARS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* From Date Trigger */}
        <div
          onClick={() => {
            setSelectingStep('START');
            setIsOpen(true);
          }}
          className={`flex items-center justify-between p-3 rounded-2xl bg-[#FAFAFA] border cursor-pointer transition-all hover:bg-white hover:border-[#75C9B7] group ${
            isOpen && selectingStep === 'START'
              ? 'border-[#16123F] ring-2 ring-[#75C9B7]/30 bg-white'
              : 'border-[#C7DDCC]'
          }`}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#555279] block">
              From Date (Start) *
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#16123F]">
                {startDate
                  ? (() => {
                      const { year, month, day } = parseYMD(startDate);
                      return new Date(year, month, day).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                    })()
                  : 'Select Date'}
              </span>
              {startDate === todayStr && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#75C9B7]/20 text-[#16123F]">
                  Today
                </span>
              )}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#F0F6F2] group-hover:bg-[#75C9B7]/20 flex items-center justify-center text-[#16123F] transition-colors">
            <CalendarIcon className="w-4 h-4 text-[#75C9B7]" />
          </div>
        </div>

        {/* To Date Trigger */}
        <div
          onClick={() => {
            setSelectingStep('END');
            setIsOpen(true);
          }}
          className={`flex items-center justify-between p-3 rounded-2xl bg-[#FAFAFA] border cursor-pointer transition-all hover:bg-white hover:border-[#75C9B7] group ${
            isOpen && selectingStep === 'END'
              ? 'border-[#16123F] ring-2 ring-[#75C9B7]/30 bg-white'
              : 'border-[#C7DDCC]'
          }`}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#555279]">
                To Date (End) *
              </span>
              <span className="text-[9px] font-bold text-[#75C9B7] bg-[#75C9B7]/10 px-1.5 py-0.2 rounded-md">
                {durationDays} Days Plan
              </span>
            </div>
            <span className="text-xs font-black text-[#16123F] block">
              {endDate
                ? (() => {
                    const { year, month, day } = parseYMD(endDate);
                    return new Date(year, month, day).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                  })()
                : 'Select Date'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#F0F6F2] group-hover:bg-[#FFE26A]/40 flex items-center justify-center text-[#16123F] transition-colors">
            <CalendarIcon className="w-4 h-4 text-[#16123F]" />
          </div>
        </div>
      </div>

      {/* ─── CUSTOM HIGH-END CALENDAR POPOVER ─── */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-40 w-full sm:w-[420px] bg-white rounded-3xl border border-[#C7DDCC] shadow-2xl p-5 space-y-4 animate-scale-up text-[#16123F]">
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-[#F0F6F2] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#75C9B7] animate-pulse" />
                <span className="text-xs font-black text-[#16123F]">
                  {selectingStep === 'START' ? 'Select Campaign Start Date' : 'Select Campaign End Date'}
                </span>
              </div>
              <span className="text-[10px] text-[#555279]">
                {selectingStep === 'START'
                  ? 'Must be today or future date'
                  : `Max 12 months allowed (${
                      maxEndDateStr
                        ? (() => {
                            const { year, month, day } = parseYMD(maxEndDateStr);
                            return new Date(year, month, day).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            });
                          })()
                        : ''
                    })`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-[#FAFAFA] hover:bg-[#F0F6F2] border border-[#C7DDCC] flex items-center justify-center text-[#555279] hover:text-[#16123F] cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Presets Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => applyPreset(7)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#F0F6F2] hover:bg-[#75C9B7]/20 text-[#16123F] border border-[#C7DDCC]/60 transition-all cursor-pointer shrink-0"
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => applyPreset(14)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#F0F6F2] hover:bg-[#75C9B7]/20 text-[#16123F] border border-[#C7DDCC]/60 transition-all cursor-pointer shrink-0"
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => applyPreset(30)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#F0F6F2] hover:bg-[#75C9B7]/20 text-[#16123F] border border-[#C7DDCC]/60 transition-all cursor-pointer shrink-0"
            >
              30 Days (1 Mo)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(90)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#F0F6F2] hover:bg-[#FFE26A]/40 text-[#16123F] border border-[#C7DDCC]/60 transition-all cursor-pointer shrink-0"
            >
              90 Days (Qtr)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(180)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#F0F6F2] hover:bg-[#FFE26A]/40 text-[#16123F] border border-[#C7DDCC]/60 transition-all cursor-pointer shrink-0"
            >
              180 Days (6 Mo)
            </button>
            <button
              type="button"
              onClick={() => {
                if (startDate && maxEndDateStr) {
                  onChange(startDate, maxEndDateStr);
                  setIsOpen(false);
                }
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FFE26A]/30 hover:bg-[#FFE26A] text-[#16123F] border border-amber-300 transition-all cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#16123F]" />
              <span>12 Months (Max)</span>
            </button>
          </div>

          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between bg-[#FAFAFA] p-2 rounded-2xl border border-[#C7DDCC]/70">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={prevMonth}
              className={`p-1.5 rounded-xl text-[#16123F] transition-colors border border-transparent ${
                canGoPrev
                  ? 'hover:bg-white hover:border-[#C7DDCC] cursor-pointer'
                  : 'opacity-30 cursor-not-allowed'
              }`}
              title={canGoPrev ? 'Previous Month' : 'Cannot select past months'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-[#16123F] tracking-wide">{monthYearLabel}</span>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={nextMonth}
              className={`p-1.5 rounded-xl text-[#16123F] transition-colors border border-transparent ${
                canGoNext
                  ? 'hover:bg-white hover:border-[#C7DDCC] cursor-pointer'
                  : 'opacity-30 cursor-not-allowed'
              }`}
              title={canGoNext ? 'Next Month' : 'Maximum 12 months from start date'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-[#555279] uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarDays.map((day, idx) => {
              const isSelected = day.isStart || day.isEnd;
              const isMiddle = day.isInRange || day.isHoverRange;

              return (
                <div
                  key={idx}
                  className={`relative py-1 flex items-center justify-center ${
                    isMiddle ? 'bg-[#75C9B7]/20' : ''
                  } ${day.isStart && endDate && endDate !== startDate ? 'rounded-l-xl bg-[#75C9B7]/20' : ''} ${
                    day.isEnd && startDate && endDate !== startDate ? 'rounded-r-xl bg-[#75C9B7]/20' : ''
                  }`}
                  onMouseEnter={() => {
                    if (selectingStep === 'END' && day.isCurrentMonth && !day.isDisabled) {
                      setHoverDate(day.dateStr);
                    }
                  }}
                  onMouseLeave={() => setHoverDate(null)}
                >
                  <button
                    type="button"
                    disabled={day.isDisabled || !day.isCurrentMonth}
                    onClick={() => handleDateClick(day.dateStr, day.isDisabled || !day.isCurrentMonth)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                      !day.isCurrentMonth
                        ? 'text-[#555279]/30 opacity-25 cursor-default'
                        : day.isDisabled
                        ? 'text-[#555279]/40 bg-[#FAFAFA]/50 cursor-not-allowed line-through decoration-rose-300'
                        : isSelected
                        ? 'bg-[#16123F] text-[#FFE26A] shadow-md font-black scale-105 z-10'
                        : isMiddle
                        ? 'text-[#16123F] font-bold hover:bg-[#75C9B7]/40'
                        : 'text-[#16123F] hover:bg-[#F0F6F2] hover:border-[#75C9B7]'
                    }`}
                  >
                    <span>{day.dayNum}</span>
                    {day.isToday && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[#75C9B7] absolute bottom-1" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Calendar Footer Notice */}
          <div className="pt-3 border-t border-[#F0F6F2] flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-[#555279]">
              <AlertCircle className="w-3.5 h-3.5 text-[#75C9B7]" />
              <span>
                Min: <strong>Today</strong> • Max Limit: <strong>12 Months</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

