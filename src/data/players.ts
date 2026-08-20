import { Player } from '../types';
import { PLAYERS_PART_1 } from './playersPart1';
import { PLAYERS_PART_2 } from './playersPart2';
import { PLAYERS_PART_3 } from './playersPart3';

export const ALL_PLAYERS: Player[] = [
  ...PLAYERS_PART_1,
  ...PLAYERS_PART_2,
  ...PLAYERS_PART_3
];

export const getPlayerById = (id: number): Player | undefined => {
  return ALL_PLAYERS.find(p => p.id === id);
};

export const getPlayersByTeam = (teamName: string): Player[] => {
  return ALL_PLAYERS.filter(p => p.equipo.toLowerCase() === teamName.toLowerCase());
};

export const getPlayersByPosition = (pos: string): Player[] => {
  return ALL_PLAYERS.filter(p => p.posicion === pos);
};
