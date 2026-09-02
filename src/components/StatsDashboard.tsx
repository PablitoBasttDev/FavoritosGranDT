import React, { useState, useEffect, useMemo } from 'react';
import { ALL_PLAYERS } from '../data/players.js';
import { TEAMS_DATA } from '../data/teams.js';
import { FIXTURES_DATA, subscribeToFixturesUpdate, areTeamNamesEqual } from '../data/fixture.js';
import { getDynamicStandings, TeamStanding } from '../data/standings.js';
import {
  getDynamicTopScorers,
  getDynamicRoundIncidents,
  getTeamsPerformanceMetrics,
  getDynamicGoalkeeperDefenseStats,
  getDynamicClubDefenseStats,
  findPlayerByNameOrTeam,
  ScorerStat,
  GoalkeeperDefenseStat,
  ClubDefenseStat,
} from '../data/tournamentStats.js';
import { TeamBadge } from './TeamBadge.js';
import { PositionBadge } from './PositionBadge.js';
import { getActiveRoundLabel, subscribeToLiveSheet } from '../services/sheetsService.js';
import {
  usePromiedosStandings,
  usePromiedosScorers,
  usePromiedosCleanSheets,
} from '../services/promiedosService.js';
import { normalizeText } from '../utils/textUtils.js';
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
  const [roundLabelState, setRoundLabelState] = useState<string>(() => getActiveRoundLabel());
  const [lastAutoSyncTime, setLastAutoSyncTime] = useState<Date>(new Date());

  // Promiedos Live Feeds (Torneo Clausura 2026)
  const { standings: promiedosStandings, refetch: refetchStandings } = usePromiedosStandings();
  const { scorers: promiedosScorers, refetch: refetchScorers } = usePromiedosScorers();
  const { cleanSheets: promiedosCleanSheets, refetch: refetchCleanSheets } = usePromiedosCleanSheets();

  // Actualización automática cada 2 segundos a medida que transcurre el tiempo/fecha
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Escucha activa de sincronizaciones automáticas en segundo plano
  useEffect(() => {
    const unsubscribeSheet = subscribeToLiveSheet(result => {
      if (result.detectedRound) {
        setRoundLabelState(result.detectedRound);
      }
      setLastAutoSyncTime(new Date());
      setNow(new Date());
    });

    const unsubscribeFixtures = subscribeToFixturesUpdate(() => {
      setNow(new Date());
    });

    return () => {
      unsubscribeSheet();
      unsubscribeFixtures();
    };
  }, []);

  // Cálculos dinámicos reactivos extraídos de las fuentes oficiales
  const dynamicStandings = useMemo(() => getDynamicStandings(now), [now]);
  const fallbackTopScorers = useMemo(() => getDynamicTopScorers(now, players), [now, players]);
  const roundIncidents = useMemo(() => getDynamicRoundIncidents(now), [now]);
  const teamMetrics = useMemo(() => getTeamsPerformanceMetrics(now), [now]);
  const fallbackClubDefenseStats = useMemo(() => getDynamicClubDefenseStats(now, players), [now, players]);
  const goalkeeperStats = useMemo(() => getDynamicGoalkeeperDefenseStats(now, players), [now, players]);

  // Top Scorers: Promiedos official table for Clausura 2026 enriched with Planeta Gran DT stats & prices
  const topScorers: ScorerStat[] = useMemo(() => {
    const currentPlayers = players && players.length > 0 ? players : ALL_PLAYERS;
    if (promiedosScorers && promiedosScorers.length > 0) {
      return promiedosScorers.map(ps => {
        const playerObj = findPlayerByNameOrTeam(ps.playerName, ps.team);
        const pos = playerObj?.posicion || (ps.position?.toLowerCase().includes('del') ? 'DEL' : ps.position?.toLowerCase().includes('vol') ? 'VOL' : ps.position?.toLowerCase().includes('def') ? 'DEF' : 'DEL');
        return {
          id: ps.promiedosPlayerId || ps.playerName,
          playerId: playerObj?.id,
          playerName: ps.playerName,
          team: ps.team,
          posicion: pos,
          precio: playerObj?.precio || '$ 6.000.000',
          precioNum: playerObj?.precioNum || 6000000,
          totalGoals: ps.goals,
          baseGoals: ps.goals,
          roundGoals: 0,
          penalties: 0,
          puntosTotales: playerObj?.puntosTotales || 0,
          partidosJugados: playerObj?.partidosJugados || 0,
          playerObj,
        };
      });
    }
    return fallbackTopScorers;
  }, [promiedosScorers, players, fallbackTopScorers]);

  // Clean Sheets: Promiedos official matches in Clausura 2026
  const clubDefenseStats: ClubDefenseStat[] = useMemo(() => {
    if (promiedosCleanSheets && promiedosCleanSheets.length > 0) {
      return promiedosCleanSheets.map(cs => {
        const fallback = fallbackClubDefenseStats.find(f => areTeamNamesEqual(f.teamName, cs.teamName));
        return {
          teamName: cs.teamName,
          zone: (cs.zone as 'Zona A' | 'Zona B') || fallback?.zone || 'Zona A',
          cleanSheetsTotal: cs.cleanSheets,
          baseCleanSheets: cs.cleanSheets,
          roundCleanSheet: fallback?.roundCleanSheet || false,
          played: cs.played,
          cleanSheetRate: cs.cleanSheetRate,
          goalsAgainst: cs.goalsAgainst,
          averageGoalsAgainst: cs.played > 0 ? parseFloat((cs.goalsAgainst / cs.played).toFixed(2)) : 0,
          goalsFor: fallback?.goalsFor || 0,
          goalDiff: (fallback?.goalsFor || 0) - cs.goalsAgainst,
          points: cs.points,
          topGoalkeeperName: fallback?.topGoalkeeperName,
        };
      }).sort((a, b) => {
        if (b.cleanSheetsTotal !== a.cleanSheetsTotal) return b.cleanSheetsTotal - a.cleanSheetsTotal;
        if (b.cleanSheetRate !== a.cleanSheetRate) return b.cleanSheetRate - a.cleanSheetRate;
        if (a.goalsAgainst !== b.goalsAgainst) return a.goalsAgainst - b.goalsAgainst;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.points - a.points;
      });
    }
    return fallbackClubDefenseStats;
  }, [promiedosCleanSheets, fallbackClubDefenseStats]);

  // Filtrado y ordenamiento de equipos (Promiedos Standings)
  const displayedTeams = useMemo(() => {
    let list: TeamStanding[] = Object.values(dynamicStandings);

    if (promiedosStandings) {
      const sourceList =
        standingsZone === 'Zona A'
          ? promiedosStandings.zoneA
          : standingsZone === 'Zona B'
          ? promiedosStandings.zoneB
          : promiedosStandings.general;

      if (sourceList && sourceList.length > 0) {
        list = sourceList.map(row => {
          const fallback = dynamicStandings[row.teamName];
          return {
            teamName: row.teamName,
            zone: row.zone,
            positionZone: row.positionZone,
            positionGeneral: row.positionGeneral || row.positionZone,
            points: row.points,
            played: row.played,
            won: row.won,
            drawn: row.drawn,
            lost: row.lost,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            goalDiff: row.goalDiff,
            isLiveMatch: fallback?.isLiveMatch,
            roundMatchStatus: fallback?.roundMatchStatus,
            liveMinute: fallback?.liveMinute,
            matchScoreInfo: fallback?.matchScoreInfo,
            positionChangeZone: fallback?.positionChangeZone,
            positionChangeGeneral: fallback?.positionChangeGeneral,
          };
        });
      }
    } else {
      if (standingsZone !== 'GENERAL') {
        list = list.filter(t => t.zone === standingsZone);
      }
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
  }, [dynamicStandings, promiedosStandings, standingsZone, onlyPlayedFilter]);

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
      {/* Official Gran DT Blue Header Banner - Ultra Compact on Mobile */}
      <div className="bg-gradient-to-r from-[#07245c] via-[#0e3f9a] to-[#082b6c] text-white rounded-lg sm:rounded-xl shadow-xs p-2 sm:p-3.5 border border-blue-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
              <span className="bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                Oficial AFA & Gran DT
              </span>
              <span className="text-[9.5px] sm:text-xs text-blue-200 font-bold uppercase tracking-wide flex items-center gap-0.5 sm:gap-1">
                <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 animate-pulse" />
                <span className="hidden xs:inline">Auto-Actualizado</span>
              </span>
              <span className="bg-white/10 text-blue-200 px-1.5 py-0.2 rounded text-[9px] sm:text-[9.5px] font-bold">
                {roundLabelState}
              </span>
            </div>
            <h2 className="text-xs sm:text-lg font-black tracking-tight text-white leading-tight">
              Estadísticas, Posiciones & Goleadores
            </h2>
            <p className="text-blue-100/80 text-[10px] sm:text-xs max-w-xl hidden sm:block mt-0.5">
              Goles, vallas menos vencidas, arqueros y tabla de posiciones del Torneo Clausura 2026.
            </p>
          </div>

          {/* Automatic Live Sync Status Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-start sm:self-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg p-1 sm:p-2 border border-white/15 flex items-center gap-1.5">
              <div className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-emerald-500"></span>
              </div>
              <div className="text-left">
                <span className="text-[8.5px] sm:text-[10px] text-emerald-300 font-black uppercase tracking-wider block leading-tight">
                  Promiedos & Planeta GDT
                </span>
                <span className="text-[9.5px] sm:text-[11px] font-bold text-white hidden sm:block leading-tight">
                  Clausura 2026 en Vivo
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg p-1 sm:p-2 border border-white/15 flex items-center gap-1.5">
              <div className="text-right">
                <span className="text-[8.5px] sm:text-[10px] text-blue-200 font-bold uppercase block leading-tight">
                  Fecha en Disputa
                </span>
                <span className="text-[9.5px] sm:text-xs font-black text-white font-mono leading-tight">
                  {teamMetrics.finishedMatches + teamMetrics.liveMatches}/{teamMetrics.totalMatches} PJ
                </span>
              </div>
              <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 mt-1.5 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-blue-800/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('POSICIONES')}
            className={`px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-xs font-black transition flex items-center gap-1 sm:gap-1.5 shrink-0 ${
              activeTab === 'POSICIONES'
                ? 'bg-cyan-400 text-slate-950 shadow-xs'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Table className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Posiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('GOLEADORES')}
            className={`px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-xs font-black transition flex items-center gap-1 sm:gap-1.5 shrink-0 ${
              activeTab === 'GOLEADORES'
                ? 'bg-cyan-400 text-slate-950 shadow-xs'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Goleadores ({topScorers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ATAQUE_DEFENSA')}
            className={`px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-xs font-black transition flex items-center gap-1 sm:gap-1.5 shrink-0 ${
              activeTab === 'ATAQUE_DEFENSA'
                ? 'bg-cyan-400 text-slate-950 shadow-xs'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Vallas Menos Vencidas</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2.5 min-w-0">
        <div className="p-2 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[9px] sm:text-[10px] font-black uppercase block tracking-wider">
            Goles en Fecha {teamMetrics.roundNumber || 7}
          </span>
          <p className="text-lg sm:text-2xl font-black text-slate-950 dark:text-slate-100 font-mono">
            {teamMetrics.totalRoundGoals}
          </p>
          <span className="text-[9.5px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1 truncate">
            <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {teamMetrics.averageGoalsPerMatch} prom / partido
          </span>
        </div>

        <div className="p-2 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[9px] sm:text-[10px] font-black uppercase block tracking-wider">
            Partidos Disputados
          </span>
          <p className="text-lg sm:text-2xl font-black text-slate-950 dark:text-slate-100 font-mono">
            {teamMetrics.finishedMatches + teamMetrics.liveMatches}
            <span className="text-xs font-normal text-slate-400 ml-1">/ {teamMetrics.totalMatches}</span>
          </p>
          <span className="text-[9.5px] sm:text-[11px] text-[#1b55e2] dark:text-cyan-400 font-extrabold flex items-center gap-1 truncate">
            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {teamMetrics.totalMatches - (teamMetrics.finishedMatches + teamMetrics.liveMatches)} pendientes
          </span>
        </div>

        <div className="p-2 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[9px] sm:text-[10px] font-black uppercase block tracking-wider">
            Máximo Goleador
          </span>
          <p className="text-xs sm:text-base font-black text-slate-950 dark:text-slate-100 truncate">
            {topScorerLeader?.playerName || 'Agustín Módica'}
          </p>
          <span className="text-[9.5px] sm:text-[11px] text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1 truncate">
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500" />
            {topScorerLeader?.totalGoals || 5} goles ({topScorerLeader?.team})
          </span>
        </div>

        <div className="p-2 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[9px] sm:text-[10px] font-black uppercase block tracking-wider">
            Más Vallas Invictas
          </span>
          <p className="text-xs sm:text-base font-black text-slate-950 dark:text-slate-100 truncate">
            {bestDefenseClub?.teamName || 'Atlético Tucumán'}
          </p>
          <span className="text-[9.5px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1 truncate">
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
            {bestDefenseClub?.cleanSheetsTotal || 4} Fechas ({bestDefenseClub?.cleanSheetRate || 80}%)
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
          <div className="overflow-x-auto sm:overflow-x-visible rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 text-[9px] sm:text-[10px] uppercase font-black bg-slate-100 dark:bg-slate-800/60 select-none">
                  <th className="py-2 px-1 text-center w-10 sm:w-16">Pos</th>
                  <th className="py-2 px-1.5 sm:px-3">Club</th>
                  {standingsZone === 'GENERAL' && <th className="py-2 px-1 text-center w-12 sm:w-16">Zona</th>}
                  <th className="py-2 px-2 text-center w-36 min-w-[130px] hidden md:table-cell">Estado F6</th>
                  <th className="py-2 px-1.5 sm:px-2 text-center w-14 sm:w-18 font-black text-slate-900 dark:text-slate-100 bg-blue-100/60 dark:bg-blue-900/30">
                    PTS
                  </th>
                  <th className="py-2 px-1 text-center w-8 sm:w-10">PJ</th>
                  <th className="py-2 px-1 text-center w-8 sm:w-10">PG</th>
                  <th className="py-2 px-1 text-center w-8 sm:w-10 hidden sm:table-cell">PE</th>
                  <th className="py-2 px-1 text-center w-8 sm:w-10 hidden sm:table-cell">PP</th>
                  <th className="py-2 px-1 text-center w-8 sm:w-10 hidden lg:table-cell">GF</th>
                  <th className="py-2 px-1 text-center w-8 sm:w-10 hidden lg:table-cell">GC</th>
                  <th className="py-2 px-1 sm:px-2 text-center w-10 sm:w-12 font-black">DIF</th>
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
                      <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-black text-xs">
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1.5">
                          <span
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] shrink-0 font-bold ${
                              isQualifiedZone
                                ? 'bg-emerald-600 text-white font-black'
                                : isTop8Zone
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {pos}
                          </span>

                          <span className="w-3.5 sm:w-5 flex items-center justify-start text-left shrink-0">
                            {change !== undefined && change !== 0 ? (
                              <span
                                className={`flex items-center text-[8.5px] sm:text-[9px] font-black ${
                                  change > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                                title={change > 0 ? `Subió ${change} puestos` : `Bajó ${Math.abs(change)} puestos`}
                              >
                                {change > 0 ? (
                                  <ArrowUp className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0" />
                                ) : (
                                  <ArrowDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0" />
                                )}
                                <span className="hidden sm:inline">{Math.abs(change)}</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700 text-[9px] pl-0.5 select-none">
                                -
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Club Name & Badge */}
                      <td className="py-1.5 sm:py-2 px-1 sm:px-3 font-bold text-slate-900 dark:text-slate-100 max-w-[120px] sm:max-w-none">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <TeamBadge teamName={team.teamName} size="xs" showName={false} />
                          <span className="truncate text-xs group-hover:text-[#1b55e2] dark:group-hover:text-cyan-300 transition">
                            {team.teamName}
                          </span>
                        </div>
                      </td>

                      {standingsZone === 'GENERAL' && (
                        <td className="py-1.5 sm:py-2 px-1 text-center">
                          <span className="text-[9px] sm:text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                            {team.zone === 'Zona A' ? 'A' : 'B'}
                          </span>
                        </td>
                      )}

                      {/* Match Status in Round */}
                      <td className="py-2 px-2 text-center whitespace-nowrap hidden md:table-cell">
                        {team.isLiveMatch ? (
                          <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse whitespace-nowrap">
                            <Radio className="w-2.5 h-2.5 shrink-0" />
                            <span>{team.liveMinute || 'En Vivo'}</span>
                            <span className="font-mono ml-0.5">({team.matchScoreInfo})</span>
                          </span>
                        ) : team.roundMatchStatus === 'FINISHED' ? (
                          <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                            <span>Fin</span>
                            <span className="font-mono text-[10px] font-semibold text-slate-500">
                              {team.matchScoreInfo}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                            Por jugar
                          </span>
                        )}
                      </td>

                      {/* Points with Gained Indicator (Stable Centered Layout) */}
                      <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-black text-[#1b55e2] dark:text-cyan-400 bg-blue-50/50 dark:bg-blue-950/20">
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                          <span className="text-xs sm:text-sm font-black">{team.points}</span>
                          {team.pointsGainedInRound !== undefined && team.pointsGainedInRound > 0 ? (
                            <span className="text-[8px] sm:text-[9px] px-0.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black">
                              +{team.pointsGainedInRound}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{team.played}</td>
                      <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{team.won}</td>
                      <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">{team.drawn}</td>
                      <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">{team.lost}</td>
                      <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-semibold text-slate-700 dark:text-slate-300 hidden lg:table-cell">{team.goalsFor}</td>
                      <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-semibold text-slate-700 dark:text-slate-300 hidden lg:table-cell">{team.goalsAgainst}</td>
                      <td
                        className={`py-1.5 sm:py-2 px-1 text-center font-mono font-black text-xs ${
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 min-w-0">
            {/* Main Top Scorers Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-2.5 sm:p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                    <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 dark:text-slate-100">
                      Goleadores Clausura 2026
                    </h3>
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Tabla de máximos artilleros del torneo con puntajes y estadísticas oficiales de Gran DT.
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
                    <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 text-[9px] sm:text-[10px] uppercase font-black">
                      <th className="py-2 px-0.5 sm:px-1 text-center w-4 sm:w-6">#</th>
                      <th className="py-2 px-1 sm:px-3">Jugador</th>
                      <th className="py-2 px-0.5 sm:px-1 text-center">Pos</th>
                      <th className="py-2 px-1 sm:px-2 text-center sm:text-left">Club</th>
                      <th className="py-2 px-1 text-center hidden sm:table-cell">Goles F6</th>
                      <th className="py-2 px-1 sm:px-1.5 text-center font-black text-slate-900 dark:text-slate-200">
                        Goles
                      </th>
                      <th className="py-2 px-1 text-center hidden md:table-cell">Penales</th>
                      <th className="py-2 px-1 sm:px-2 text-center bg-blue-50/60 dark:bg-blue-950/40 text-[#1b55e2] dark:text-cyan-300">
                        <span className="hidden sm:inline">Pts F5</span>
                        <span className="sm:hidden">Pts</span>
                      </th>
                      <th className="py-2 px-1 sm:px-3 text-right">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredScorers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                          No se encontraron goleadores que coincidan con "{scorerSearch}".
                        </td>
                      </tr>
                    ) : (
                      filteredScorers.map((scorer, idx) => (
                        <tr
                          key={`scorer-${scorer.id || scorer.playerName}-${idx}`}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer group"
                          onClick={() => scorer.playerObj && onSelectPlayer?.(scorer.playerObj)}
                          title={`Ver estadísticas de ${scorer.playerName}`}
                        >
                          <td className="py-1.5 sm:py-2 px-0.5 sm:px-1 text-center font-mono font-bold text-slate-500 text-[10px]">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-3 font-black text-slate-900 dark:text-slate-100">
                            <span
                              className="group-hover:text-[#1b55e2] dark:group-hover:text-cyan-300 transition text-xs block truncate max-w-[105px] xs:max-w-[130px] sm:max-w-none"
                              title={scorer.playerName}
                            >
                              {scorer.playerName}
                            </span>
                          </td>
                          <td className="py-1.5 sm:py-2 px-0.5 sm:px-1 text-center">
                            <PositionBadge position={scorer.posicion} size="xs" />
                          </td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-300 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5">
                              <TeamBadge teamName={scorer.team} size="xs" showName={false} />
                              <span className="hidden sm:inline truncate max-w-[130px] font-bold text-[11px] sm:text-xs">
                                {scorer.team}
                              </span>
                            </div>
                          </td>
                          <td className="py-1.5 sm:py-2 px-1 text-center hidden sm:table-cell">
                            {scorer.roundGoals > 0 ? (
                              <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-mono font-black text-[9px] border border-amber-300 dark:border-amber-800">
                                +{scorer.roundGoals}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-center font-mono font-black text-amber-600 dark:text-amber-400 text-xs sm:text-sm bg-amber-50/50 dark:bg-amber-950/20">
                            {scorer.totalGoals}
                          </td>
                          <td className="py-1.5 sm:py-2 px-1 text-center font-mono text-slate-500 hidden md:table-cell">
                            {scorer.penalties > 0 ? scorer.penalties : '-'}
                          </td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-2 text-center font-mono font-black text-[#1b55e2] dark:text-cyan-400 bg-blue-50/30 dark:bg-blue-950/20 text-xs">
                            {scorer.puntosTotales}
                          </td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs whitespace-nowrap">
                            <span className="hidden sm:inline">{scorer.precio}</span>
                            <span className="sm:hidden">
                              ${(scorer.playerObj?.precioNum ? (scorer.playerObj.precioNum / 1000000).toFixed(1) : (parseFloat(scorer.precio.replace(/[^0-9]/g, '')) / 1000000).toFixed(1))}M
                            </span>
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
                  roundIncidents.map((inc, idx) => (
                    <div
                      key={`incident-${inc.id || inc.playerName}-${idx}`}
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
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-2.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 dark:text-slate-100">
                    Ranking de Clubes: Vallas Invictas
                  </h3>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ordenado por fechas con arco en cero y solidez defensiva en el Clausura 2026.
                  </p>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                  30 Clubes
                </span>
              </div>

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                    <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 text-[9px] sm:text-[10px] uppercase font-black bg-slate-100 dark:bg-slate-800/40">
                      <th className="py-2 px-0.5 sm:px-1 text-center w-4 sm:w-6">#</th>
                      <th className="py-2 px-1 sm:px-2">Club</th>
                      <th className="py-2 px-1 text-center hidden sm:table-cell">Zona</th>
                      <th className="py-2 px-1 sm:px-1.5 text-center font-black bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-x border-emerald-300 dark:border-emerald-800">
                        <span className="hidden sm:inline">Vallas Invictas</span>
                        <span className="sm:hidden">Vallas 0</span>
                      </th>
                      <th className="py-2 px-1 text-center hidden xs:table-cell">% 0</th>
                      <th className="py-2 px-1 text-center">PJ</th>
                      <th className="py-2 px-1 text-center">GC</th>
                      <th className="py-2 px-1 text-center hidden md:table-cell">Prom GC</th>
                      <th className="py-2 px-1 text-center hidden lg:table-cell">GF</th>
                      <th className="py-2 px-1 text-center hidden sm:table-cell">DIF</th>
                      <th className="py-2 px-1 text-center">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {clubDefenseStats.map((team, idx) => (
                      <tr
                        key={`club-defense-${team.teamName}-${idx}`}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer group"
                        onClick={() => onSelectClub?.(team.teamName)}
                        title={`Ver plantel y estadísticas de ${team.teamName}`}
                      >
                        <td className="py-1.5 sm:py-2 px-0.5 sm:px-1 text-center font-mono font-bold text-slate-500 text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 sm:px-2 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-1.5">
                            <TeamBadge teamName={team.teamName} size="xs" showName={false} />
                            <div className="min-w-0">
                              <span className="truncate group-hover:text-[#1b55e2] dark:group-hover:text-cyan-300 transition block text-xs max-w-[95px] xs:max-w-[120px] sm:max-w-none">
                                {team.teamName}
                              </span>
                              {team.topGoalkeeperName && (
                                <span className="text-[9px] sm:text-[10px] font-normal text-slate-500 block truncate max-w-[90px] sm:max-w-none">
                                  {team.topGoalkeeperName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 text-center hidden sm:table-cell">
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                            {team.zone === 'Zona A' ? 'A' : 'B'}
                          </span>
                        </td>

                        {/* Fechas sin recibir goles - Estadística Principal */}
                        <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-center font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border-x border-emerald-200 dark:border-emerald-900/60">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs sm:text-sm font-black">{team.cleanSheetsTotal}</span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hidden sm:inline">
                              {team.cleanSheetsTotal === 1 ? 'fecha' : 'fechas'}
                            </span>
                            {team.roundCleanSheet && (
                              <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-emerald-200 text-emerald-950 font-black border border-emerald-300" title="Mantuvo arco en cero en Fecha 6">
                                +1
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-bold text-slate-800 dark:text-slate-200 text-[10px] sm:text-xs hidden xs:table-cell">
                          <span className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                            {team.cleanSheetRate}%
                          </span>
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
                          {team.played}
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-black text-slate-900 dark:text-slate-100 text-xs">
                          {team.goalsAgainst}
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-bold text-slate-700 dark:text-slate-300 hidden md:table-cell">
                          {team.averageGoalsAgainst}
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                          {team.goalsFor}
                        </td>
                        <td
                          className={`py-1.5 sm:py-2 px-1 text-center font-mono font-bold hidden sm:table-cell ${
                            team.goalDiff > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : team.goalDiff < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-black text-[#1b55e2] dark:text-cyan-400 text-xs">
                          {team.points}
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
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-2.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 dark:text-slate-100">
                    Ranking de Arqueros: Vallas Invictas
                  </h3>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Fechas con arco en cero registradas en Gran DT con puntajes consolidados ({roundLabelState}).
                  </p>
                </div>
                <span className="text-[10px] text-blue-600 font-bold uppercase bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800">
                  {goalkeeperStats.length} Arqueros
                </span>
              </div>

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                    <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 text-[9px] sm:text-[10px] uppercase font-black bg-slate-100 dark:bg-slate-800/40">
                      <th className="py-2 px-0.5 sm:px-1 text-center w-4 sm:w-6">#</th>
                      <th className="py-2 px-1 sm:px-3">Arquero</th>
                      <th className="py-2 px-0.5 sm:px-1 text-center">Pos</th>
                      <th className="py-2 px-1 sm:px-2 text-center sm:text-left">Club</th>
                      <th className="py-2 px-1 sm:px-1.5 text-center font-black bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-x border-emerald-300 dark:border-emerald-800">
                        <span className="hidden sm:inline">Vallas Invictas</span>
                        <span className="sm:hidden">Vallas 0</span>
                      </th>
                      <th className="py-2 px-1 text-center hidden xs:table-cell">% 0</th>
                      <th className="py-2 px-1 text-center">PJ</th>
                      <th className="py-2 px-1 sm:px-2 text-center bg-blue-50/60 dark:bg-blue-950/40 text-[#1b55e2] dark:text-cyan-300">
                        <span className="hidden sm:inline">Pts Totales</span>
                        <span className="sm:hidden">Pts</span>
                      </th>
                      <th className="py-2 px-1 text-center hidden md:table-cell">Prom</th>
                      <th className="py-2 px-1 sm:px-3 text-right">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {goalkeeperStats.map((arq, idx) => (
                      <tr
                        key={`goalkeeper-stat-${arq.id || arq.nombre}-${idx}`}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer group"
                        onClick={() => arq.playerObj && onSelectPlayer?.(arq.playerObj)}
                        title={`Ver estadísticas de ${arq.nombre}`}
                      >
                        <td className="py-1.5 sm:py-2 px-0.5 sm:px-1 text-center font-mono font-bold text-slate-500 text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 sm:px-3 font-black text-slate-900 dark:text-slate-100">
                          <span
                            className="group-hover:text-[#1b55e2] dark:group-hover:text-cyan-300 transition text-xs block truncate max-w-[105px] xs:max-w-[130px] sm:max-w-none"
                            title={arq.nombre}
                          >
                            {arq.nombre}
                          </span>
                        </td>
                        <td className="py-1.5 sm:py-2 px-0.5 sm:px-1 text-center">
                          <PositionBadge position="ARQ" size="xs" />
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-300 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5">
                            <TeamBadge teamName={arq.equipo} size="xs" showName={false} />
                            <span className="hidden sm:inline truncate font-bold text-[11px] sm:text-xs max-w-[130px]">
                              {arq.equipo}
                            </span>
                          </div>
                        </td>

                        {/* Vallas Invictas Arquero - Estadística Principal */}
                        <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-center font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border-x border-emerald-200 dark:border-emerald-900/60">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs sm:text-sm font-black">{arq.vallaInvictaTotal}</span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hidden sm:inline">
                              {arq.vallaInvictaTotal === 1 ? 'fecha' : 'fechas'}
                            </span>
                            {arq.roundVallaInvicta && (
                              <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-emerald-200 text-emerald-950 font-black border border-emerald-300" title="Arco en cero en Fecha 6">
                                +1
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-bold text-slate-800 dark:text-slate-200 text-[10px] sm:text-xs hidden xs:table-cell">
                          <span className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                            {arq.cleanSheetRate}%
                          </span>
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
                          {arq.partidosJugados}
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 sm:px-2 text-center font-mono font-black text-[#1b55e2] dark:text-cyan-400 bg-blue-50/30 dark:bg-blue-950/20 text-xs">
                          {arq.puntosTotales}
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono text-slate-600 dark:text-slate-400 hidden md:table-cell">
                          {arq.promedio > 0 ? arq.promedio.toFixed(2) : '-'}
                        </td>
                        <td className="py-1.5 sm:py-2 px-1 sm:px-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs whitespace-nowrap">
                          <span className="hidden sm:inline">{arq.precio}</span>
                          <span className="sm:hidden">
                            ${(arq.playerObj?.precioNum ? (arq.playerObj.precioNum / 1000000).toFixed(1) : (parseFloat(arq.precio.replace(/[^0-9]/g, '')) / 1000000).toFixed(1))}M
                          </span>
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
