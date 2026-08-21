import React from 'react';
import { Player } from '../types';
import { TeamBadge } from './TeamBadge';
import { PositionBadge } from './PositionBadge';
import { Plus, Check, X, TrendingUp } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isFavorite: boolean;
  onToggleFavorite: (player: Player) => void;
  compact?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isFavorite,
  onToggleFavorite,
  compact = false,
}) => {
  // Format currency
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(player.precioNum);

  const formattedPromedio =
    typeof player.promedio === 'number' && player.promedio > 0
      ? player.promedio.toFixed(2)
      : '-';

  if (compact) {
    return (
      <div
        id={`player-compact-${player.id}`}
        className={`flex items-center justify-between p-2 rounded-xl border transition ${
          isFavorite
            ? 'bg-blue-50/95 border-[#1b55e2] ring-1 ring-[#1b55e2] dark:bg-blue-950/40 dark:border-blue-700 shadow-xs'
            : 'bg-white dark:bg-slate-900 border-slate-300/90 dark:border-slate-800 hover:border-slate-400 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <TeamBadge teamName={player.equipo} size="xs" />
          <div className="min-w-0">
            <p className="font-black text-xs text-slate-950 dark:text-slate-100 truncate">
              {player.nombre}
            </p>
            <div className="flex items-center gap-2 text-[11px] mt-0.5 flex-wrap">
              <PositionBadge position={player.posicion} size="sm" />
              <span className="font-mono text-emerald-800 dark:text-emerald-400 font-black">
                {formattedPrice}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black text-[10px] flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />
                {formattedPromedio} pts
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleFavorite(player)}
          className={`p-1.5 rounded-lg text-xs font-black transition ${
            isFavorite
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white border border-rose-200 dark:border-rose-800'
              : 'bg-[#1b55e2] text-white hover:bg-[#1444b8]'
          }`}
        >
          {isFavorite ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div
      id={`player-card-${player.id}`}
      className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition hover:shadow-md ${
        isFavorite
          ? 'bg-blue-50/80 border-[#1b55e2] dark:bg-blue-950/30 dark:border-blue-700 ring-1 ring-[#1b55e2] shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-300/90 dark:border-slate-800 hover:border-slate-400 shadow-xs'
      }`}
    >
      {/* Top row: Team badge, Name, Position */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamBadge teamName={player.equipo} size="sm" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block truncate">
                {player.equipo}
              </span>
              <h3 className="font-black text-slate-950 dark:text-slate-100 text-xs sm:text-sm leading-snug truncate group-hover:text-[#1b55e2] transition-colors">
                {player.nombre}
              </h3>
            </div>
          </div>

          <PositionBadge position={player.posicion} size="sm" />
        </div>
      </div>

      {/* Bottom row: Price, Promedio & Favorite Toggle Action */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-800 mt-2 gap-2">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[9px] uppercase font-black text-slate-500 dark:text-slate-400 block tracking-wider">
              Cotización
            </span>
            <span className="text-sm font-black font-mono tracking-tight text-emerald-800 dark:text-emerald-400">
              {formattedPrice}
            </span>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
            <span className="text-[9px] uppercase font-black text-amber-700 dark:text-amber-400 block tracking-wider flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> Promedio
            </span>
            <span className="text-sm font-black font-mono tracking-tight text-amber-800 dark:text-amber-300">
              {formattedPromedio} <span className="text-[10px] font-normal">pts</span>
            </span>
          </div>
        </div>

        <button
          id={`btn-fav-toggle-${player.id}`}
          onClick={() => onToggleFavorite(player)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition active:scale-95 flex items-center gap-1 shadow-xs shrink-0 ${
            isFavorite
              ? 'bg-blue-100 text-[#1b55e2] dark:bg-blue-900/60 dark:text-cyan-300 hover:bg-rose-500 hover:text-white border border-blue-300 dark:border-blue-700'
              : 'bg-[#1b55e2] hover:bg-[#1444b8] text-white'
          }`}
        >
          {isFavorite ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>En Lista</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>+ Sumar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

