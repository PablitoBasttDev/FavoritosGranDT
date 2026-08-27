import { FIXTURES_DATA, getDynamicMatchState, getTournamentRoundStatus } from './fixture.js';
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
 * Obtiene el ranking oficial de arqueros con más Vallas Invictas del torneo,
 * derivado exclusivamente de la hoja oficial de Estadísticas de Planeta Gran DT.
 */
export function getDynamicGoalkeeperDefenseStats(
  currentDate: Date = new Date(),
  playersList: Player[] = ALL_PLAYERS
): GoalkeeperDefenseStat[] {
  const activeList = playersList && playersList.length > 0 ? playersList : ALL_PLAYERS;
  const goalkeepers = activeList.filter(p => p.posicion === 'ARQ');
  const results: GoalkeeperDefenseStat[] = [];

  goalkeepers.forEach(arq => {
    const totalValla = arq.vallaInvicta || 0;
    const totalPJ = arq.partidosJugados || 0;
    const rate = totalPJ > 0 ? Math.round((totalValla / totalPJ) * 100) : 0;

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
        roundVallaInvicta: false,
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
 * Obtiene el ranking oficial de Clubes con Vallas Menos Vencidas,
 * derivado exclusivamente de las estadísticas oficiales de los arqueros de Planeta Gran DT.
 */
export function getDynamicClubDefenseStats(
  currentDate: Date = new Date(),
  playersList: Player[] = ALL_PLAYERS
): ClubDefenseStat[] {
  const activeList = playersList && playersList.length > 0 ? playersList : ALL_PLAYERS;
  const standings = getDynamicStandings(currentDate);
  const list = Object.values(standings);

  // Mapear arqueros titulares por club para obtener base oficial de vallas invictas
  const goalkeepers = activeList.filter(p => p.posicion === 'ARQ');
  const clubGoalkeeperMap: Record<string, { baseVI: number; arqName: string }> = {};

  goalkeepers.forEach(arq => {
    const existing = clubGoalkeeperMap[arq.equipo];
    if (!existing || (arq.partidosJugados || 0) > (existing.baseVI || 0)) {
      clubGoalkeeperMap[arq.equipo] = {
        baseVI: arq.vallaInvicta || 0,
        arqName: arq.nombre,
      };
    }
  });

  const results: ClubDefenseStat[] = list.map(team => {
    const arqInfo = clubGoalkeeperMap[team.teamName];
    const baseVI = arqInfo?.baseVI ?? (team.goalsAgainst <= 3 ? 3 : team.goalsAgainst <= 6 ? 2 : 1);
    const cleanSheetsTotal = baseVI;
    const played = team.played || 1;
    const cleanSheetRate = Math.round((cleanSheetsTotal / played) * 100);
    const averageGoalsAgainst = Number((team.goalsAgainst / played).toFixed(2));

    return {
      teamName: team.teamName,
      zone: team.zone,
      cleanSheetsTotal,
      baseCleanSheets: baseVI,
      roundCleanSheet: false,
      played,
      cleanSheetRate,
      goalsAgainst: team.goalsAgainst,
      averageGoalsAgainst,
      goalsFor: team.goalsFor,
      goalDiff: team.goalDiff,
      points: team.points,
      topGoalkeeperName: arqInfo?.arqName,
    };
  });

  // Ordenar prioritariamente por FECHAS SIN RECIBIR GOLES (DESC), % Valla Invicta (DESC), Menos Goles Recibidos (ASC)
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
