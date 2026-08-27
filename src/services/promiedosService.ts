import { useState, useEffect, useCallback, useRef } from 'react';
import { MatchFixture, MatchEvent, updateFixturesFromPromiedos, areTeamNamesEqual, FIXTURES_DATA, getTournamentRoundStatus } from '../data/fixture.js';
import { getDynamicStandings } from '../data/standings.js';
import { getDynamicTopScorers, getDynamicClubDefenseStats } from '../data/tournamentStats.js';

export interface PromiedosMatchData {
  id: string;
  promiedosId?: string;
  fecha: number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  liveMinute: string;
  displayTime: string;
  dateStr?: string;
  kickoff?: string;
  stadium?: string;
  isInterzonal?: boolean;
  tvNetworks?: string[];
  events: MatchEvent[];
}

export interface PromiedosApiResponse {
  success: boolean;
  lastUpdated: string;
  timestamp: number;
  currentRound: number;
  round: number;
  matches: PromiedosMatchData[];
  source: 'promiedos' | 'fallback';
  ttl: number;
  error?: string;
}

const REFRESH_INTERVAL_SECONDS = 45;

function getLocalFallbackFixture(targetRound?: number): PromiedosApiResponse {
  const currentRoundNum = getTournamentRoundStatus().roundNumber;
  const roundNum = targetRound || currentRoundNum;
  const matches: PromiedosMatchData[] = FIXTURES_DATA.filter(f => f.fecha === roundNum).map((f, idx) => ({
    id: f.id || `fix-${roundNum}-${idx + 1}`,
    fecha: roundNum,
    homeTeam: f.homeTeam,
    awayTeam: f.awayTeam,
    homeScore: f.homeScore,
    awayScore: f.awayScore,
    status: f.status || 'SCHEDULED',
    liveMinute: f.liveMinute || '',
    displayTime: f.displayTime,
    dateStr: f.dateStr,
    kickoff: f.kickoff,
    stadium: f.stadium,
    events: f.events || [],
  }));

  return {
    success: true,
    lastUpdated: new Date().toISOString(),
    timestamp: Date.now(),
    currentRound: currentRoundNum,
    round: roundNum,
    matches,
    source: 'fallback',
    ttl: REFRESH_INTERVAL_SECONDS,
  };
}

/**
 * Hook para consultar y sincronizar el fixture de Promiedos cada 45 segundos en tiempo real.
 */
export function usePromiedosLiveFixture(selectedRound?: number) {
  const [data, setData] = useState<PromiedosApiResponse | null>(() => getLocalFallbackFixture(selectedRound));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(REFRESH_INTERVAL_SECONDS);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFixture = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    try {
      const baseUrl = selectedRound
        ? `/api/promiedos/fixture?round=${selectedRound}`
        : '/api/promiedos/fixture';
      const sep = baseUrl.includes('?') ? '&' : '?';
      const url = `${baseUrl}${sep}_t=${Date.now()}`;
      
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const json: PromiedosApiResponse = await response.json();
        if (json.success) {
          setData(json);
          setLastSyncTime(new Date(json.timestamp || Date.now()));
          setSyncError(null);

          if (json.matches && json.matches.length > 0) {
            updateFixturesFromPromiedos(json.matches);
          }
          return;
        }
      }
    } catch {
      // Handled gracefully via fallback state
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setSecondsRemaining(REFRESH_INTERVAL_SECONDS);
    }
  }, [selectedRound]);

  // Initial fetch and round change
  useEffect(() => {
    fetchFixture();
  }, [fetchFixture]);

  // 30-second polling interval
  useEffect(() => {
    timerRef.current = setInterval(() => {
      fetchFixture();
    }, REFRESH_INTERVAL_SECONDS * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchFixture]);

  // 1-second countdown timer for next sync
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setSecondsRemaining(prev => (prev > 1 ? prev - 1 : REFRESH_INTERVAL_SECONDS));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const refreshNow = useCallback(async () => {
    await fetch('/api/promiedos/refresh', { method: 'POST' }).catch(() => {});
    await fetchFixture(true);
  }, [fetchFixture]);

  return {
    promiedosData: data,
    promiedosMatches: data?.matches || [],
    currentRound: data?.currentRound || 6,
    isLiveSyncActive: data?.source === 'promiedos',
    lastSyncTime,
    secondsRemaining,
    refreshIntervalSeconds: REFRESH_INTERVAL_SECONDS,
    isLoading,
    isRefreshing,
    syncError,
    refreshNow,
  };
}

/**
 * Mezcla partidos base con las actualizaciones en tiempo real provenientes de Promiedos.
 */
export function mergeWithPromiedosMatches(
  baseFixtures: MatchFixture[],
  promiedosMatches: PromiedosMatchData[]
): MatchFixture[] {
  if (!promiedosMatches || promiedosMatches.length === 0) {
    return baseFixtures;
  }

  return baseFixtures.map(base => {
    // Buscar coincidencia en Promiedos por nombres canónicos (directo o invertido)
    const match = promiedosMatches.find(pm => {
      const direct = areTeamNamesEqual(pm.homeTeam, base.homeTeam) && areTeamNamesEqual(pm.awayTeam, base.awayTeam);
      const inverted = areTeamNamesEqual(pm.homeTeam, base.awayTeam) && areTeamNamesEqual(pm.awayTeam, base.homeTeam);
      return direct || inverted;
    });

    if (!match) return base;

    const isInverted = areTeamNamesEqual(match.homeTeam, base.awayTeam) && areTeamNamesEqual(match.awayTeam, base.homeTeam);
    const targetHomeScore = isInverted ? match.awayScore : match.homeScore;
    const targetAwayScore = isInverted ? match.homeScore : match.awayScore;

    let adaptedEvents = match.events;
    if (isInverted && match.events && match.events.length > 0) {
      adaptedEvents = match.events.map(ev => ({
        ...ev,
        team: ev.team === 'home' ? 'away' : 'home',
      }));
    }

    return {
      ...base,
      dateStr: match.dateStr || base.dateStr,
      kickoff: match.kickoff || base.kickoff,
      displayTime: match.displayTime || base.displayTime,
      status: match.status || base.status,
      homeScore: targetHomeScore !== undefined ? targetHomeScore : base.homeScore,
      awayScore: targetAwayScore !== undefined ? targetAwayScore : base.awayScore,
      liveMinute: match.liveMinute || base.liveMinute,
      events: adaptedEvents && adaptedEvents.length > 0 ? adaptedEvents : base.events,
    };
  });
}

export interface PromiedosStandingRow {
  positionZone: number;
  positionGeneral: number;
  teamName: string;
  rawTeamName?: string;
  zone: 'Zona A' | 'Zona B';
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  trend?: number[];
}

export interface PromiedosStandingsResponse {
  success: boolean;
  tournament: string;
  source: string;
  timestamp: number;
  zoneA: PromiedosStandingRow[];
  zoneB: PromiedosStandingRow[];
  general: PromiedosStandingRow[];
}

export interface PromiedosScorerRow {
  rank: number;
  playerName: string;
  team: string;
  position: string;
  goals: number;
  promiedosPlayerId?: string;
}

export interface PromiedosCleanSheetRow {
  teamName: string;
  zone: string;
  cleanSheets: number;
  played: number;
  cleanSheetRate: number;
  goalsAgainst: number;
  points: number;
}

function getDefaultStandingsResponse(): PromiedosStandingsResponse {
  const standingsMap = getDynamicStandings();
  const allStandings = Object.values(standingsMap);

  const mapRow = (r: any): PromiedosStandingRow => ({
    positionZone: r.positionZone || 1,
    positionGeneral: r.positionGeneral || 1,
    teamName: r.teamName,
    zone: r.zone,
    points: r.points,
    played: r.played,
    won: r.won,
    drawn: r.drawn,
    lost: r.lost,
    goalsFor: r.goalsFor,
    goalsAgainst: r.goalsAgainst,
    goalDiff: r.goalDiff,
  });

  const zoneA = allStandings
    .filter(t => t.zone === 'Zona A')
    .sort((a, b) => a.positionZone - b.positionZone)
    .map(mapRow);

  const zoneB = allStandings
    .filter(t => t.zone === 'Zona B')
    .sort((a, b) => a.positionZone - b.positionZone)
    .map(mapRow);

  const general = [...allStandings]
    .sort((a, b) => a.positionGeneral - b.positionGeneral)
    .map(mapRow);

  return {
    success: true,
    tournament: 'Torneo Clausura 2026',
    source: 'local-fallback',
    timestamp: Date.now(),
    zoneA,
    zoneB,
    general,
  };
}

function getDefaultScorersList(): PromiedosScorerRow[] {
  return getDynamicTopScorers().map((s, idx) => ({
    rank: idx + 1,
    playerName: s.playerName,
    team: s.team,
    position: s.posicion,
    goals: s.totalGoals,
  }));
}

function getDefaultCleanSheetsList(): PromiedosCleanSheetRow[] {
  return getDynamicClubDefenseStats().map(c => ({
    teamName: c.teamName,
    zone: c.zone,
    cleanSheets: c.cleanSheetsTotal,
    played: c.played,
    cleanSheetRate: c.cleanSheetRate,
    goalsAgainst: c.goalsAgainst,
    points: c.points,
  }));
}

/**
 * Hook para obtener las tablas oficiales de posiciones de Promiedos (Torneo Clausura 2026).
 */
export function usePromiedosStandings() {
  const [standings, setStandings] = useState<PromiedosStandingsResponse | null>(() => getDefaultStandingsResponse());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(() => new Date());

  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch(`/api/promiedos/standings?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data: PromiedosStandingsResponse = await res.json();
        if (data.success) {
          setStandings(data);
          setLastSync(new Date(data.timestamp || Date.now()));
        }
      }
    } catch {
      // Keep existing default state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
    const interval = setInterval(fetchStandings, REFRESH_INTERVAL_SECONDS * 1000);
    return () => clearInterval(interval);
  }, [fetchStandings]);

  return { standings, isLoading, lastSync, refetch: fetchStandings };
}

/**
 * Hook para obtener la tabla oficial de goleadores de Promiedos (Torneo Clausura 2026).
 */
export function usePromiedosScorers() {
  const [scorers, setScorers] = useState<PromiedosScorerRow[]>(() => getDefaultScorersList());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(() => new Date());

  const fetchScorers = useCallback(async () => {
    try {
      const res = await fetch(`/api/promiedos/scorers?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.scorers)) {
          setScorers(data.scorers);
          setLastSync(new Date(data.timestamp || Date.now()));
        }
      }
    } catch {
      // Keep existing default state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScorers();
    const interval = setInterval(fetchScorers, REFRESH_INTERVAL_SECONDS * 1000);
    return () => clearInterval(interval);
  }, [fetchScorers]);

  return { scorers, isLoading, lastSync, refetch: fetchScorers };
}

/**
 * Hook para obtener las vallas invictas oficiales de Promiedos (Torneo Clausura 2026).
 */
export function usePromiedosCleanSheets() {
  const [cleanSheets, setCleanSheets] = useState<PromiedosCleanSheetRow[]>(() => getDefaultCleanSheetsList());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(() => new Date());

  const fetchCleanSheets = useCallback(async () => {
    try {
      const res = await fetch(`/api/promiedos/clean-sheets?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.cleanSheets)) {
          setCleanSheets(data.cleanSheets);
          setLastSync(new Date(data.timestamp || Date.now()));
        }
      }
    } catch {
      // Keep existing default state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCleanSheets();
    const interval = setInterval(fetchCleanSheets, REFRESH_INTERVAL_SECONDS * 1000);
    return () => clearInterval(interval);
  }, [fetchCleanSheets]);

  return { cleanSheets, isLoading, lastSync, refetch: fetchCleanSheets };
}

