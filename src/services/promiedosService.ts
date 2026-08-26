import { useState, useEffect, useCallback, useRef } from 'react';
import { MatchFixture, MatchEvent, updateFixturesFromPromiedos, areTeamNamesEqual } from '../data/fixture';

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

/**
 * Hook para consultar y sincronizar el fixture de Promiedos cada 45 segundos en tiempo real.
 */
export function usePromiedosLiveFixture(selectedRound?: number) {
  const [data, setData] = useState<PromiedosApiResponse | null>(null);
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
      const url = selectedRound
        ? `/api/promiedos/fixture?round=${selectedRound}`
        : '/api/promiedos/fixture';
      
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const json: PromiedosApiResponse = await response.json();
      if (json.success) {
        setData(json);
        setLastSyncTime(new Date(json.timestamp || Date.now()));
        setSyncError(null);

        // 1. Actualizar FIXTURES_DATA globalmente con los resultados del partido
        if (json.matches && json.matches.length > 0) {
          updateFixturesFromPromiedos(json.matches);
        }
      } else {
        setSyncError(json.error || 'Error al conectar con Promiedos');
      }
    } catch (err) {
      console.warn('Promiedos sync fetch warning:', (err as Error).message);
      setSyncError((err as Error).message);
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

/**
 * Hook para obtener las tablas oficiales de posiciones de Promiedos (Torneo Clausura 2026).
 */
export function usePromiedosStandings() {
  const [standings, setStandings] = useState<PromiedosStandingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch('/api/promiedos/standings', { cache: 'no-store' });
      if (res.ok) {
        const data: PromiedosStandingsResponse = await res.json();
        if (data.success) {
          setStandings(data);
          setLastSync(new Date(data.timestamp || Date.now()));
        }
      }
    } catch (e) {
      console.warn('Error fetching Promiedos standings:', e);
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
  const [scorers, setScorers] = useState<PromiedosScorerRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchScorers = useCallback(async () => {
    try {
      const res = await fetch('/api/promiedos/scorers', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.scorers)) {
          setScorers(data.scorers);
          setLastSync(new Date(data.timestamp || Date.now()));
        }
      }
    } catch (e) {
      console.warn('Error fetching Promiedos scorers:', e);
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
  const [cleanSheets, setCleanSheets] = useState<PromiedosCleanSheetRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchCleanSheets = useCallback(async () => {
    try {
      const res = await fetch('/api/promiedos/clean-sheets', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.cleanSheets)) {
          setCleanSheets(data.cleanSheets);
          setLastSync(new Date(data.timestamp || Date.now()));
        }
      }
    } catch (e) {
      console.warn('Error fetching Promiedos clean sheets:', e);
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

