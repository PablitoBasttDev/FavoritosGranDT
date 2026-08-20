import React from 'react';
import { Player } from '../types';
import { TeamBadge } from './TeamBadge';
import { PositionBadge } from './PositionBadge';
import { Plus, Star, Check, ArrowUpDown, X } from 'lucide-react';

interface PlayerTableProps {
  players: Player[];
  favoriteIds: Set<number>;
  starredIds?: Set<number>;
  onToggleFavorite: (player: Player) => void;
  onToggleStar?: (playerId: number) => void;
  sortBy: 'nombre' | 'precio' | 'equipo' | 'posicion';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'nombre' | 'precio' | 'equipo' | 'posicion') => void;
}

export const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  favoriteIds,
  starredIds,
  onToggleFavorite,
  onToggleStar,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-[#f8fafc] dark:bg-slate-800/80 text-[11px] uppercase font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th scope="col" className="py-3 px-4 sm:px-5">
                <button
                  onClick={() => onSortChange('nombre')}
                  className="flex items-center gap-1.5 hover:text-[#1b55e2] font-black"
                >
                  <span>Jugador</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </th>
              <th scope="col" className="py-3 px-4">
                <button
                  onClick={() => onSortChange('posicion')}
                  className="flex items-center gap-1.5 hover:text-[#1b55e2] font-black"
                >
                  <span>Posición</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </th>
              <th scope="col" className="py-3 px-4">
                <button
                  onClick={() => onSortChange('equipo')}
                  className="flex items-center gap-1.5 hover:text-[#1b55e2] font-black"
                >
                  <span>Equipo / Escudo</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </th>
              <th scope="col" className="py-3 px-4 sm:px-5 text-right">
                <button
                  onClick={() => onSortChange('precio')}
                  className="inline-flex items-center gap-1.5 hover:text-[#1b55e2] font-black ml-auto"
                >
                  <span>Cotización</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </th>
              <th scope="col" className="py-3 px-4 text-center">
                <span>Acción</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {players.map(player => {
              const isFav = favoriteIds.has(player.id);
              const isStar = starredIds?.has(player.id);

              return (
                <tr
                  key={player.id}
                  id={`table-row-${player.id}`}
                  className={`transition-colors ${
                    isFav
                      ? 'bg-blue-50/70 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'
                      : 'hover:bg-[#f8fafc] dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Name */}
                  <td className="py-2.5 px-4 sm:px-5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        {player.nombre}
                      </span>
                      {isStar && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      )}
                    </div>
                  </td>

                  {/* Position */}
                  <td className="py-2.5 px-4">
                    <PositionBadge position={player.posicion} size="sm" />
                  </td>

                  {/* Team with Shield */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <TeamBadge teamName={player.equipo} size="xs" />
                      <span className="text-xs text-slate-800 dark:text-slate-300 font-bold">
                        {player.equipo}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 px-4 sm:px-5 text-right">
                    <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                      {formatPrice(player.precioNum)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {isFav && onToggleStar && (
                        <button
                          onClick={() => onToggleStar(player.id)}
                          className={`p-1.5 rounded-lg transition ${
                            isStar
                              ? 'text-amber-500 font-black'
                              : 'text-slate-300 hover:text-amber-500'
                          }`}
                          title={isStar ? 'Destacado' : 'Marcar destacado'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isStar ? 'fill-current' : ''}`} />
                        </button>
                      )}

                      <button
                        onClick={() => onToggleFavorite(player)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 shadow-xs ${
                          isFav
                            ? 'bg-blue-100 text-[#1b55e2] dark:bg-blue-900/60 dark:text-cyan-300 hover:bg-rose-500 hover:text-white border border-blue-200'
                            : 'bg-[#1b55e2] hover:bg-[#1444b8] text-white'
                        }`}
                      >
                        {isFav ? (
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
