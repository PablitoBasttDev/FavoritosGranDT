/**
 * Utility functions for text processing and accent-insensitive search
 */

export function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesSearch(text: string, query: string): boolean {
  if (!query) return true;
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  return normalizedText.includes(normalizedQuery);
}

/**
 * Checks if a player matches a search query against:
 * - Nombre (e.g. "Arboleda Iván", "Iván Arboleda", "Arboleda, Iván")
 * - Equipo (e.g. "Sarmiento de Junín", "Sarmiento", "Junín")
 * - Posición (e.g. "ARQ", "DEF", "VOL", "DEL")
 */
export function playerMatchesQuery(
  player: { nombre: string; equipo: string; posicion: string },
  query: string
): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = normalizeText(query);
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);

  const normalizedName = normalizeText(player.nombre);
  const normalizedTeam = normalizeText(player.equipo);
  const normalizedPos = normalizeText(player.posicion);

  // Full composite string to test against
  const combined = `${normalizedName} ${normalizedTeam} ${normalizedPos}`;

  // If query is a single token or matches directly
  if (combined.includes(normalizedQuery)) {
    return true;
  }

  // Check if all tokens of the query match somewhere in the player's info
  return queryTokens.every(token => combined.includes(token));
}
