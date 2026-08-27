import React from 'react';
import { Position } from '../types.js';

interface PositionBadgeProps {
  position: Position | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showFullText?: boolean;
}

export const PositionBadge: React.FC<PositionBadgeProps> = ({
  position,
  size = 'md',
  className = '',
  showFullText = false,
}) => {
  const getStyle = () => {
    switch (position) {
      case 'ARQ':
        return {
          bg: 'bg-amber-400 text-amber-950 border-amber-500/60 shadow-xs',
          label: 'Arquero',
          dot: 'bg-amber-900',
        };
      case 'DEF':
        return {
          bg: 'bg-blue-600 text-white border-blue-700 shadow-xs',
          label: 'Defensor',
          dot: 'bg-white',
        };
      case 'VOL':
        return {
          bg: 'bg-emerald-600 text-white border-emerald-700 shadow-xs',
          label: 'Volante',
          dot: 'bg-white',
        };
      case 'DEL':
        return {
          bg: 'bg-rose-600 text-white border-rose-700 shadow-xs',
          label: 'Delantero',
          dot: 'bg-white',
        };
      default:
        return {
          bg: 'bg-slate-500 text-white border-slate-600 shadow-xs',
          label: position,
          dot: 'bg-white',
        };
    }
  };

  const current = getStyle();

  const sizeClasses: Record<string, string> = {
    xs: 'text-[9.5px] px-1.5 py-0.5 font-black tracking-wider rounded',
    sm: 'text-[10px] px-2 py-0.5 font-black tracking-wider rounded-md',
    md: 'text-xs px-2.5 py-1 font-black tracking-wider rounded-lg',
    lg: 'text-sm px-3.5 py-1.5 font-black tracking-widest rounded-xl',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border uppercase font-mono ${current.bg} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0 opacity-80`}></span>
      <span>{showFullText ? current.label : position}</span>
    </span>
  );
};
