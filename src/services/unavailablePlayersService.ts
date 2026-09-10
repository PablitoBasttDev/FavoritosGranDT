import { Player, PlayerStatusInfo } from '../types.js';
import { useState, useEffect } from 'react';

export interface UnavailablePlayersApiResponse {
  success: boolean;
  isLive: boolean;
  source: string;
  roundName?: string;
  timestamp: number;
  lastUpdated: string;
  totalUnavailable: number;
  totalSuspended: number;
  totalInjured: number;
  players: Array<{
    playerId: number;
    nombre: string;
    equipo: string;
    posicion: string;
    statusInfo: PlayerStatusInfo;
  }>;
  unavailableMap: Record<string, PlayerStatusInfo>;
}

const STORAGE_KEY = 'gran_dt_unavailable_players_v1';
const CACHE_TTL_MS = 45 * 1000; // 45 seconds

let memoryCache: UnavailablePlayersApiResponse | null = null;
let lastFetchTime = 0;
const subscribers = new Set<(data: UnavailablePlayersApiResponse) => void>();

export function getCachedUnavailableData(): UnavailablePlayersApiResponse | null {
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryCache = parsed;
      return parsed;
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
}

export async function fetchUnavailablePlayers(force = false): Promise<UnavailablePlayersApiResponse> {
  const now = Date.now();
  if (!force && memoryCache && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  try {
    const res = await fetch('/api/promiedos/unavailable-players', {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data: UnavailablePlayersApiResponse = await res.json();
    if (data && data.success) {
      memoryCache = data;
      lastFetchTime = now;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore quota errors
      }
      subscribers.forEach(cb => cb(data));
      return data;
    }
  } catch (err) {
    console.warn('[UNAVAILABLE_SERVICE] Fetch warning, using cached/fallback data:', (err as Error).message);
  }

  const cached = getCachedUnavailableData();
  if (cached) return cached;

  // Minimal safe fallback
  return {
    success: true,
    isLive: false,
    source: 'fallback',
    timestamp: Date.now(),
    lastUpdated: new Date().toISOString(),
    totalUnavailable: 0,
    totalSuspended: 0,
    totalInjured: 0,
    players: [],
    unavailableMap: {},
  };
}

export function subscribeToUnavailablePlayers(callback: (data: UnavailablePlayersApiResponse) => void) {
  subscribers.add(callback);
  const cached = getCachedUnavailableData();
  if (cached) callback(cached);

  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Hook to get real-time Promiedos unavailable players (suspended and injured)
 */
export function useUnavailablePlayers() {
  const [data, setData] = useState<UnavailablePlayersApiResponse>(() => {
    return getCachedUnavailableData() || {
      success: true,
      isLive: false,
      source: 'loading',
      timestamp: Date.now(),
      lastUpdated: new Date().toISOString(),
      totalUnavailable: 0,
      totalSuspended: 0,
      totalInjured: 0,
      players: [],
      unavailableMap: {},
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const unsub = subscribeToUnavailablePlayers(newData => {
      if (mounted) setData(newData);
    });

    const runFetch = async () => {
      setIsLoading(true);
      try {
        const res = await fetchUnavailablePlayers();
        if (mounted) setData(res);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    runFetch();

    // Auto-refresh every 45s
    const timer = setInterval(() => {
      if (mounted) runFetch();
    }, 45 * 1000);

    return () => {
      mounted = false;
      unsub();
      clearInterval(timer);
    };
  }, []);

  return {
    ...data,
    isLoading,
    refresh: () => fetchUnavailablePlayers(true),
  };
}

/**
 * Helper to check if a specific player is unavailable
 */
export function getPlayerStatusInfo(
  player: Player | { id?: number; nombre?: string; equipo?: string; rojas?: number; amarillas?: number; statusInfo?: PlayerStatusInfo },
  unavailableMap?: Record<string, PlayerStatusInfo>
): PlayerStatusInfo | null {
  if (player.statusInfo) return player.statusInfo;

  if (unavailableMap) {
    if (player.id && unavailableMap[String(player.id)]) {
      return unavailableMap[String(player.id)];
    }
    if (player.nombre && player.equipo) {
      const nameKey = `${player.nombre.toLowerCase()}_${player.equipo.toLowerCase()}`;
      if (unavailableMap[nameKey]) {
        return unavailableMap[nameKey];
      }
    }
  }

  // Last-resort local heuristic when Promiedos live data has nothing for this player.
  // IMPORTANT: `rojas`/`amarillas` are season-cumulative totals with no per-round breakdown,
  // so we cannot know if a past card's suspension was already served — asserting "SUSPENDIDO"
  // from a career red-card count would be wrong for most players most of the time (e.g. a red
  // card in fecha 2 doesn't mean anything by fecha 10). We only surface a soft, honestly-labeled
  // "en duda" signal for heavy yellow-card accumulation, never a hard, dated suspension claim.
  if (player.amarillas && player.amarillas >= 5) {
    return {
      status: 'DOUBT',
      type: 'duda',
      badgeText: 'EN DUDA',
      reason: 'Acumulación de tarjetas amarillas',
      detail: `Acumula ${player.amarillas} amarillas en el torneo — podría estar sancionado, confirmar en Promiedos`,
      source: 'promiedos',
    };
  }

  return null;
}

/**
 * Enriches a list of players with Promiedos unavailable statuses
 */
export function enrichPlayersWithUnavailableStatus(
  players: Player[],
  unavailableMap: Record<string, PlayerStatusInfo>
): Player[] {
  if (!players || players.length === 0) return [];
  if (!unavailableMap || Object.keys(unavailableMap).length === 0) return players;

  return players.map(p => {
    const statusInfo = getPlayerStatusInfo(p, unavailableMap);
    if (statusInfo) {
      return {
        ...p,
        statusInfo,
      };
    }
    return p;
  });
}
