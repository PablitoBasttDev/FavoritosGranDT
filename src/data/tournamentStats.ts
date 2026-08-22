import { FIXTURES_DATA, getDynamicMatchState } from './fixture';
import { ALL_PLAYERS } from './players';
import { getDynamicStandings, TeamStanding } from './standings';
import { Player } from '../types';
import { normalizeText } from '../utils/textUtils';

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
 * Extrae la base real de ALL_PLAYERS (Google Sheet snapshot) y le suma en vivo
 * los goles convertidos en los partidos que se están jugando o ya finalizaron en la fecha actual.
 */
export function getDynamicTopScorers(
  currentDate: Date = new Date(),
  playersList: Player[] = ALL_PLAYERS
): ScorerStat[] {
  const activeList = playersList && playersList.length > 0 ? playersList : ALL_PLAYERS;
  // 1. Mapeo de goles de la fecha en juego
  const roundGoalsByPlayerId: Record<number, { goals: number; penalties: number }> = {};
  const roundGoalsByName: Record<string, { goals: number; penalties: number; team: string }> = {};

  FIXTURES_DATA.forEach(match => {
    const dynamic = getDynamicMatchState(match, currentDate);
    const events = dynamic.visibleEvents || [];

    events.forEach(ev => {
      if (ev.type === 'goal' || ev.type === 'penalty_goal') {
        const teamName = ev.team === 'home' ? match.homeTeam : match.awayTeam;
        const matchedPlayer = findPlayerByNameOrTeam(ev.playerName, teamName);

        if (matchedPlayer) {
          if (!roundGoalsByPlayerId[matchedPlayer.id]) {
            roundGoalsByPlayerId[matchedPlayer.id] = { goals: 0, penalties: 0 };
          }
          roundGoalsByPlayerId[matchedPlayer.id].goals += 1;
          if (ev.type === 'penalty_goal') {
            roundGoalsByPlayerId[matchedPlayer.id].penalties += 1;
          }
        } else {
          // Si no está indexado en ALL_PLAYERS, guardar por nombre
          const key = `${ev.playerName}__${teamName}`;
          if (!roundGoalsByName[key]) {
            roundGoalsByName[key] = { goals: 0, penalties: 0, team: teamName };
          }
          roundGoalsByName[key].goals += 1;
          if (ev.type === 'penalty_goal') {
            roundGoalsByName[key].penalties += 1;
          }
        }
      }
    });
  });

  const results: ScorerStat[] = [];
  const processedPlayerIds = new Set<number>();

  // 2. Extraer todos los jugadores con goles base (>0) en activeList o con goles en la fecha
  activeList.forEach(player => {
    const baseGoals = player.goles || 0;
    const basePenalties = player.golesPenal || 0;
    const roundInfo = roundGoalsByPlayerId[player.id];
    const roundGoals = roundInfo?.goals || 0;
    const roundPenalties = roundInfo?.penalties || 0;

    const totalGoals = baseGoals + roundGoals;
    if (totalGoals > 0) {
      processedPlayerIds.add(player.id);
      results.push({
        id: String(player.id),
        playerId: player.id,
        playerName: player.nombre,
        team: player.equipo,
        posicion: player.posicion,
        precio: player.precio,
        precioNum: player.precioNum,
        totalGoals,
        baseGoals,
        roundGoals,
        penalties: basePenalties + roundPenalties,
        puntosTotales: player.puntosTotales || 0,
        partidosJugados: (player.partidosJugados || 0) + (roundGoals > 0 ? 1 : 0),
        playerObj: player,
      });
    }
  });


  // 3. Agregar jugadores no indexados que convirtieron en la fecha
  Object.entries(roundGoalsByName).forEach(([key, info]) => {
    const [name] = key.split('__');
    results.push({
      id: `unlisted-${key}`,
      playerName: name,
      team: info.team,
      posicion: 'DEL',
      precio: '$ 1.500.000',
      precioNum: 1500000,
      totalGoals: info.goals,
      baseGoals: 0,
      roundGoals: info.goals,
      penalties: info.penalties,
      puntosTotales: info.goals * 4,
      partidosJugados: 1,
    });
  });

  // Ordenar por goles totales DESC, goles de la fecha DESC, menos penales DESC, valor DESC
  return results.sort((a, b) => {
    if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals;
    if (b.roundGoals !== a.roundGoals) return b.roundGoals - a.roundGoals;
    if (b.puntosTotales !== a.puntosTotales) return b.puntosTotales - a.puntosTotales;
    return b.precioNum - a.precioNum;
  });
}

/**
 * Obtiene el ranking dinámico de arqueros con más Vallas Invictas del torneo
 */
export function getDynamicGoalkeeperDefenseStats(
  currentDate: Date = new Date(),
  playersList: Player[] = ALL_PLAYERS
): GoalkeeperDefenseStat[] {
  const activeList = playersList && playersList.length > 0 ? playersList : ALL_PLAYERS;
  // Identificar qué equipos no recibieron goles en la fecha actual (terminaron o van en cero)
  const cleanSheetTeamsInRound = new Set<string>();

  FIXTURES_DATA.forEach(match => {
    const dynamic = getDynamicMatchState(match, currentDate);
    if (dynamic.isFinished || dynamic.isLive) {
      if ((dynamic.awayScore ?? 0) === 0) {
        cleanSheetTeamsInRound.add(match.homeTeam);
      }
      if ((dynamic.homeScore ?? 0) === 0) {
        cleanSheetTeamsInRound.add(match.awayTeam);
      }
    }
  });

  // Filtrar arqueros de activeList
  const goalkeepers = activeList.filter(p => p.posicion === 'ARQ');
  const results: GoalkeeperDefenseStat[] = [];

  goalkeepers.forEach(arq => {
    const baseValla = arq.vallaInvicta || 0;
    const pj = arq.partidosJugados || 0;

    // Si el arquero es titular o jugó partidos y su equipo mantuvo arco en cero en esta fecha
    const teamKeptCleanSheet = cleanSheetTeamsInRound.has(arq.equipo);
    const roundClean = teamKeptCleanSheet && pj > 0;
    const totalValla = baseValla + (roundClean ? 1 : 0);
    const totalPJ = pj + (roundClean ? 1 : 0);

    const rate = totalPJ > 0 ? Math.round((totalValla / totalPJ) * 100) : 0;

    if (totalValla > 0 || totalPJ >= 3) {
      results.push({
        id: arq.id,
        nombre: arq.nombre,
        equipo: arq.equipo,
        posicion: 'ARQ',
        precio: arq.precio,
        precioNum: arq.precioNum,
        vallaInvictaTotal: totalValla,
        baseVallaInvicta: baseValla,
        roundVallaInvicta: roundClean,
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
 * Obtiene el ranking dinámico de Clubes con Vallas Menos Vencidas,
 * destacando las FECHAS SIN RECIBIR GOLES (Vallas Invictas) como métrica principal.
 */
export function getDynamicClubDefenseStats(currentDate: Date = new Date()): ClubDefenseStat[] {
  const standings = getDynamicStandings(currentDate);
  const list = Object.values(standings);

  // Mapear arqueros titulares por club para obtener base oficial de vallas invictas
  const goalkeepers = ALL_PLAYERS.filter(p => p.posicion === 'ARQ');
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

  // Equipos que mantuvieron el arco en cero en la Fecha 6
  const cleanSheetTeamsInRound = new Set<string>();

  FIXTURES_DATA.forEach(match => {
    const dynamic = getDynamicMatchState(match, currentDate);
    if (dynamic.isFinished || dynamic.isLive) {
      if ((dynamic.awayScore ?? 0) === 0) {
        cleanSheetTeamsInRound.add(match.homeTeam);
      }
      if ((dynamic.homeScore ?? 0) === 0) {
        cleanSheetTeamsInRound.add(match.awayTeam);
      }
    }
  });

  const results: ClubDefenseStat[] = list.map(team => {
    const arqInfo = clubGoalkeeperMap[team.teamName];
    const baseVI = arqInfo?.baseVI ?? (team.goalsAgainst <= 3 ? 3 : team.goalsAgainst <= 6 ? 2 : 1);
    const roundClean = cleanSheetTeamsInRound.has(team.teamName);
    const cleanSheetsTotal = baseVI + (roundClean ? 1 : 0);
    const played = team.played || 1;
    const cleanSheetRate = Math.round((cleanSheetsTotal / played) * 100);
    const averageGoalsAgainst = Number((team.goalsAgainst / played).toFixed(2));

    return {
      teamName: team.teamName,
      zone: team.zone,
      cleanSheetsTotal,
      baseCleanSheets: baseVI,
      roundCleanSheet: roundClean,
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
  const roundFixtures = FIXTURES_DATA.filter(f => f.fecha === 6);

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
