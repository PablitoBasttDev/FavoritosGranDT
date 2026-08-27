import { FavoritePlayer, Player } from '../types.js';
import defaultPlayersSnapshot from '../data/liveSheetSnapshot.json';
import { findPlayerInCollection, generateDeterministicPlayerId } from './playerIdentity.js';

const canonicalPlayers: Player[] = defaultPlayersSnapshot as unknown as Player[];

/**
 * Finds the latest canonical Player from liveSheetSnapshot (or a provided live players list)
 * for any given player object, matching STRICTLY BY NAME and team.
 */
export function findCanonicalPlayer(
  playerLike: {
    id?: number;
    nombre: string;
    equipo?: string;
    posicion?: string;
  },
  availablePlayers?: Player[]
): Player | undefined {
  if (!playerLike || !playerLike.nombre) return undefined;
  const pool = availablePlayers && availablePlayers.length > 0 ? availablePlayers : canonicalPlayers;
  return findPlayerInCollection(playerLike, pool);
}

/**
 * Hydrates a single FavoritePlayer object with up-to-date stats, scores, and traits from the database,
 * matched by player name.
 */
export function hydrateFavoritePlayer(
  fav: FavoritePlayer | any,
  availablePlayers?: Player[]
): FavoritePlayer {
  if (!fav || !fav.nombre) return fav;

  const canonical = findCanonicalPlayer(fav, availablePlayers);
  if (canonical) {
    return {
      ...canonical,
      notes: fav.notes || undefined,
      addedAt: fav.addedAt || Date.now(),
    };
  }

  // If not found in canonical list, ensure all fields are safely populated with defaults
  const deterministicId = fav.id || generateDeterministicPlayerId(fav.nombre, fav.equipo, fav.posicion);
  return {
    ...fav,
    id: deterministicId,
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
export function hydrateFavorites(
  favoritesList: FavoritePlayer[],
  availablePlayers?: Player[]
): FavoritePlayer[] {
  if (!Array.isArray(favoritesList)) return [];
  return favoritesList.map(f => hydrateFavoritePlayer(f, availablePlayers));
}

