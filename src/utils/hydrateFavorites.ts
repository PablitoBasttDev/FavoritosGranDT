import { FavoritePlayer, Player } from '../types';
import defaultPlayersSnapshot from '../data/liveSheetSnapshot.json';
import { normalizeText } from './textUtils';
import { SHEET_TEAM_MAP } from '../services/sheetsService';

const canonicalPlayers: Player[] = defaultPlayersSnapshot as unknown as Player[];

/**
 * Finds the latest canonical Player from liveSheetSnapshot for any given player object,
 * matching by ID, full name, or normalized name + position/team.
 */
export function findCanonicalPlayer(playerLike: {
  id?: number;
  nombre: string;
  equipo?: string;
  posicion?: string;
}): Player | undefined {
  if (!playerLike || !playerLike.nombre) return undefined;

  const searchNormName = normalizeText(playerLike.nombre);
  const rawTeam = playerLike.equipo || '';
  const mappedTeam = SHEET_TEAM_MAP[rawTeam] || rawTeam;
  const normTeam = normalizeText(mappedTeam);
  const searchPos = playerLike.posicion;

  // 1. Match by exact ID if name also matches
  if (playerLike.id) {
    const byId = canonicalPlayers.find(p => p.id === playerLike.id);
    if (byId) {
      const norm1 = normalizeText(byId.nombre);
      if (norm1 === searchNormName || norm1.includes(searchNormName) || searchNormName.includes(norm1)) {
        return byId;
      }
    }
  }

  // 2. Match by exact normalized name AND mapped team
  if (normTeam) {
    const byNameAndTeam = canonicalPlayers.find(
      p =>
        normalizeText(p.nombre) === searchNormName &&
        (normalizeText(p.equipo) === normTeam ||
          normalizeText(SHEET_TEAM_MAP[p.equipo] || p.equipo) === normTeam)
    );
    if (byNameAndTeam) return byNameAndTeam;
  }

  // 3. Match by exact normalized name AND position
  if (searchPos) {
    const byNameAndPos = canonicalPlayers.find(
      p => normalizeText(p.nombre) === searchNormName && p.posicion === searchPos
    );
    if (byNameAndPos) return byNameAndPos;
  }

  // 4. Match by exact normalized name
  const byNameExact = canonicalPlayers.find(p => normalizeText(p.nombre) === searchNormName);
  if (byNameExact) return byNameExact;

  // 5. Token / partial name matching (e.g. "Campaz, Jaminton" vs "Jaminton Campaz" or "Campaz")
  const tokens = searchNormName.split(' ').filter(t => t.length >= 3);
  if (tokens.length > 0) {
    const byTokens = canonicalPlayers.find(p => {
      const pNorm = normalizeText(p.nombre);
      const allTokensMatch = tokens.every(t => pNorm.includes(t));
      if (allTokensMatch) {
        if (
          !normTeam ||
          normalizeText(p.equipo) === normTeam ||
          normalizeText(SHEET_TEAM_MAP[p.equipo] || p.equipo) === normTeam
        ) {
          return true;
        }
      }
      return false;
    });
    if (byTokens) return byTokens;
  }

  // 6. Match by ID as fallback
  if (playerLike.id) {
    const byIdOnly = canonicalPlayers.find(p => p.id === playerLike.id);
    if (byIdOnly) return byIdOnly;
  }

  return undefined;
}

/**
 * Hydrates a single FavoritePlayer object with up-to-date stats, scores, and traits from the database.
 */
export function hydrateFavoritePlayer(fav: FavoritePlayer | any): FavoritePlayer {
  if (!fav) return fav;

  const canonical = findCanonicalPlayer(fav);
  if (canonical) {
    return {
      ...canonical,
      notes: fav.notes || undefined,
      addedAt: fav.addedAt || Date.now(),
    };
  }

  // If not found in canonical list, ensure all fields are safely populated with defaults
  return {
    ...fav,
    promedio: typeof fav.promedio === 'number' ? fav.promedio : 0,
    promedioGranDT: typeof fav.promedioGranDT === 'number' ? fav.promedioGranDT : 0,
    puntosTotales: typeof fav.puntosTotales === 'number' ? fav.puntosTotales : 0,
    partidosJugados: typeof fav.partidosJugados === 'number' ? fav.partidosJugados : 0,
    goles: typeof fav.goles === 'number' ? fav.goles : 0,
    figura: typeof fav.figura === 'number' ? fav.figura : 0,
    vallaInvicta: typeof fav.vallaInvicta === 'number' ? fav.vallaInvicta : 0,
    amarillas: typeof fav.amarillas === 'number' ? fav.amarillas : 0,
    rojas: typeof fav.rojas === 'number' ? fav.rojas : 0,
    penalesErrados: typeof fav.penalesErrados === 'number' ? fav.penalesErrados : 0,
    penalesAtajados: typeof fav.penalesAtajados === 'number' ? fav.penalesAtajados : 0,
    golesPenal: typeof fav.golesPenal === 'number' ? fav.golesPenal : 0,
    fechasPuntajes: fav.fechasPuntajes || {},
    notes: fav.notes || undefined,
    addedAt: fav.addedAt || Date.now(),
  };
}

/**
 * Hydrates a whole list of favorites with the latest data and traits.
 */
export function hydrateFavorites(favoritesList: FavoritePlayer[]): FavoritePlayer[] {
  if (!Array.isArray(favoritesList)) return [];
  return favoritesList.map(hydrateFavoritePlayer);
}
