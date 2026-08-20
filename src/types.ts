export type Position = 'ARQ' | 'DEF' | 'VOL' | 'DEL';

export interface Player {
  id: number;
  nombre: string;
  equipo: string;
  posicion: Position;
  precio: string;
  precioNum: number;
}

export interface FavoritePlayer extends Player {
  notes?: string;
  addedAt?: number;
  star?: boolean;
}

export interface UserProfile {
  id: string;
  username: string; // Nombre de usuario único para login
  name: string; // Nombre visible / apodo
  passwordHash: string; // Hash SHA-256 seguro
  salt: string; // Salt único por usuario
  favoriteClub?: string;
  avatarColor: string;
  createdAt: number;
  lastActive: number;
}

export interface TeamInfo {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  escudoUrl?: string;
  badgeUrl?: string;
  totalCotizacion?: number;
}

export interface FilterState {
  searchQuery: string;
  selectedTeam: string;
  selectedPosition: string; // '' | 'ARQ' | 'DEF' | 'VOL' | 'DEL'
  sortBy: 'price-desc' | 'price-asc' | 'name-asc' | 'team-asc';
  maxPrice: number;
  minPrice: number;
}

