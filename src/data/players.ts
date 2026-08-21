import { Player } from '../types';
import defaultPlayersSnapshot from './liveSheetSnapshot.json';
import { getCachedSheetPlayers } from '../services/sheetsService';

// Initialize with latest cached or default snapshot of all 1000 players from Google Sheet
export const ALL_PLAYERS: Player[] = (function () {
  if (typeof window !== 'undefined') {
    const cached = getCachedSheetPlayers();
    if (cached && cached.length > 0) return cached;
  }
  return defaultPlayersSnapshot as unknown as Player[];
})();

export const getPlayerById = (id: number): Player | undefined => {
  return ALL_PLAYERS.find(p => p.id === id);
};

export const getPlayersByTeam = (teamName: string): Player[] => {
  return ALL_PLAYERS.filter(p => p.equipo.toLowerCase() === teamName.toLowerCase());
};

export const getPlayersByPosition = (pos: string): Player[] => {
  return ALL_PLAYERS.filter(p => p.posicion === pos);
};

