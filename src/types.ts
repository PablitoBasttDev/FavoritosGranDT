export type Position = 'ARQ' | 'DEF' | 'VOL' | 'DEL';

export type PlayerUnavailableType = 'suspension' | 'lesion' | 'duda';

export interface PlayerStatusInfo {
  status: 'AVAILABLE' | 'SUSPENDED' | 'INJURED' | 'DOUBT';
  type: PlayerUnavailableType;
  badgeText: string; // 'SUSPENDIDO' | 'LESIONADO' | 'EN DUDA'
  reason: string; // Motivo exacto (e.g., 'Tarjeta Roja (Expulsado en Promiedos)', 'Rotura de ligamentos cruzados')
  detail?: string;
  returnEstimate?: string; // 'Baja Fecha 7', 'Retorno Fecha 8', 'Baja médica'
  source?: 'promiedos' | 'parte_medico' | 'manual';
}

export interface Player {
  id: number;
  nombre: string;
  equipo: string;
  posicion: Position;
  precio: string;
  precioNum: number;
  promedio?: number; // Puntos promedio en el torneo (PrT)
  promedioGranDT?: number; // Promedio Gran DT (PrG)
  puntosTotales?: number; // Acumulado torneo (AcT)
  partidosJugados?: number; // Partidos calificados (CT)
  goles?: number; // Goles totales convertidos
  figura?: number; // Veces figura (VF)
  vallaInvicta?: number; // Vallas invictas (VI)
  amarillas?: number; // Tarjetas amarillas (TA)
  rojas?: number; // Tarjetas rojas (TR)
  penalesErrados?: number; // Penales errados (PE)
  penalesAtajados?: number; // Penales atajados (PA)
  golesPenal?: number; // Goles de penal (GP)
  fechasPuntajes?: Record<string, string | number>; // F1..F18
  statusInfo?: PlayerStatusInfo;
}

export interface FavoritePlayer extends Player {
  notes?: string;
  addedAt?: number;
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
  sortBy: 'promedio-desc' | 'promedio-asc' | 'price-desc' | 'price-asc' | 'name-asc' | 'team-asc';
  maxPrice: number;
  minPrice: number;
}


