import React, { useState, useEffect, useMemo } from 'react';
import { ALL_PLAYERS } from '../data/players';
import { TEAMS_DATA } from '../data/teams';
import { getDynamicStandings, TeamStanding } from '../data/standings';
import {
  getDynamicTopScorers,
  getDynamicRoundIncidents,
  getTeamsPerformanceMetrics,
  getDynamicGoalkeeperDefenseStats,
  getDynamicClubDefenseStats,
  ScorerStat,
  GoalkeeperDefenseStat,
  ClubDefenseStat,
} from '../data/tournamentStats';
import { TeamBadge } from './TeamBadge';
import { PositionBadge } from './PositionBadge';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import { getActiveRoundLabel, subscribeToLiveSheet } from '../services/sheetsService';
import { normalizeText } from '../utils/textUtils';
import {
  Trophy,
  Table,
  Flame,
  Shield,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Radio,
  CheckCircle2,
  Search,
  Award,
  Filter,
  FileSpreadsheet,
  Info,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Player } from '../types';

interface StatsDashboardProps {
  players?: Player[];
  onSelectPlayer?: (player: Player) => void;
  onSelectClub?: (club: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  players,
  onSelectPlayer,
  onSelectClub,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [standingsZone, setStandingsZone] = useState<'Zona A' | 'Zona B' | 'GENERAL'>('Zona A');
  const [activeTab, setActiveTab] = useState<'POSICIONES' | 'GOLEADORES' | 'ATAQUE_DEFENSA'>('POSICIONES');
  const [onlyPlayedFilter, setOnlyPlayedFilter] = useState<boolean>(false);
  const [scorerSearch, setScorerSearch] = useState<string>('');
  const [defenseSubTab, setDefenseSubTab] = useState<'CLUBES' | 'ARQUEROS'>('CLUBES');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [roundLabelState, setRoundLabelState] = useState<string>(() => getActiveRoundLabel());
  const [lastAutoSyncTime, setLastAutoSyncTime] = useState<Date>(new Date());

  // Actualización automática cada 2 segundos a medida que transcurre el tiempo/fecha
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Escucha activa de sincronizaciones automáticas en segundo plano
  useEffect(() => {
    const unsubscribe = subscribeToLiveSheet(result => {
      if (result.detectedRound) {
        setRoundLabelState(result.detectedRound);
      }
      setLastAutoSyncTime(new Date());
      setNow(new Date());
    });
    return () => unsubscribe();
  }, []);

  // Cálculos dinámicos reactivos extraídos de las fuentes oficiales
  const dynamicStandings = useMemo(() => getDynamicStandings(now), [now]);
  const topScorers = useMemo(() => getDynamicTopScorers(now), [now, players]);
  const roundIncidents = useMemo(() => getDynamicRoundIncidents(now), [now]);
  const teamMetrics = useMemo(() => getTeamsPerformanceMetrics(now), [now]);
  const clubDefenseStats = useMemo(() => getDynamicClubDefenseStats(now), [now]);
  const goalkeeperStats = useMemo(() => getDynamicGoalkeeperDefenseStats(now, players), [now, players]);

  // Filtrado y ordenamiento de equipos
  const displayedTeams = useMemo(() => {
    let list: TeamStanding[] = Object.values(dynamicStandings);

    if (standingsZone !== 'GENERAL') {
      list = list.filter(t => t.zone === standingsZone);
    }

    if (onlyPlayedFilter) {
      list = list.filter(t => t.roundMatchStatus === 'FINISHED' || t.roundMatchStatus === 'LIVE');
    }

    return list.sort((a, b) => {
      if (standingsZone === 'GENERAL') {
        return a.positionGeneral - b.positionGeneral;
      }
      return a.positionZone - b.positionZone;
    });
  }, [dynamicStandings, standingsZone, onlyPlayedFilter]);

  // Filtrado de goleadores por búsqueda
  const filteredScorers = useMemo(() => {
    if (!scorerSearch.trim()) return topScorers;
    const term = normalizeText(scorerSearch);
    return topScorers.filter(
      s => normalizeText(s.playerName).includes(term) || normalizeText(s.team).includes(term)
    );
  }, [topScorers, scorerSearch]);

  const topScorerLeader = topScorers[0];
  const bestDefenseClub = clubDefenseStats[0];
  const bestGoalkeeper = goalkeeperStats[0];

  const handleSyncSuccess = () => {
    setRoundLabelState(getActiveRoundLabel());
    setLastAutoSyncTime(new Date());
    setNow(new Date());
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Modal de sincronización / configuración opcional */}
      <GoogleSheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncSuccess={handleSyncSuccess}
      />

      {/* Official Gran DT Blue Header Banner */}
      <div className="bg-gradient-to-r from-[#07245c] via-[#0e3f9a] to-[#082b6c] text-white rounded-xl shadow-xs p-4 sm:p-5 border border-blue-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-cyan-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                Datos Oficiales AFA & Gran DT
              </span>
              <span className="text-xs text-blue-200 font-bold uppercase tracking-wide flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                Actualización Continua Automática
              </span>
              <span className="bg-white/10 text-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
                {roundLabelState}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Centro de Estadísticas, Posiciones & Goleadores
            </h2>
            <p className="text-blue-100/80 text-xs max-w-xl mt-0.5">
              Goles, vallas menos vencidas (fechas sin recibir goles), arqueros y tabla de posiciones del Torneo Clausura 2026.
            </p>
          </div>

          {/* Automatic Live Sync Status Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 sm:p-2.5 border border-white/15 flex items-center gap-2.5">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-300 font-black uppercase tracking-wider block">
                    Auto-Sincronizado
                  </span>
                  <button
                    onClick={() => setIsSyncModalOpen(true)}
                    className="text-blue-200 hover:text-white transition opacity-75 hover:opacity-100"
                    title="Configuración de fuente de datos Google Sheets"
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[11px] font-bold text-white block">
                  Planeta Gran DT en Vivo
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/15 flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-blue-200 font-bold uppercase block">
                  Fecha 6 en Disputa
                </span>
                <span className="text-xs font-black text-white font-mono">
                  {teamMetrics.finishedMatches + teamMetrics.liveMatches} / {teamMetrics.totalMatches} Partidos
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center">
                <Flame className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-blue-800/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('POSICIONES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'POSICIONES'
                ? 'bg-cyan-400 text-slate-950 shadow-xs'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabla de Posiciones en Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab('GOLEADORES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'GOLEADORES'
                ? 'bg-cyan-400 text-slate-950 shadow-xs'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Tabla de Goleadores ({topScorers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ATAQUE_DEFENSA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ATAQUE_DEFENSA'
                ? 'bg-cyan-400 text-slate-950 shadow-xs'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Vallas Menos Vencidas (Fechas sin Recibir Goles)</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase block tracking-wider">
            Goles en la Fecha 6
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-100 mt-0.5 font-mono">
            {teamMetrics.totalRoundGoals}
          </p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {teamMetrics.averageGoalsPerMatch} promedio / partido
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase block tracking-wider">
            Partidos Disputados / En Juego
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-100 mt-0.5 font-mono">
            {teamMetrics.finishedMatches + teamMetrics.liveMatches}
            <span className="text-sm font-normal text-slate-400 ml-1">/ {teamMetrics.totalMatches}</span>
          </p>
          <span className="text-[11px] text-[#1b55e2] dark:text-cyan-400 font-extrabold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {teamMetrics.totalMatches - (teamMetrics.finishedMatches + teamMetrics.liveMatches)} pendientes
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase block tracking-wider">
            Máximo Goleador Oficial
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-950 dark:text-slate-100 mt-0.5 truncate">
            {topScorerLeader?.playerName || 'Agustín Módica'}
          </p>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            {topScorerLeader?.totalGoals || 5} goles ({topScorerLeader?.team})
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase block tracking-wider">
            Más Fechas con Valla Invicta
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-950 dark:text-slate-100 mt-0.5 truncate">
            {bestDefenseClub?.teamName || 'Atlético Tucumán'}
          </p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-600" />
            {bestDefenseClub?.cleanSheetsTotal || 4} Fechas sin recibir goles ({bestDefenseClub?.cleanSheetRate || 80}%)
          </span>
        </div>
      </div>

      {/* TAB 1: POSICIONES EN VIVO */}
      {activeTab === 'POSICIONES' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-[#1b55e2] dark:text-cyan-400" />
                <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 dark:text-slate-100">
                  Tabla Oficial de Posiciones en Vivo - Clausura 2026
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Los puntos, partidos jugados y posiciones se recalculan automáticamente con los resultados de la Fecha 6.
              </p>
            </div>

            {/* Controls: Zone Selector & Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
                <button
                  onClick={() => setStandingsZone('Zona A')}
                  className={`px-3 py-1 rounded-md text-xs font-black transition ${
                    standingsZone === 'Zona A'
                      ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                      : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
                  }`}
                >
                  Zona A (15)
                </button>
                <button
                  onClick={() => setStandingsZone('Zona B')}
                  className={`px-3 py-1 rounded-md text-xs font-black transition ${
                    standingsZone === 'Zona B'
                      ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                      : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
                  }`}
                >
                  Zona B (15)
                </button>
                <button
                  onClick={() => setStandingsZone('GENERAL')}
                  className={`px-3 py-1 rounded-md text-xs font-black transition ${
                    standingsZone === 'GENERAL'
                      ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                      : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
                  }`}
                >
                  General (30)
                </button>
              </div>

              <button
                onClick={() => setOnlyPlayedFilter(!onlyPlayedFilter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 border ${
                  onlyPlayedFilter
                    ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800'
                    : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span>Jugaron Fecha 6</span>
              </button>
            </div>
          </div>

          {/* Standings Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-black bg-slate-100 dark:bg-slate-800/60 select-none">
                  <th className="py-2.5 px-2 text-center w-16 min-w-[64px]">Pos</th>
                  <th className="py-2.5 px-3 min-w-[160px]">Club</th>
                  {standingsZone === 'GENERAL' && <th className="py-2.5 px-2 text-center w-16">Zona</th>}
                  <th className="py-2.5 px-2 text-center w-36 min-w-[130px]">Estado F6</th>
                  <th className="py-2.5 px-2 text-center w-18 min-w-[68px] font-black text-slate-900 dark:text-slate-100 bg-blue-100/60 dark:bg-blue-900/30">
                    PTS
                  </th>
                  <th className="py-2.5 px-1.5 text-center w-10">PJ</th>
                  <th className="py-2.5 px-1.5 text-center w-10">PG</th>
                  <th className="py-2.5 px-1.5 text-center w-10">PE</th>
                  <th className="py-2.5 px-1.5 text-center w-10">PP</th>
                  <th className="py-2.5 px-1.5 text-center w-10">GF</th>
                  <th className="py-2.5 px-1.5 text-center w-10">GC</th>
                  <th className="py-2.5 px-2 text-center w-12 font-black">DIF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {displayedTeams.map((team, idx) => {
                  const pos = standingsZone === 'GENERAL' ? team.positionGeneral : team.positionZone;
                  const change =
                    standingsZone === 'GENERAL'
                      ? team.positionChangeGeneral
                      : team.positionChangeZone;

                  const isQualifiedZone = standingsZone !== 'GENERAL' && pos <= 4;
                  const isTop8Zone = standingsZone !== 'GENERAL' && pos > 4 && pos <= 8;

                  return (
                    <tr
                      key={team.teamName}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer group ${
                        team.isLiveMatch
                          ? 'bg-rose-50/40 dark:bg-rose-950/20'
                          : isQualifiedZone
                          ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                          : ''
                      }`}
                      onClick={() => onSelectClub?.(team.teamName)}
                      title={`Ver estadísticas de ${team.teamName}`}
                    >
                      {/* Position & Variation (Perfect Centered Alignment) */}
                      <td className="py-2 px-2 text-center font-mono font-black text-xs">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                              isQualifiedZone
                                ? 'bg-emerald-600 text-white font-black'
                                : isTop8Zone
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {pos}
                          </span>

                          <span className="w-5 flex items-center justify-start text-left shrink-0">
                            {change !== undefined && change !== 0 ? (
                              <span
                                className={`flex items-center text-[9px] font-black ${
                                  change > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                                title={change > 0 ? `Subió ${change} puestos` : `Bajó ${Math.abs(change)} puestos`}
                              >
                                {change > 0 ? (
                                  <ArrowUp className="w-2.5 h-2.5 shrink-0" />
                                ) : (
                                  <ArrowDown className="w-2.5 h-2.5 shrink-0" />
                                )}
                                <span>{Math.abs(change)}</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700 text-[10px] pl-1 select-none">
                                -
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Club Name & Badge */}
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <TeamBadge teamName={team.teamName} size="xs" showName={false} />
                          <span className="truncate group-hover:text-[#1b55e2] dark:group-hover:text-cyan-300 transition">
                            {team.teamName}
                          </span>
                        </div>
                      </td>

                      {standingsZone === 'GENERAL' && (
                        <td className="py-2 px-2 text-center">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                            {team.zone}
                          </span>
                        </td>
                      )}

                      {/* Match Status in Round */}
                      <td className="py-2 px-2 text-center">
                        {team.isLiveMatch ? (
                          <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse">
                            <Radio className="w-2.5 h-2.5" />
                            <span>{team.liveMinute || 'En Vivo'}</span>
                            <span className="font-mono ml-0.5">({team.matchScoreInfo})</span>
                          </span>
                        ) : team.roundMatchStatus === 'FINISHED' ? (
                          <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <span>Fin</span>
                            <span className="font-mono text-[10px] font-semibold text-slate-500">
                              {team.matchScoreInfo}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Por jugar
                          </span>
                        )}
                      </td>

                      {/* Points with Gained Indicator (Stable Centered Layout) */}
                      <td className="py-2 px-2 text-center font-mono font-black text-[#1b55e2] dark:text-cyan-400 bg-blue-50/50 dark:bg-blue-950/20">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-sm w-5 text-right font-black">{team.points}</span>
                          <span className="w-5 flex items-center justify-start text-left shrink-0">
                            {team.pointsGainedInRound !== undefined && team.pointsGainedInRound > 0 ? (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black">
                                +{team.pointsGainedInRound}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </td>

                      <td className="py-2 px-1.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{team.played}</td>
                      <td className="py-2 px-1.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{team.won}</td>
                      <td className="py-2 px-1.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{team.drawn}</td>
                      <td className="py-2 px-1.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{team.lost}</td>
                      <td className="py-2 px-1.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{team.goalsFor}</td>
                      <td className="py-2 px-1.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{team.goalsAgainst}</td>
                      <td
                        className={`py-2 px-2 text-center font-mono font-black ${
                          team.goalDiff > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : team.goalDiff < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 gap-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Puestos 1º al 4º: Clasifican a Cuartos de Final con ventaja deportiva
            </span>
            <span className="text-right">
              * Clasifican a Octavos de Final los primeros 8 de cada zona.
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: TABLA DE GOLEADORES EN VIVO */}
      {activeTab === 'GOLEADORES' && (
        <div className="space-y-3">
          {/* Official Puntajes Clarification Notice */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase text-[10px] tracking-wider block text-amber-800 dark:text-amber-300">
                Aclaración sobre Puntajes Gran DT
              </span>
              <p className="mt-0.5 leading-relaxed">
                Los puntajes oficiales de Gran DT acumulados en la tabla corresponden <strong>hasta la Fecha 5</strong>. Los goles y penales ya contemplan la <strong>Fecha 6 en vivo</strong>, mientras que los puntajes finales de la Fecha 6 se consolidarán automáticamente una vez que Planeta Gran DT publique el cierre oficial de la fecha.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main Top Scorers Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 dark:text-slate-100">
                      Tabla Oficial de Goleadores - Torneo Clausura 2026
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Goles totales (F1 a F5 + F6 en vivo) con puntajes Gran DT consolidados a la Fecha 5.
                  </p>
                </div>

                {/* Scorer Search Input */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={scorerSearch}
                    onChange={e => setScorerSearch(e.target.value)}
                    placeholder="Buscar goleador o club..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1b55e2]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                    <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-black">
                      <th className="py-2 px-2 text-center w-8">#</th>
                      <th className="py-2 px-2">Jugador</th>
                      <th className="py-2 px-2">Club</th>
                      <th className="py-2 px-2 text-center">Goles F6</th>
                      <th className="py-2 px-2 text-center font-black text-slate-900 dark:text-slate-200">
                        Goles Totales
                      </th>
                      <th className="py-2 px-2 text-center">Penales</th>
                      <th className="py-2 px-2 text-center bg-blue-50/60 dark:bg-blue-950/40 text-[#1b55e2] dark:text-cyan-300">
                        Pts Gran DT (Hasta F5)
                      </th>
                      <th className="py-2 px-2 text-right">Cotización</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredScorers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                          No se encontraron goleadores que coincidan con "{scorerSearch}".
                        </td>
                      </tr>
                    ) : (
                      filteredScorers.map((scorer, idx) => (
                        <tr
                          key={scorer.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer group"
                          onClick={() => scorer.playerObj && onSelectPlayer?.(scorer.playerObj)}
                          title={`Ver estadísticas de ${scorer.playerName}`}
                        >
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2 font-bold text-slate-900 dark:text-slate-100">
                            <div className="flex items-center gap-1.5">
                              <PositionBadge position={scorer.posicion} size="xs" />
                              <span className="group-hover:text-[#1b55e2] dark:group-hover:text-cyan-300 transition">
                                {scorer.playerName}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <TeamBadge teamName={scorer.team} size="xs" showName={false} />
                              <span className="truncate max-w-[130px]">{scorer.team}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            {scorer.roundGoals > 0 ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-mono font-black text-[10px] border border-amber-300 dark:border-amber-800">
                                +{scorer.roundGoals}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-black text-amber-600 dark:text-amber-400 text-sm bg-amber-50/50 dark:bg-amber-950/20">
                            {scorer.totalGoals}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-slate-500">
                            {scorer.penalties > 0 ? scorer.penalties : '-'}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-black text-[#1b55e2] dark:text-cyan-400 bg-blue-50/30 dark:bg-blue-950/20">
                            {scorer.puntosTotales} pts
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-black text-emerald-700 dark:text-emerald-400">
                            {scorer.precio}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Incidents & Timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Goles e Incidencias en Vivo
                  </h3>
                </div>
                <span className="text-[10px] text-blue-600 font-bold uppercase">Fecha 6</span>
              </div>

              <div className="space-y-2 max-h-[580px] overflow-y-auto">
                {roundIncidents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No hay goles o incidencias registradas aún en esta fecha.
                  </p>
                ) : (
                  roundIncidents.map(inc => (
                    <div
                      key={inc.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-cyan-300 font-mono font-black text-[10px] shrink-0">
                          {inc.minute}'
                        </span>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 dark:text-slate-100 block truncate">
                            {inc.type === 'goal'
                              ? '⚽ Gol: '
                              : inc.type === 'red_card'
                              ? '🟥 Expulsión: '
                              : '⚽ Gol de penal: '}
                            {inc.playerName}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {inc.team} vs {inc.rival} {inc.detail ? `(${inc.detail})` : ''}
                          </span>
                        </div>
                      </div>
                      <TeamBadge teamName={inc.team} size="xs" showName={false} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOLIDEZ DEFENSIVA & VALLAS MENOS VENCIDAS (FECHAS SIN RECIBIR GOLES) */}
      {activeTab === 'ATAQUE_DEFENSA' && (
        <div className="space-y-3">
          {/* Subheader Switch: Fechas sin Recibir Goles por Club vs Arqueros con Valla Invicta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 p-3 shadow-xs gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 dark:text-slate-100">
                  Vallas Menos Vencidas (Fechas sin Recibir Goles)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Métrica principal destacada: <strong>Fechas / Partidos con Valla Invicta (Arco en Cero)</strong> en el Torneo Clausura 2026.
              </p>
            </div>

            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setDefenseSubTab('CLUBES')}
                className={`px-3 py-1.5 rounded-md text-xs font-black transition ${
                  defenseSubTab === 'CLUBES'
                    ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
                }`}
              >
                Fechas sin Recibir Goles por Club ({clubDefenseStats.length})
              </button>
              <button
                onClick={() => setDefenseSubTab('ARQUEROS')}
                className={`px-3 py-1.5 rounded-md text-xs font-black transition ${
                  defenseSubTab === 'ARQUEROS'
                    ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
                }`}
              >
                Arqueros con Valla Invicta ({goalkeeperStats.length})
              </button>
            </div>
          </div>

          {/* VIEW 1: FECHAS SIN RECIBIR GOLES POR CLUB */}
          {defenseSubTab === 'CLUBES' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 dark:text-slate-100">
                    Ranking de Clubes: Fechas sin Recibir Goles (Vallas Invictas)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ordenado por cantidad de fechas con arco en 0, porcentaje de efectividad defensiva y menos goles recibidos.
                  </p>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                  30 Clubes de Primera
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-black bg-slate-100 dark:bg-slate-800/40">
                      <th className="py-2 px-2 text-center w-10">#</th>
                      <th className="py-2 px-2">Club</th>
                      <th className="py-2 px-2 text-center">Zona</th>
                      <th className="py-2 px-2 text-center font-black bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-x border-emerald-300 dark:border-emerald-800">
                        Fechas sin Recibir Goles
                      </th>
                      <th className="py-2 px-2 text-center">% Arco en Cero</th>
                      <th className="py-2 px-2 text-center">PJ</th>
                      <th className="py-2 px-2 text-center">GC (Recibidos)</th>
                      <th className="py-2 px-2 text-center">Promedio GC/PJ</th>
                      <th className="py-2 px-2 text-center">GF</th>
                      <th className="py-2 px-2 text-center">DIF</th>
                      <th className="py-2 px-2 text-center">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {clubDefenseStats.map((team, idx) => (
                      <tr
                        key={team.teamName}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer group"
                        onClick={() => onSelectClub?.(team.teamName)}
                        title={`Ver plantel y estadísticas de ${team.teamName}`}
                      >
                        <td className="py-2 px-2 text-center font-mono font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <TeamBadge teamName={team.teamName} size="xs" showName={false} />
                            <div className="min-w-0">
                              <span className="truncate group-hover:text-[#1b55e2] dark:group-hover:text-cyan-300 transition block">
                                {team.teamName}
                              </span>
                              {team.topGoalkeeperName && (
                                <span className="text-[10px] font-normal text-slate-500 block truncate">
                                  Arq: {team.topGoalkeeperName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                            {team.zone}
                          </span>
                        </td>

                        {/* Fechas sin recibir goles - Estadística Principal */}
                        <td className="py-2 px-2 text-center font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border-x border-emerald-200 dark:border-emerald-900/60">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-black">{team.cleanSheetsTotal}</span>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                              {team.cleanSheetsTotal === 1 ? 'fecha' : 'fechas'}
                            </span>
                            {team.roundCleanSheet && (
                              <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-emerald-200 text-emerald-950 font-black border border-emerald-300" title="Mantuvo arco en cero en Fecha 6">
                                +1 F6
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2 px-2 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {team.cleanSheetRate}%
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600 dark:text-slate-400">
                          {team.played}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-black text-slate-900 dark:text-slate-100">
                          {team.goalsAgainst}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {team.averageGoalsAgainst}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600 dark:text-slate-400">
                          {team.goalsFor}
                        </td>
                        <td
                          className={`py-2 px-2 text-center font-mono font-bold ${
                            team.goalDiff > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : team.goalDiff < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-black text-[#1b55e2] dark:text-cyan-400">
                          {team.points} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: ARQUEROS CON VALLA INVICTA */}
          {defenseSubTab === 'ARQUEROS' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 dark:text-slate-100">
                    Ranking Oficial de Arqueros: Fechas sin Recibir Goles
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Fechas con arco en cero registradas en Gran DT con puntajes consolidados a la Fecha 5.
                  </p>
                </div>
                <span className="text-[10px] text-blue-600 font-bold uppercase bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800">
                  {goalkeeperStats.length} Arqueros
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-black bg-slate-100 dark:bg-slate-800/40">
                      <th className="py-2 px-2 text-center w-10">#</th>
                      <th className="py-2 px-2">Arquero</th>
                      <th className="py-2 px-2">Club</th>
                      <th className="py-2 px-2 text-center font-black bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-x border-emerald-300 dark:border-emerald-800">
                        Fechas sin Recibir Goles
                      </th>
                      <th className="py-2 px-2 text-center">% Arco en Cero</th>
                      <th className="py-2 px-2 text-center">Partidos Jugados (PJ)</th>
                      <th className="py-2 px-2 text-center bg-blue-50/60 dark:bg-blue-950/40 text-[#1b55e2] dark:text-cyan-300">
                        Pts Gran DT (Hasta F5)
                      </th>
                      <th className="py-2 px-2 text-center">Promedio Calificación</th>
                      <th className="py-2 px-2 text-right">Cotización</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {goalkeeperStats.map((arq, idx) => (
                      <tr
                        key={arq.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer group"
                        onClick={() => arq.playerObj && onSelectPlayer?.(arq.playerObj)}
                        title={`Ver estadísticas de ${arq.nombre}`}
                      >
                        <td className="py-2 px-2 text-center font-mono font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-1.5">
                            <PositionBadge position="ARQ" size="xs" />
                            <span className="group-hover:text-[#1b55e2] dark:group-hover:text-cyan-300 transition">
                              {arq.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <TeamBadge teamName={arq.equipo} size="xs" showName={false} />
                            <span className="truncate">{arq.equipo}</span>
                          </div>
                        </td>

                        {/* Vallas Invictas Arquero - Estadística Principal */}
                        <td className="py-2 px-2 text-center font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border-x border-emerald-200 dark:border-emerald-900/60">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-black">{arq.vallaInvictaTotal}</span>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                              {arq.vallaInvictaTotal === 1 ? 'fecha' : 'fechas'}
                            </span>
                            {arq.roundVallaInvicta && (
                              <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-emerald-200 text-emerald-950 font-black border border-emerald-300" title="Arco en cero en Fecha 6">
                                +1 F6
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2 px-2 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {arq.cleanSheetRate}%
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600 dark:text-slate-400">
                          {arq.partidosJugados}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-black text-[#1b55e2] dark:text-cyan-400 bg-blue-50/30 dark:bg-blue-950/20">
                          {arq.puntosTotales} pts
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600 dark:text-slate-400">
                          {arq.promedio > 0 ? arq.promedio.toFixed(2) : '-'}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-black text-emerald-700 dark:text-emerald-400">
                          {arq.precio}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
