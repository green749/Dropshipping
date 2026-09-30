import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center border border-dashed border-[rgba(5,23,71,0.12)] rounded-xl bg-white">
      <div className="w-12 h-12 mb-3.5 rounded-xl bg-[#081F62]/5 border border-[#081F62]/10 flex items-center justify-center text-[#535F80]">
        {icon || <PackageOpen className="w-6 h-6 text-[#081F62]" />}
      </div>
      <h4 className="text-h4 font-bold text-[#051747] tracking-tight">{title}</h4>
      {description && (
        <p className="text-small text-[#535F80] max-w-sm mt-1.5 mb-5 font-normal">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
