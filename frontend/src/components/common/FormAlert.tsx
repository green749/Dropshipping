import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface FormAlertProps {
  message?: string | null;
  type?: 'error' | 'warning' | 'info' | 'success';
  onClose?: () => void;
  className?: string;
}

export const FormAlert: React.FC<FormAlertProps> = ({
  message,
  type = 'error',
  onClose,
  className = '',
}) => {
  if (!message) return null;

  const config = {
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: AlertCircle,
      iconColor: 'text-rose-500',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: Info,
      iconColor: 'text-sky-500',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-semibold animate-fade-in ${config.bg} ${className}`}
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 leading-relaxed">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-[#535F80] hover:text-[#051747] transition-colors -mr-1 -mt-1 p-1 rounded-lg"
          title="Dismiss error"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
