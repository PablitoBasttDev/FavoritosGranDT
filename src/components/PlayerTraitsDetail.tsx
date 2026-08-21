import React from 'react';
import { Player } from '../types';
import { getPlayerTraits } from '../utils/playerTraits';
import { Sparkles, Calendar } from 'lucide-react';

interface PlayerTraitsDetailProps {
  player: Player;
  onClose?: () => void;
  compact?: boolean;
}

export const PlayerTraitsDetail: React.FC<PlayerTraitsDetailProps> = ({
  player,
}) => {
  const traits = getPlayerTraits(player);

  // Get fixture history
  const fechasEntries = Object.entries(player.fechasPuntajes || {})
    .map(([key, val]) => ({
      fecha: key,
      num: parseInt(key.replace('F', ''), 10),
      pts: val,
    }))
    .filter(f => f.pts !== undefined && f.pts !== '')
    .sort((a, b) => a.num - b.num);

  return (
    <div className="p-1.5 rounded-lg bg-slate-50/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 text-xs w-full flex flex-col gap-1.5 select-none">
      {/* Traits Section */}
      <div>
        <div className="flex items-center gap-1 mb-1 leading-none">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Características
          </span>
        </div>

        {traits.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {traits.map(t => (
              <span
                key={t.id}
                title={t.description}
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9.5px] font-bold leading-none shadow-2xs ${t.bgClass} ${t.colorClass} ${t.borderClass}`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[9.5px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700/60 leading-none">
            <span>📊</span>
            <span>Sin rasgos extremos</span>
          </div>
        )}
      </div>

      {/* Puntajes por fecha Section */}
      <div>
        <div className="flex items-center gap-1 mb-1 leading-none">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Puntajes por fecha
          </span>
        </div>

        {fechasEntries.length > 0 ? (
          <div className="flex flex-wrap gap-0.5">
            {fechasEntries.map(f => {
              const isNum = !isNaN(Number(f.pts));
              const numPts = Number(f.pts);
              const isHigh = isNum && numPts >= 8;
              const isLow = isNum && numPts <= 3 && numPts > 0;

              return (
                <div
                  key={f.fecha}
                  className={`flex flex-col items-center justify-center px-1 py-0.5 rounded border text-[9px] min-w-[24px] leading-none ${
                    isHigh
                      ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-black'
                      : isLow
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold'
                  }`}
                >
                  <span className="text-[7.5px] text-slate-400 uppercase">{f.fecha}</span>
                  <span className="font-mono font-black mt-0.5">{f.pts}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-[9.5px] text-slate-400 italic block leading-none">Sin partidos disputados</span>
        )}
      </div>
    </div>
  );
};


