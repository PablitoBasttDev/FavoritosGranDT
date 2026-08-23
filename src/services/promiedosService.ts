import { useState, useEffect, useCallback, useRef } from 'react';
import { MatchFixture, MatchEvent, updateFixturesFromPromiedos } from '../data/fixture';
import { Player } from '../types';

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

type LivePlayersListener = (players: Player[]) => void;
const playerSyncListeners: Set<LivePlayersListener> = new Set();

export function subscribeToLivePlayerUpdates(listener: LivePlayersListener): () => void {
  playerSyncListeners.add(listener);
  return () => {
    playerSyncListeners.delete(listener);
  };
}

function notifyPlayerSyncListeners(players: Player[]) {
  playerSyncListeners.forEach(listener => {
    try {
      listener(players);
    } catch (e) {
      console.warn('Error in player sync listener:', e);
    }
  });
}

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
      
      const response = await fetch(url);
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

  // 45-second polling interval
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
    // Buscar coincidencia en Promiedos por nombres de clubes
    const match = promiedosMatches.find(pm => {
      const homeMatch =
        pm.homeTeam.toLowerCase() === base.homeTeam.toLowerCase() ||
        pm.homeTeam.toLowerCase().includes(base.homeTeam.toLowerCase()) ||
        base.homeTeam.toLowerCase().includes(pm.homeTeam.toLowerCase());

      const awayMatch =
        pm.awayTeam.toLowerCase() === base.awayTeam.toLowerCase() ||
        pm.awayTeam.toLowerCase().includes(base.awayTeam.toLowerCase()) ||
        base.awayTeam.toLowerCase().includes(pm.awayTeam.toLowerCase());

      return homeMatch && awayMatch;
    });

    if (!match) return base;

    return {
      ...base,
      status: match.status || base.status,
      homeScore: match.homeScore !== undefined ? match.homeScore : base.homeScore,
      awayScore: match.awayScore !== undefined ? match.awayScore : base.awayScore,
      liveMinute: match.liveMinute || base.liveMinute,
      events: match.events && match.events.length > 0 ? match.events : base.events,
    };
  });
}

