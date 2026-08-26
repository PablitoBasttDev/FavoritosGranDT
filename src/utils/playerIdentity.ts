import { normalizeText } from './textUtils';
import { SHEET_TEAM_MAP } from '../services/sheetsService';
import { Player, FavoritePlayer, Position } from '../types';

/**
 * Normalizes a player name for consistent matching across different sources and formats:
 * - "Velázquez, Juan Martín" -> "juan martin velazquez"
 * - "Juan Martín Velázquez" -> "juan martin velazquez"
 * - "Cavani Edinson" -> "cavani edinson"
 * - "Edinson Cavani" -> "cavani edinson"
 */
export function normalizePlayerName(name: string): string {
  if (!name) return '';
  const clean = normalizeText(name);
  if (!clean) return '';

  // If format is "Apellido, Nombre"
  if (name.includes(',')) {
    const parts = name.split(',').map(s => normalizeText(s)).filter(Boolean);
    if (parts.length >= 2) {
      // parts[0] is Apellido, parts[1] is Nombre
      const apellidoTokens = parts[0].split(' ').filter(Boolean);
      const nombreTokens = parts[1].split(' ').filter(Boolean);
      // Canonical order: all tokens sorted or name tokens then surname
      const allTokens = [...nombreTokens, ...apellidoTokens];
      return allTokens.join(' ');
    }
  }

  // Without comma, split all tokens
  const tokens = clean.split(' ').filter(Boolean);
  return tokens.join(' ');
}

/**
 * Returns a sorted token signature of a player name.
 * e.g. "Velazquez Juan Martin" -> "juan martin velazquez"
 * e.g. "Juan Martin Velazquez" -> "juan martin velazquez"
 */
export function getPlayerNameSignature(name: string): string {
  if (!name) return '';
  const clean = normalizeText(name);
  if (!clean) return '';

  const tokens = clean
    .split(/[\s,]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .sort();

  return tokens.join(' ');
}

/**
 * Normalizes a team name using the canonical mapping from Planeta Gran DT / Promiedos
 */
export function normalizePlayerTeam(team?: string): string {
  if (!team) return '';
  const mapped = SHEET_TEAM_MAP[team] || team;
  return normalizeText(mapped);
}

/**
 * Generates a stable, canonical identity key for a player based on their name and team.
 */
export function getPlayerIdentityKey(playerLike: {
  nombre: string;
  equipo?: string;
  posicion?: string;
}): string {
  if (!playerLike || !playerLike.nombre) return '';
  const nameSig = getPlayerNameSignature(playerLike.nombre);
  const teamNorm = normalizePlayerTeam(playerLike.equipo);
  return `${nameSig}__${teamNorm}`;
}

/**
 * Generates a deterministic, immutable numerical ID (100000..9999999) from player name and team.
 * This guarantees that a player's ID NEVER changes between different versions or row orders of the Google Sheet!
 */
export function generateDeterministicPlayerId(
  nombre: string,
  equipo: string = '',
  posicion: string = ''
): number {
  const nameSig = getPlayerNameSignature(nombre);
  const teamNorm = normalizePlayerTeam(equipo);
  const posNorm = (posicion || '').trim().toUpperCase();

  const key = `${nameSig}_${teamNorm}_${posNorm}`;
  
  // FNV-1a 32-bit hash algorithm
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  // Force positive integer in range [100000, 9999999]
  const positiveHash = Math.abs(hash >>> 0);
  return 100000 + (positiveHash % 9899999);
}

/**
 * Compares two player objects to check if they represent the exact same person.
 */
export function isSamePlayer(
  p1?: { id?: number; nombre: string; equipo?: string; posicion?: string } | null,
  p2?: { id?: number; nombre: string; equipo?: string; posicion?: string } | null
): boolean {
  if (!p1 || !p2 || !p1.nombre || !p2.nombre) return false;

  const sig1 = getPlayerNameSignature(p1.nombre);
  const sig2 = getPlayerNameSignature(p2.nombre);

  if (!sig1 || !sig2) return false;

  // 1. Exact sorted name signature match
  if (sig1 === sig2) {
    // If both have teams, check if teams match or one is empty
    const t1 = normalizePlayerTeam(p1.equipo);
    const t2 = normalizePlayerTeam(p2.equipo);
    if (t1 && t2 && t1 !== t2) {
      // Different clubs -> unless positions also match and name has 3+ tokens
      const p1Tokens = sig1.split(' ');
      if (p1Tokens.length < 2) return false;
    }
    return true;
  }

  // 2. Apellido, Nombre match check
  const norm1 = normalizePlayerName(p1.nombre);
  const norm2 = normalizePlayerName(p2.nombre);
  if (norm1 === norm2) return true;

  // 3. Token containment check for full names (e.g. "Armani" vs "Armani, Franco")
  const tokens1 = sig1.split(' ').filter(t => t.length >= 3);
  const tokens2 = sig2.split(' ').filter(t => t.length >= 3);

  if (tokens1.length >= 2 && tokens2.length >= 2) {
    const matchCount = tokens1.filter(t => tokens2.includes(t)).length;
    if (matchCount >= 2 && matchCount >= Math.min(tokens1.length, tokens2.length)) {
      const t1 = normalizePlayerTeam(p1.equipo);
      const t2 = normalizePlayerTeam(p2.equipo);
      if (!t1 || !t2 || t1 === t2) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Searches for a player in a given collection primarily by NAME and team.
 */
export function findPlayerInCollection(
  target: { id?: number; nombre: string; equipo?: string; posicion?: string },
  list: Player[]
): Player | undefined {
  if (!target || !target.nombre || !Array.isArray(list) || list.length === 0) {
    return undefined;
  }

  const targetSig = getPlayerNameSignature(target.nombre);
  const targetTeamNorm = normalizePlayerTeam(target.equipo);
  const targetPos = target.posicion;

  // 1. Exact Name Signature + Exact Team Match
  if (targetTeamNorm) {
    const matchNameAndTeam = list.find(
      p => getPlayerNameSignature(p.nombre) === targetSig && normalizePlayerTeam(p.equipo) === targetTeamNorm
    );
    if (matchNameAndTeam) return matchNameAndTeam;
  }

  // 2. Exact Name Signature + Exact Position Match
  if (targetPos) {
    const matchNameAndPos = list.find(
      p => getPlayerNameSignature(p.nombre) === targetSig && p.posicion === targetPos
    );
    if (matchNameAndPos) return matchNameAndPos;
  }

  // 3. Exact Name Signature Match
  const matchNameOnly = list.find(p => getPlayerNameSignature(p.nombre) === targetSig);
  if (matchNameOnly) return matchNameOnly;

  // 4. Fallback: fuzzy/token match
  const matchFuzzy = list.find(p => isSamePlayer(target, p));
  if (matchFuzzy) return matchFuzzy;

  return undefined;
}
