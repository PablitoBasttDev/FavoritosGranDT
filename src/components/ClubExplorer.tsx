import React, { useState, useEffect, useMemo } from 'react';
import { TEAMS_DATA, getTeamFallbackBadge } from '../data/teams.js';
import { getDynamicStandings, getTeamMatchInfo } from '../data/standings.js';
import { normalizeText } from '../utils/textUtils.js';
import { TeamBadge } from './TeamBadge.js';
import { ALL_PLAYERS } from '../data/players.js';
import { Shield, Search, ChevronRight, BookmarkCheck, Users, Trophy, Radio, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { FavoritePlayer, Player } from '../types.js';

interface ClubExplorerProps {
  onSelectClub: (clubName: string) => void;
  favorites: FavoritePlayer[];
  players?: Player[];
}

export const ClubExplorer: React.FC<ClubExplorerProps> = ({ onSelectClub, favorites, players: propPlayers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [now, setNow] = useState<Date>(new Date());

  const activePlayers = useMemo(() => {
    return propPlayers && propPlayers.length > 0 ? propPlayers : ALL_PLAYERS;
  }, [propPlayers]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const dynamicStandings = useMemo(() => getDynamicStandings(now), [now]);

  const teamsList = Object.values(TEAMS_DATA);

  const filteredTeams = teamsList.filter(team => {
    if (!searchTerm.trim()) return true;
    const term = normalizeText(searchTerm);
    return (
      normalizeText(team.name).includes(term) ||
      normalizeText(team.shortName).includes(term)
    );
  });

  const getTeamStats = (teamName: string) => {
    const clubPlayers = activePlayers.filter(p => p.equipo.toLowerCase() === teamName.toLowerCase());
    const totalValue = clubPlayers.reduce((sum, p) => sum + p.precioNum, 0);
    const avgPrice = clubPlayers.length > 0 ? totalValue / clubPlayers.length : 0;
    const mostExpensive = clubPlayers.reduce(
      (prev, current) => (prev.precioNum > current.precioNum ? prev : current),
      clubPlayers[0]
    );

    const clubFavorites = favorites.filter(f => f.equipo.toLowerCase() === teamName.toLowerCase());

    return {
      count: clubPlayers.length,
      totalValue,
      avgPrice,
      topPlayer: mostExpensive,
      favoritesCount: clubFavorites.length,
    };
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Official Gran DT Blue Header Banner */}
      <div className="bg-gradient-to-r from-[#07245c] via-[#0e3f9a] to-[#082b6c] text-white rounded-xl shadow-xs p-4 sm:p-5 border border-blue-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-cyan-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                AFA 2026
              </span>
              <span className="text-xs text-blue-200 font-bold uppercase tracking-wide flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                Tabla & Puntos en Vivo
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Los 30 Clubes de Primera División
            </h2>
            <p className="text-blue-100/80 text-xs max-w-xl mt-0.5">
              Planteles completos, posiciones en tiempo real, puntos y zonas actualizadas automáticamente a medida que transcurre la fecha.
            </p>
          </div>

          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar club (ej. River, Boca, Vélez)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-medium shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Clubs Grid: Crisp White Gran DT Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
        {filteredTeams.map(team => {
          const stats = getTeamStats(team.name);
          const badgeSrc = team.escudoUrl || getTeamFallbackBadge(team.name);
          const standing = dynamicStandings[team.name];
          const matchInfo = getTeamMatchInfo(team.name, now);

          return (
            <div
              key={team.name}
              id={`club-card-${team.shortName.toLowerCase().replace(/\s+/g, '-')}`}
              className="relative rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-400 dark:hover:border-[#1b55e2]/50 transition flex flex-col justify-between overflow-hidden group"
              style={{ backgroundColor: team.primaryColor ? `${team.primaryColor}2e` : undefined }}
            >
              {/* Top Accent Color Bar */}
              <div
                className="h-1.5 w-full relative z-10"
                style={{ backgroundColor: team.primaryColor || '#1b55e2' }}
              />

              {/* Watermark Shield in Background */}
              <div
                className="absolute -bottom-5 -right-5 w-40 h-40 sm:w-48 sm:h-48 pointer-events-none select-none z-0 overflow-hidden flex items-end justify-end"
                aria-hidden="true"
              >
                <img
                  src={badgeSrc}
                  alt=""
                  className="w-full h-full object-contain transform rotate-12 origin-bottom-right"
                  style={{ opacity: 0.5 }}
                  loading="lazy"
                />
              </div>

              <div className="p-3.5 space-y-2.5 relative z-10 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
                {/* Shield and Title */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TeamBadge teamName={team.name} size="md" />
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-slate-950 dark:text-slate-100 truncate group-hover:text-[#1b55e2] dark:group-hover:text-cyan-300 transition">
                        {team.name}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {team.shortName} • {stats.count} futbolistas
                      </span>
                    </div>
                  </div>

                  {stats.favoritesCount > 0 && (
                    <span className="bg-blue-100 dark:bg-blue-950 text-[#1b55e2] dark:text-cyan-300 px-2 py-0.5 rounded-full text-[11px] font-black border border-blue-300/80 dark:border-blue-800 shrink-0">
                      {stats.favoritesCount} favs
                    </span>
                  )}
                </div>

                {/* Standings Badge Row (Zona, Posición, Puntos, Estado Fecha) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    standing?.zone === 'Zona A'
                      ? 'bg-blue-100 text-blue-950 dark:bg-blue-950 dark:text-blue-200 border border-blue-300/80 dark:border-blue-800/60'
                      : 'bg-indigo-100 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300/80 dark:border-indigo-800/60'
                  }`}>
                    {standing?.zone || 'AFA'}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200/90 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-0.5">
                    <span>#{standing?.positionZone || standing?.positionGeneral || '-'}º en zona</span>
                    {standing?.positionChangeZone && standing.positionChangeZone > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                        <ArrowUp className="w-2.5 h-2.5" />
                        <span className="text-[9px]">{standing.positionChangeZone}</span>
                      </span>
                    ) : standing?.positionChangeZone && standing.positionChangeZone < 0 ? (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center">
                        <ArrowDown className="w-2.5 h-2.5" />
                        <span className="text-[9px]">{Math.abs(standing.positionChangeZone)}</span>
                      </span>
                    ) : null}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-mono border border-emerald-300/80 dark:border-emerald-800/60">
                    {standing?.points ?? '-'} pts
                  </span>

                  {standing?.isLiveMatch ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-900 flex items-center gap-1 animate-pulse">
                      <Radio className="w-2.5 h-2.5" />
                      <span>{standing.liveMinute || 'En Vivo'}</span>
                    </span>
                  ) : standing?.roundMatchStatus === 'FINISHED' ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700" title={standing.matchScoreInfo}>
                      {standing.matchScoreInfo || `Jugó F${matchInfo?.match.fecha || 7}`}
                    </span>
                  ) : matchInfo ? (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1"
                      title={`Fecha ${matchInfo.match.fecha}: ${matchInfo.role} vs ${matchInfo.rival} (${matchInfo.displayTime})`}
                    >
                      <span>{matchInfo.isHome ? '🏠 Local' : '✈️ Visitante'}</span>
                      <span className="font-mono font-black uppercase">vs {matchInfo.rivalShort}</span>
                    </span>
                  ) : null}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-[#f8fafc]/90 dark:bg-slate-800/80 backdrop-blur-xs p-2 rounded-lg text-xs border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Cotización Top</span>
                    <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-[11px] truncate block">
                      {stats.topPlayer ? `${stats.topPlayer.nombre.split(' ')[0]} (${stats.topPlayer.precio})` : '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Promedio Plantel</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                      {formatMoney(stats.avgPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <button
                onClick={() => onSelectClub(team.name)}
                className="relative z-10 w-full py-2 bg-slate-50/90 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-blue-950 text-[#1b55e2] dark:text-cyan-300 font-extrabold text-xs border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <span>Ver todos los jugadores</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};


