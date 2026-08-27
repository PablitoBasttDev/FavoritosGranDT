import React, { useState } from 'react';
import { getTeamData, getTeamFallbackBadge } from '../data/teams.js';

interface TeamBadgeProps {
  teamName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  teamName,
  size = 'md',
  className = '',
  showName = false,
}) => {
  const [retryStage, setRetryStage] = useState(0); // 0: original SVG, 1: PNG, 2: dynamic SVG fallback
  const team = getTeamData(teamName);

  const sizeClasses = {
    xs: 'w-5 h-5 min-w-[20px] min-h-[20px]',
    sm: 'w-7 h-7 min-w-[28px] min-h-[28px]',
    md: 'w-9 h-9 min-w-[36px] min-h-[36px]',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px]',
    xl: 'w-16 h-16 min-w-[64px] min-h-[64px]',
  };

  const originalSrc = team?.escudoUrl || team?.badgeUrl || '';
  const pngSrc = originalSrc.endsWith('.svg') ? originalSrc.replace('.svg', '.png') : originalSrc;
  const fallbackSvg = getTeamFallbackBadge(teamName);

  let currentSrc = originalSrc;
  if (retryStage === 1) {
    currentSrc = pngSrc;
  } else if (retryStage >= 2 || !originalSrc) {
    currentSrc = fallbackSvg;
  }

  const handleError = () => {
    setRetryStage((prev) => prev + 1);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
      <div
        className={`relative flex items-center justify-center shrink-0 transition-transform duration-150 ${sizeClasses[size]}`}
      >
        <img
          src={currentSrc}
          alt={`Escudo de ${teamName}`}
          className="w-full h-full object-contain filter drop-shadow-xs"
          onError={handleError}
          loading="eager"
        />
      </div>
      {showName && (
        <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
          {team?.name || teamName}
        </span>
      )}
    </div>
  );
};
