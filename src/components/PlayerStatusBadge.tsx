import React from 'react';
import { PlayerStatusInfo } from '../types.js';
import { AlertCircle, Ban, Activity, ShieldAlert } from 'lucide-react';

interface PlayerStatusBadgeProps {
  statusInfo?: PlayerStatusInfo | null;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  showDetail?: boolean;
}

export const PlayerStatusBadge: React.FC<PlayerStatusBadgeProps> = ({
  statusInfo,
  size = 'sm',
  className = '',
  showDetail = false,
}) => {
  if (!statusInfo) return null;

  const isSuspension = statusInfo.type === 'suspension';
  const isLesion = statusInfo.type === 'lesion';

  const sizeClasses: Record<string, { badge: string; icon: string }> = {
    xs: {
      badge: 'text-[8.5px] px-1.5 py-0.2 tracking-wider',
      icon: 'w-2.5 h-2.5',
    },
    sm: {
      badge: 'text-[9.5px] px-2 py-0.5 tracking-wider',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'text-[11px] px-2.5 py-0.5 tracking-wide',
      icon: 'w-3.5 h-3.5',
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div
      className={`inline-flex items-center gap-1 font-black uppercase rounded-full shadow-xs whitespace-nowrap select-none shrink-0 transition-all ${
        isSuspension
          ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/80'
          : isLesion
          ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500/80'
          : 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-500/80'
      } ${currentSize.badge} ${className}`}
      title={`${statusInfo.badgeText}: ${statusInfo.reason}${statusInfo.returnEstimate ? ` (${statusInfo.returnEstimate})` : ''}`}
    >
      {isSuspension ? (
        <Ban className={`${currentSize.icon} shrink-0`} />
      ) : isLesion ? (
        <Activity className={`${currentSize.icon} shrink-0`} />
      ) : (
        <AlertCircle className={`${currentSize.icon} shrink-0`} />
      )}
      <span>{statusInfo.badgeText}</span>
      {showDetail && statusInfo.returnEstimate && (
        <span className="opacity-90 font-normal normal-case text-[9px] pl-0.5">
          · {statusInfo.returnEstimate}
        </span>
      )}
    </div>
  );
};
