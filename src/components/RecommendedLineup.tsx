import React, { useMemo, useState } from 'react';
import { FavoritePlayer, Position } from '../types.js';
import { getRecommendedLineup, PlayerRecommendation } from '../utils/recommendationEngine.js';
import { TeamBadge } from './TeamBadge.js';
import { PositionBadge } from './PositionBadge.js';
import { Sparkles, Home, Plane, TrendingUp, Info } from 'lucide-react';

interface RecommendedLineupProps {
  favorites: FavoritePlayer[];
}

const SECTIONS: { key: 'arqueros' | 'defensores' | 'mediocampistas' | 'delanteros'; label: string; position: Position }[] = [
  { key: 'arqueros', label: 'Arqueros', position: 'ARQ' },
  { key: 'defensores', label: 'Defensores', position: 'DEF' },
  { key: 'mediocampistas', label: 'Mediocampistas', position: 'VOL' },
  { key: 'delanteros', label: 'Delanteros', position: 'DEL' },
];

const RecommendationCard: React.FC<{ rec: PlayerRecommendation }> = ({ rec }) => {
  const [showReasons, setShowReasons] = useState(false);
  const { player, score, reasons, context } = rec;

  return (
    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <TeamBadge teamName={player.equipo} size="xs" showName={false} />
          <div className="min-w-0">
            <p className="font-black text-xs text-slate-950 dark:text-white truncate leading-tight" title={player.nombre}>
              {player.nombre}
            </p>
            <span className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate block">{player.equipo}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <PositionBadge position={player.posicion} size="xs" />
          <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">
            <TrendingUp className="w-2.5 h-2.5" />
            {score.toFixed(1)} pts
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-2 py-1 border border-slate-200/70 dark:border-slate-700/60">
        {context.isHome ? (
          <Home className="w-3 h-3 text-[#1b55e2] dark:text-cyan-400 shrink-0" />
        ) : (
          <Plane className="w-3 h-3 text-slate-500 shrink-0" />
        )}
        <span className="truncate">
          vs {context.rivalShort || context.rival} ({context.isHome ? 'Local' : 'Visitante'}) · {context.dayOfWeek} {context.displayTime.split('•')[1]?.trim() || ''}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setShowReasons(!showReasons)}
        className="flex items-center gap-1 text-[9.5px] font-bold text-[#1b55e2] dark:text-cyan-400 self-start hover:underline"
      >
        <Info className="w-3 h-3" />
        {showReasons ? 'Ocultar motivos' : `Ver motivos (${reasons.length})`}
      </button>

      {showReasons && (
        <ul className="space-y-0.5 pl-0.5">
          {reasons.map((r, i) => (
            <li key={i} className="text-[9.5px] text-slate-600 dark:text-slate-300 flex gap-1 leading-snug">
              <span className="text-emerald-600 dark:text-emerald-400 shrink-0">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const RecommendedLineup: React.FC<RecommendedLineupProps> = ({ favorites }) => {
  const lineup = useMemo(() => getRecommendedLineup(favorites), [favorites]);
  const listsByKey = {
    arqueros: lineup.arqueros,
    defensores: lineup.defensores,
    mediocampistas: lineup.mediocampistas,
    delanteros: lineup.delanteros,
  };

  const totalRecommended =
    lineup.arqueros.length + lineup.defensores.length + lineup.mediocampistas.length + lineup.delanteros.length;

  if (favorites.length === 0) {
    return (
      <div className="p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
        <Sparkles className="w-7 h-7 mx-auto text-amber-500" />
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Agregá futbolistas a tus favoritos para ver acá tu once ideal recomendado para la próxima fecha.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <Sparkles className="w-4.5 h-4.5" />
        </div>
        <div>
          <h3 className="font-black text-sm text-slate-950 dark:text-white">
            Once Ideal de tus Favoritos {lineup.roundNumber ? `· Fecha ${lineup.roundNumber}` : ''}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Elegidos entre tus {favorites.length} favoritos según su nivel, racha, y el partido que les toca (rival, local/visitante y forma reciente).
          </p>
        </div>
      </div>

      {totalRecommended === 0 && (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
          Ninguno de tus favoritos tiene un partido confirmado para la próxima fecha, o todos están suspendidos/lesionados.
        </div>
      )}

      {SECTIONS.map(section => {
        const list = listsByKey[section.key];
        return (
          <div key={section.key} className="space-y-2">
            <div className="flex items-center gap-2">
              <PositionBadge position={section.position} size="sm" />
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {section.label} ({list.length})
              </span>
            </div>

            {list.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {list.map(rec => (
                  <RecommendationCard key={rec.player.id} rec={rec} />
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 italic px-1">
                No tenés favoritos disponibles en esta posición para la próxima fecha.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
