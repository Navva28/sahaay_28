import React from 'react';
import { RequestStatus } from '../types';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'OPEN':
        return {
          label: 'Open for Help',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'ACCEPTED':
        return {
          label: 'Volunteer Assigned',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-400',
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
