import React, { useState } from 'react';
import { Player } from '../types';
import { TeamBadge } from './TeamBadge';
import { PositionBadge } from './PositionBadge';
import { PlayerTraitsDetail } from './PlayerTraitsDetail';
import { Plus, Check, ArrowUpDown, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface PlayerTableProps {
  players: Player[];
  favoriteIds: Set<number>;
  onToggleFavorite: (player: Player) => void;
  sortBy: 'nombre' | 'precio' | 'promedio' | 'equipo' | 'posicion';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'nombre' | 'precio' | 'promedio' | 'equipo' | 'posicion') => void;
}

export const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  favoriteIds,
  onToggleFavorite,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const [expandedPlayerId, setExpandedPlayerId] = useState<number | null>(null);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="rounded-xl border border-slate-300/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="overflow-x-auto sm:overflow-x-visible">
        <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-[10px] sm:text-[11px] uppercase font-black text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700">
            <tr>
              <th scope="col" className="py-2.5 px-2 sm:px-4">
                <button
                  onClick={() => onSortChange('nombre')}
                  className={`flex items-center gap-1 font-black ${sortBy === 'nombre' ? 'text-[#1b55e2]' : 'hover:text-[#1b55e2]'}`}
                >
                  <span>Jugador</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>
              <th scope="col" className="py-2.5 px-1 sm:px-3 text-center">
                <button
                  onClick={() => onSortChange('posicion')}
                  className={`inline-flex items-center gap-1 font-black ${sortBy === 'posicion' ? 'text-[#1b55e2]' : 'hover:text-[#1b55e2]'}`}
                >
                  <span>Pos</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>
              <th scope="col" className="py-2.5 px-1.5 sm:px-3">
                <button
                  onClick={() => onSortChange('equipo')}
                  className={`flex items-center gap-1 font-black ${sortBy === 'equipo' ? 'text-[#1b55e2]' : 'hover:text-[#1b55e2]'}`}
                >
                  <span>Club</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>
              <th scope="col" className="py-2.5 px-1 sm:px-3 text-center">
                <button
                  onClick={() => onSortChange('promedio')}
                  className={`inline-flex items-center gap-1 font-black mx-auto ${sortBy === 'promedio' ? 'text-amber-600' : 'hover:text-amber-600'}`}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>Prom</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>
              <th scope="col" className="py-2.5 px-1.5 sm:px-4 text-right">
                <button
                  onClick={() => onSortChange('precio')}
                  className={`inline-flex items-center gap-1 font-black ml-auto ${sortBy === 'precio' ? 'text-emerald-700' : 'hover:text-[#1b55e2]'}`}
                >
                  <span>Precio</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>
              <th scope="col" className="py-2.5 px-1.5 sm:px-3 text-center">
                <span className="sr-only sm:not-sr-only">Acción</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {players.map(player => {
              const isFav = favoriteIds.has(player.id);
              const isExpanded = expandedPlayerId === player.id;
              const formattedPromedio =
                typeof player.promedio === 'number' && player.promedio > 0
                  ? player.promedio.toFixed(2)
                  : '-';

              return (
                <React.Fragment key={player.id}>
                  <tr
                    id={`table-row-${player.id}`}
                    onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                    className={`transition-colors cursor-pointer select-none ${
                      isExpanded
                        ? 'bg-blue-50/90 dark:bg-blue-950/40'
                        : isFav
                        ? 'bg-blue-50/60 hover:bg-blue-100/70 dark:bg-blue-950/20 dark:hover:bg-blue-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Name */}
                    <td className="py-2 sm:py-2.5 px-2 sm:px-4 min-w-[120px] sm:min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-slate-400 shrink-0">
                          {isExpanded ? <ChevronUp className="w-3 h-3 text-[#1b55e2]" /> : <ChevronDown className="w-3 h-3" />}
                        </span>
                        <span
                          className="font-black text-slate-950 dark:text-slate-100 text-xs sm:text-[13px] truncate"
                          title={player.nombre}
                        >
                          {player.nombre}
                        </span>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-2 sm:py-2.5 px-1 sm:px-3 text-center shrink-0">
                      <PositionBadge position={player.posicion} size="xs" />
                    </td>

                    {/* Team with Shield */}
                    <td className="py-2 sm:py-2.5 px-1.5 sm:px-3">
                      <div className="flex items-center gap-1.5">
                        <TeamBadge teamName={player.equipo} size="xs" showName={false} />
                        <span className="text-[11px] sm:text-xs text-slate-900 dark:text-slate-300 font-bold truncate max-w-[90px] sm:max-w-none">
                          {player.equipo}
                        </span>
                      </div>
                    </td>

                    {/* Promedio */}
                    <td className="py-2 sm:py-2.5 px-1 sm:px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-black font-mono text-[11px] sm:text-xs ${
                          formattedPromedio !== '-'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {formattedPromedio !== '-' ? `${formattedPromedio}` : '-'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-2 sm:py-2.5 px-1.5 sm:px-4 text-right">
                      <span className="font-mono font-black text-emerald-800 dark:text-emerald-400 text-xs">
                        {formatPrice(player.precioNum)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(player);
                        }}
                        className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-black transition flex items-center gap-1 shadow-xs mx-auto shrink-0 whitespace-nowrap ${
                          isFav
                            ? 'bg-blue-100 text-[#1b55e2] dark:bg-blue-900/60 dark:text-cyan-300 hover:bg-rose-500 hover:text-white border border-blue-200'
                            : 'bg-[#1b55e2] hover:bg-[#1444b8] text-white'
                        }`}
                      >
                        {isFav ? (
                          <>
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span className="hidden sm:inline">En Lista</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            <span className="hidden sm:inline">Sumar</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                      <td colSpan={6} className="p-2 sm:p-3">
                        <PlayerTraitsDetail player={player} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

