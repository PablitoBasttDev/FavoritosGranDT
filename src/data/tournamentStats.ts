import { FIXTURES_DATA, getDynamicMatchState, getTournamentRoundStatus, toCanonicalTeamName } from './fixture.js';
import { ALL_PLAYERS } from './players.js';
import { getDynamicStandings, TeamStanding } from './standings.js';
import { Player } from '../types.js';
import { normalizeText } from '../utils/textUtils.js';

export interface ScorerStat {
  id: string;
  playerId?: number;
  playerName: string;
  team: string;
  posicion: 'ARQ' | 'DEF' | 'VOL' | 'DEL';
  precio: string;
  precioNum: number;
  totalGoals: number;
  baseGoals: number;
  roundGoals: number;
  penalties: number;
  puntosTotales: number;
  partidosJugados: number;
  playerObj?: Player;
}

export interface ClubDefenseStat {
  teamName: string;
  zone: 'Zona A' | 'Zona B';
  cleanSheetsTotal: number; // Fechas / Partidos sin recibir goles
  baseCleanSheets: number; // Hasta Fecha 5
  roundCleanSheet: boolean; // Mantuvo arco en cero en Fecha 6
  played: number;
  cleanSheetRate: number; // Porcentaje de efectividad con arco en cero
  goalsAgainst: number;
  averageGoalsAgainst: number;
  goalsFor: number;
  goalDiff: number;
  points: number;
  topGoalkeeperName?: string;
}

export interface GoalkeeperDefenseStat {
  id: number;
  nombre: string;
  equipo: string;
  posicion: 'ARQ';
  precio: string;
  precioNum: number;
  vallaInvictaTotal: number; // Fechas sin recibir goles
  baseVallaInvicta: number; // Hasta Fecha 5
  roundVallaInvicta: boolean; // Arco en cero en Fecha 6
  partidosJugados: number;
  puntosTotales: number; // Pts Gran DT hasta Fecha 5
  promedio: number;
  cleanSheetRate: number; // Porcentaje 0 - 100%
  playerObj: Player;
}

export interface IncidentStat {
  id: string;
  type: 'goal' | 'penalty_goal' | 'red_card' | 'second_yellow';
  minute: number;
  playerName: string;
  team: string;
  rival: string;
  detail?: string;
  matchId: string;
}

function normalizeForMatch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Busca un jugador en ALL_PLAYERS coincidiendo nombres en formato "Apellido, Nombre" o "Nombre Apellido"
 */
export function findPlayerByNameOrTeam(name: string, teamHint?: string): Player | undefined {
  if (!name) return undefined;
  const norm = normalizeForMatch(name);
  const normWords = norm.split(' ').filter(w => w.length > 2);

  // 1. Coincidencia exacta o invertida
  let found = ALL_PLAYERS.find(p => {
    const pNorm = normalizeForMatch(p.nombre);
    if (pNorm === norm) return true;
    const parts = p.nombre.split(',').map(s => s.trim());
    if (parts.length === 2) {
      const inv1 = normalizeForMatch(`${parts[1]} ${parts[0]}`);
      const inv2 = normalizeForMatch(`${parts[0]} ${parts[1]}`);
      if (inv1 === norm || inv2 === norm) return true;
    }
    return false;
  });

  if (found) return found;

  // 2. Coincidencia por palabras y equipo
  if (teamHint) {
    const teamNorm = normalizeForMatch(teamHint);
    found = ALL_PLAYERS.find(p => {
      const pTeamNorm = normalizeForMatch(p.equipo);
      if (!pTeamNorm.includes(teamNorm) && !teamNorm.includes(pTeamNorm)) return false;
      const pNorm = normalizeForMatch(p.nombre);
      return normWords.every(w => pNorm.includes(w));
    });
    if (found) return found;
  }

  // 3. Coincidencia por palabras
  found = ALL_PLAYERS.find(p => {
    const pNorm = normalizeForMatch(p.nombre);
    return normWords.every(w => pNorm.includes(w));
  });

  return found;
}

/**
 * Obtiene la lista completa y precisa de todos los goleadores del Torneo Clausura 2026.
 * Extrae la base oficial de Planeta Gran DT (Google Sheet de Estadísticas) correspondiente
 * a la última fecha completa jugada.
 */
export function getDynamicTopScorers(
  currentDate: Date = new Date(),
  playersList: Player[] = ALL_PLAYERS
): ScorerStat[] {
  const activeList = playersList && playersList.length > 0 ? playersList : ALL_PLAYERS;
  const results: ScorerStat[] = [];

  activeList.forEach(player => {
    const totalGoals = player.goles || 0;
    const penalties = player.golesPenal || 0;

    if (totalGoals > 0) {
      results.push({
        id: String(player.id),
        playerId: player.id,
        playerName: player.nombre,
        team: player.equipo,
        posicion: player.posicion,
        precio: player.precio,
        precioNum: player.precioNum || 0,
        totalGoals,
        baseGoals: totalGoals,
        roundGoals: 0,
        penalties,
        puntosTotales: player.puntosTotales || 0,
        partidosJugados: player.partidosJugados || 0,
        playerObj: player,
      });
    }
  });

  // Ordenar por goles totales DESC, puntos totales DESC, menos penales DESC, valor DESC
  return results.sort((a, b) => {
    if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals;
    if (b.puntosTotales !== a.puntosTotales) return b.puntosTotales - a.puntosTotales;
    if (a.penalties !== b.penalties) return a.penalties - b.penalties;
    return b.precioNum - a.precioNum;
  });
}

/**
 * Agregación dinámica de vallas invictas por club a partir de los partidos disputados
 */
export interface TeamDefenseMatchAggregation {
  cleanSheets: number;
  played: number;
  goalsAgainst: number;
  goalsFor: number;
  points: number;
  roundCleanSheet: boolean;
}

export function calculateClubDefenseAggregations(
  currentDate: Date = new Date()
): Record<string, TeamDefenseMatchAggregation> {
  const roundStatus = getTournamentRoundStatus(currentDate);
  const currentRound = roundStatus.roundNumber;
  const aggregations: Record<string, TeamDefenseMatchAggregation> = {};

  FIXTURES_DATA.forEach(m => {
    const dynamic = getDynamicMatchState(m, currentDate);
    const homeCanonical = toCanonicalTeamName(m.homeTeam);
    const awayCanonical = toCanonicalTeamName(m.awayTeam);

    if (!aggregations[homeCanonical]) {
      aggregations[homeCanonical] = {
        cleanSheets: 0,
        played: 0,
        goalsAgainst: 0,
        goalsFor: 0,
        points: 0,
        roundCleanSheet: false,
      };
    }
    if (!aggregations[awayCanonical]) {
      aggregations[awayCanonical] = {
        cleanSheets: 0,
        played: 0,
        goalsAgainst: 0,
        goalsFor: 0,
        points: 0,
        roundCleanSheet: false,
      };
    }

    const isFinished = dynamic.status === 'FINISHED';
    const isLive = dynamic.status === 'LIVE';

    if (isFinished && typeof dynamic.homeScore === 'number' && typeof dynamic.awayScore === 'number') {
      const hScore = dynamic.homeScore;
      const aScore = dynamic.awayScore;

      aggregations[homeCanonical].played += 1;
      aggregations[homeCanonical].goalsFor += hScore;
      aggregations[homeCanonical].goalsAgainst += aScore;

      aggregations[awayCanonical].played += 1;
      aggregations[awayCanonical].goalsFor += aScore;
      aggregations[awayCanonical].goalsAgainst += hScore;

      if (hScore > aScore) {
        aggregations[homeCanonical].points += 3;
      } else if (hScore === aScore) {
        aggregations[homeCanonical].points += 1;
        aggregations[awayCanonical].points += 1;
      } else {
        aggregations[awayCanonical].points += 3;
      }

      if (aScore === 0) {
        aggregations[homeCanonical].cleanSheets += 1;
        if (m.fecha === currentRound) aggregations[homeCanonical].roundCleanSheet = true;
      }
      if (hScore === 0) {
        aggregations[awayCanonical].cleanSheets += 1;
        if (m.fecha === currentRound) aggregations[awayCanonical].roundCleanSheet = true;
      }
    } else if (isLive && typeof dynamic.homeScore === 'number' && typeof dynamic.awayScore === 'number' && m.fecha === currentRound) {
      if (dynamic.awayScore === 0) aggregations[homeCanonical].roundCleanSheet = true;
      if (dynamic.homeScore === 0) aggregations[awayCanonical].roundCleanSheet = true;
    }
  });

  return aggregations;
}

/**
 * Obtiene el ranking oficial de arqueros con más Vallas Invictas del torneo,
 * calculado dinámicamente según los partidos con arco en cero de su club y su participación.
 */
export function getDynamicGoalkeeperDefenseStats(
  currentDate: Date = new Date(),
  playersList: Player[] = ALL_PLAYERS
): GoalkeeperDefenseStat[] {
  const activeList = playersList && playersList.length > 0 ? playersList : ALL_PLAYERS;
  const goalkeepers = activeList.filter(p => p.posicion === 'ARQ');
  const aggregations = calculateClubDefenseAggregations(currentDate);
  const results: GoalkeeperDefenseStat[] = [];

  goalkeepers.forEach(arq => {
    const canonical = toCanonicalTeamName(arq.equipo);
    const cStat = aggregations[canonical];
    const totalPJ = arq.partidosJugados || 0;
    const teamPJ = cStat?.played || 6;
    const clubVI = cStat?.cleanSheets || 0;

    let totalValla = 0;
    if (totalPJ > 0) {
      if (totalPJ >= teamPJ - 1) {
        totalValla = clubVI;
      } else {
        totalValla = Math.min(totalPJ, Math.max(arq.vallaInvicta || 0, Math.min(clubVI, totalPJ)));
      }
    }

    const rate = totalPJ > 0 ? Math.round((totalValla / totalPJ) * 100) : 0;
    const roundVallaInvicta = !!(cStat?.roundCleanSheet && totalPJ > 0);

    if (totalValla > 0 || totalPJ >= 2) {
      results.push({
        id: arq.id,
        nombre: arq.nombre,
        equipo: arq.equipo,
        posicion: 'ARQ',
        precio: arq.precio,
        precioNum: arq.precioNum || 0,
        vallaInvictaTotal: totalValla,
        baseVallaInvicta: totalValla,
        roundVallaInvicta,
        partidosJugados: totalPJ,
        puntosTotales: arq.puntosTotales || 0,
        promedio: arq.promedio || 0,
        cleanSheetRate: rate,
        playerObj: arq,
      });
    }
  });

  return results.sort((a, b) => {
    if (b.vallaInvictaTotal !== a.vallaInvictaTotal) return b.vallaInvictaTotal - a.vallaInvictaTotal;
    if (b.cleanSheetRate !== a.cleanSheetRate) return b.cleanSheetRate - a.cleanSheetRate;
    if (b.puntosTotales !== a.puntosTotales) return b.puntosTotales - a.puntosTotales;
    return a.precioNum - b.precioNum;
  });
}

/**
 * Obtiene todas las incidencias (goles, expulsiones) de la fecha actual
 */
export function getDynamicRoundIncidents(currentDate: Date = new Date()): IncidentStat[] {
  const incidents: IncidentStat[] = [];

  FIXTURES_DATA.forEach(match => {
    const dynamic = getDynamicMatchState(match, currentDate);
    const events = dynamic.visibleEvents || [];

    events.forEach(ev => {
      if (
        ev.type === 'goal' ||
        ev.type === 'penalty_goal' ||
        ev.type === 'red_card' ||
        ev.type === 'second_yellow'
      ) {
        const teamName = ev.team === 'home' ? match.homeTeam : match.awayTeam;
        const rivalName = ev.team === 'home' ? match.awayTeam : match.homeTeam;

        incidents.push({
          id: ev.id,
          type: ev.type,
          minute: ev.minute,
          playerName: ev.playerName,
          team: teamName,
          rival: rivalName,
          detail: ev.detail,
          matchId: match.id,
        });
      }
    });
  });

  return incidents.sort((a, b) => b.minute - a.minute);
}

/**
 * Obtiene el ranking oficial de Clubes con Vallas Menos Vencidas (Fechas sin recibir goles),
 * calculado directamente de los partidos disputados en el torneo y actualizable dinámicamente.
 */
export function getDynamicClubDefenseStats(
  currentDate: Date = new Date(),
  playersList: Player[] = ALL_PLAYERS
): ClubDefenseStat[] {
  const activeList = playersList && playersList.length > 0 ? playersList : ALL_PLAYERS;
  const standings = getDynamicStandings(currentDate);
  const list = Object.values(standings);
  const aggregations = calculateClubDefenseAggregations(currentDate);

  // Mapear arqueros con mayor rodaje por club
  const goalkeepers = activeList.filter(p => p.posicion === 'ARQ');
  const clubGoalkeeperMap: Record<string, { arqName: string; maxPJ: number }> = {};

  goalkeepers.forEach(arq => {
    const canonical = toCanonicalTeamName(arq.equipo);
    const pj = arq.partidosJugados || 0;
    if (!clubGoalkeeperMap[canonical] || pj > clubGoalkeeperMap[canonical].maxPJ) {
      clubGoalkeeperMap[canonical] = {
        arqName: arq.nombre,
        maxPJ: pj,
      };
    }
  });

  const results: ClubDefenseStat[] = list.map(team => {
    const canonical = toCanonicalTeamName(team.teamName);
    const agg = aggregations[canonical];
    const arqInfo = clubGoalkeeperMap[canonical];

    const cleanSheetsTotal = agg ? agg.cleanSheets : (team.goalsAgainst <= 3 ? 3 : team.goalsAgainst <= 6 ? 2 : 1);
    const played = agg && agg.played > 0 ? agg.played : (team.played || 1);
    const cleanSheetRate = Math.round((cleanSheetsTotal / played) * 100);
    const goalsAgainst = agg ? agg.goalsAgainst : team.goalsAgainst;
    const goalsFor = agg ? agg.goalsFor : team.goalsFor;
    const goalDiff = goalsFor - goalsAgainst;
    const points = agg ? agg.points : team.points;
    const averageGoalsAgainst = Number((goalsAgainst / played).toFixed(2));
    const roundCleanSheet = agg?.roundCleanSheet || false;

    return {
      teamName: team.teamName,
      zone: team.zone,
      cleanSheetsTotal,
      baseCleanSheets: cleanSheetsTotal,
      roundCleanSheet,
      played,
      cleanSheetRate,
      goalsAgainst,
      averageGoalsAgainst,
      goalsFor,
      goalDiff,
      points,
      topGoalkeeperName: arqInfo?.arqName,
    };
  });

  // Ordenar prioritariamente por FECHAS SIN RECIBIR GOLES (DESC), % Valla Invicta (DESC), Menos Goles Recibidos (ASC), Diferencia de Gol (DESC), Puntos (DESC)
  return results.sort((a, b) => {
    if (b.cleanSheetsTotal !== a.cleanSheetsTotal) return b.cleanSheetsTotal - a.cleanSheetsTotal;
    if (b.cleanSheetRate !== a.cleanSheetRate) return b.cleanSheetRate - a.cleanSheetRate;
    if (a.goalsAgainst !== b.goalsAgainst) return a.goalsAgainst - b.goalsAgainst;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.points - a.points;
  });
}

/**
 * Obtiene métricas completas de rendimiento ofensivo y defensivo de los equipos en tiempo real
 */
export function getTeamsPerformanceMetrics(currentDate: Date = new Date()): {
  roundNumber: number;
  topOffensive: TeamStanding[];
  topDefensive: TeamStanding[];
  allDefensiveRanked: TeamStanding[];
  clubDefenseRanked: ClubDefenseStat[];
  totalRoundGoals: number;
  averageGoalsPerMatch: number;
  finishedMatches: number;
  liveMatches: number;
  totalMatches: number;
} {
  const standings = getDynamicStandings(currentDate);
  const list = Object.values(standings);
  const clubDefenseRanked = getDynamicClubDefenseStats(currentDate);

  // Top ofensivo (más goles a favor, mejor DIF, más puntos)
  const topOffensive = [...list].sort((a, b) => {
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.points - a.points;
  }).slice(0, 8);

  // Vallas Menos Vencidas a nivel de Club (menos goles en contra, mejor DIF, más puntos)
  const allDefensiveRanked = [...list].sort((a, b) => {
    if (a.goalsAgainst !== b.goalsAgainst) return a.goalsAgainst - b.goalsAgainst;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.points - a.points;
  });

  const topDefensive = allDefensiveRanked.slice(0, 8);

  let totalRoundGoals = 0;
  let finishedMatches = 0;
  let liveMatches = 0;
  const currentRoundNum = getTournamentRoundStatus(currentDate).roundNumber;
  const roundFixtures = FIXTURES_DATA.filter(f => f.fecha === currentRoundNum);

  roundFixtures.forEach(m => {
    const d = getDynamicMatchState(m, currentDate);
    if (d.isFinished) {
      finishedMatches++;
      totalRoundGoals += (d.homeScore || 0) + (d.awayScore || 0);
    } else if (d.isLive) {
      liveMatches++;
      totalRoundGoals += (d.homeScore || 0) + (d.awayScore || 0);
    }
  });

  const playedTotal = finishedMatches + liveMatches;
  const averageGoalsPerMatch = playedTotal > 0 ? Number((totalRoundGoals / playedTotal).toFixed(2)) : 0;

  return {
    roundNumber: currentRoundNum,
    topOffensive,
    topDefensive,
    allDefensiveRanked,
    clubDefenseRanked,
    totalRoundGoals,
    averageGoalsPerMatch,
    finishedMatches,
    liveMatches,
    totalMatches: roundFixtures.length,
  };
}
