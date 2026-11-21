import React from 'react';
import { RequestPriority } from '../types';

interface PriorityBadgeProps {
  priority: RequestPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'urgent':
        return {
          label: 'Urgent Priority',
          style: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case 'high':
        return {
          label: 'High Priority',
          style: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      case 'medium':
        return {
          label: 'Medium Priority',
          style: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'low':
        return {
          label: 'Standard Priority',
          style: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      default:
        return {
          label: priority,
          style: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${config.style} ${className}`}
    >
      {config.label}
    </span>
  );
};
