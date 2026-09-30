import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = React.memo(({
  children,
  variant = 'default',
  className = '',
  size = 'md',
  dot = true,
  icon,
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    success: {
      container: 'bg-[#ABD699]/30 text-[#16123F] border-[#ABD699]',
      dot: 'bg-[#2E7D32]',
    },
    warning: {
      container: 'bg-[#FFE26A]/40 text-[#16123F] border-[#FFE26A]',
      dot: 'bg-[#D4A100]',
    },
    error: {
      container: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
      dot: 'bg-[#EF4444]',
    },
    info: {
      container: 'bg-[#75C9B7]/25 text-[#16123F] border-[#75C9B7]',
      dot: 'bg-[#75C9B7]',
    },
    primary: {
      container: 'bg-[#75C9B7]/30 text-[#16123F] border-[#75C9B7]',
      dot: 'bg-[#75C9B7]',
    },
    default: {
      container: 'bg-[#F0F6F2] text-[#16123F] border-[#C7DDCC]',
      dot: 'bg-[#C7DDCC]',
    },
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-caption gap-1.5',
    md: 'px-3 py-1 text-caption font-semibold gap-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-none ${variantStyles[variant].container} ${sizeStyles} ${className}`}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : dot ? (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${variantStyles[variant].dot}`} aria-hidden="true" />
      ) : null}
      <span className="capitalize">{children}</span>
    </span>
  );
});

Badge.displayName = 'Badge';

