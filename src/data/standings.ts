import { FIXTURES_DATA, MatchFixture, getDynamicMatchState } from './fixture';
import { getTeamData } from './teams';

export interface TeamStanding {
  teamName: string;
  zone: 'Zona A' | 'Zona B';
  positionZone: number; // 1 to 15 en su zona
  positionGeneral: number; // 1 to 30 en la tabla general acumulada
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;

  // Propiedades dinámicas de seguimiento en vivo
  initialPositionZone?: number;
  initialPositionGeneral?: number;
  initialPoints?: number;
  positionChangeZone?: number; // >0 subió puestos, <0 bajó, 0 igual
  positionChangeGeneral?: number;
  pointsGainedInRound?: number;
  isLiveMatch?: boolean;
  roundMatchStatus?: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  liveMinute?: string;
  matchScoreInfo?: string; // ej. "1 - 3 vs Aldosivi"
}

export interface TeamMatchInfo {
  match: MatchFixture;
  isHome: boolean;
  role: 'LOCAL' | 'VISITANTE';
  rival: string;
  rivalShort: string; // Abreviatura oficial de 3 letras mayúsculas de TV / marcador (ej. BOC, RIV, RAC, VEL)
  dayOfWeek: 'Viernes' | 'Sábado' | 'Domingo' | 'Lunes';
  displayTime: string;
  kickoff: string;
  stadium?: string;
}

// Standings oficiales del Torneo Clausura 2026 de la Liga Profesional AFA (Tras 5 fechas disputadas)
export const RAW_STANDINGS_DATA: Record<string, Omit<TeamStanding, 'positionGeneral'>> = {
  // ===================== ZONA A (15 Equipos) =====================
  "Instituto de Córdoba": {
    teamName: "Instituto de Córdoba",
    zone: "Zona A",
    positionZone: 1,
    points: 12,
    played: 5,
    won: 4,
    drawn: 0,
    lost: 1,
    goalsFor: 5,
    goalsAgainst: 2,
    goalDiff: 3,
  },
  "Vélez Sarsfield": {
    teamName: "Vélez Sarsfield",
    zone: "Zona A",
    positionZone: 2,
    points: 11,
    played: 5,
    won: 3,
    drawn: 2,
    lost: 0,
    goalsFor: 7,
    goalsAgainst: 3,
    goalDiff: 4,
  },
  "Independiente": {
    teamName: "Independiente",
    zone: "Zona A",
    positionZone: 4,
    points: 9,
    played: 5,
    won: 3,
    drawn: 0,
    lost: 2,
    goalsFor: 6,
    goalsAgainst: 3,
    goalDiff: 3,
  },
  "Gimnasia y Esgrima de Mendoza": {
    teamName: "Gimnasia y Esgrima de Mendoza",
    zone: "Zona A",
    positionZone: 3,
    points: 9,
    played: 5,
    won: 3,
    drawn: 0,
    lost: 2,
    goalsFor: 6,
    goalsAgainst: 3,
    goalDiff: 3,
  },
  "Defensa y Justicia": {
    teamName: "Defensa y Justicia",
    zone: "Zona A",
    positionZone: 5,
    points: 8,
    played: 5,
    won: 2,
    drawn: 2,
    lost: 1,
    goalsFor: 6,
    goalsAgainst: 7,
    goalDiff: -1,
  },
  "Newell's Old Boys": {
    teamName: "Newell's Old Boys",
    zone: "Zona A",
    positionZone: 6,
    points: 7,
    played: 5,
    won: 2,
    drawn: 1,
    lost: 2,
    goalsFor: 6,
    goalsAgainst: 5,
    goalDiff: 1,
  },
  "Estudiantes de La Plata": {
    teamName: "Estudiantes de La Plata",
    zone: "Zona A",
    positionZone: 7,
    points: 6,
    played: 5,
    won: 2,
    drawn: 0,
    lost: 3,
    goalsFor: 7,
    goalsAgainst: 5,
    goalDiff: 2,
  },
  "Deportivo Riestra": {
    teamName: "Deportivo Riestra",
    zone: "Zona A",
    positionZone: 8,
    points: 6,
    played: 5,
    won: 2,
    drawn: 0,
    lost: 3,
    goalsFor: 6,
    goalsAgainst: 5,
    goalDiff: 1,
  },
  "Lanús": {
    teamName: "Lanús",
    zone: "Zona A",
    positionZone: 9,
    points: 6,
    played: 5,
    won: 2,
    drawn: 0,
    lost: 3,
    goalsFor: 6,
    goalsAgainst: 6,
    goalDiff: 0,
  },
  "Boca Juniors": {
    teamName: "Boca Juniors",
    zone: "Zona A",
    positionZone: 10,
    points: 6,
    played: 5,
    won: 1,
    drawn: 3,
    lost: 1,
    goalsFor: 5,
    goalsAgainst: 7,
    goalDiff: -2,
  },
  "Central Córdoba de SDE": {
    teamName: "Central Córdoba de SDE",
    zone: "Zona A",
    positionZone: 11,
    points: 6,
    played: 5,
    won: 2,
    drawn: 0,
    lost: 3,
    goalsFor: 3,
    goalsAgainst: 5,
    goalDiff: -2,
  },
  "San Lorenzo de Almagro": {
    teamName: "San Lorenzo de Almagro",
    zone: "Zona A",
    positionZone: 12,
    points: 6,
    played: 5,
    won: 2,
    drawn: 0,
    lost: 3,
    goalsFor: 2,
    goalsAgainst: 4,
    goalDiff: -2,
  },
  "Platense": {
    teamName: "Platense",
    zone: "Zona A",
    positionZone: 13,
    points: 5,
    played: 5,
    won: 1,
    drawn: 2,
    lost: 2,
    goalsFor: 5,
    goalsAgainst: 9,
    goalDiff: -4,
  },
  "Unión de Santa Fe": {
    teamName: "Unión de Santa Fe",
    zone: "Zona A",
    positionZone: 14,
    points: 4,
    played: 5,
    won: 1,
    drawn: 1,
    lost: 3,
    goalsFor: 5,
    goalsAgainst: 8,
    goalDiff: -3,
  },
  "Talleres de Córdoba": {
    teamName: "Talleres de Córdoba",
    zone: "Zona A",
    positionZone: 15,
    points: 3,
    played: 5,
    won: 1,
    drawn: 0,
    lost: 4,
    goalsFor: 6,
    goalsAgainst: 10,
    goalDiff: -4,
  },

  // ===================== ZONA B (15 Equipos) =====================
  "Argentinos Juniors": {
    teamName: "Argentinos Juniors",
    zone: "Zona B",
    positionZone: 1,
    points: 12,
    played: 5,
    won: 4,
    drawn: 0,
    lost: 1,
    goalsFor: 9,
    goalsAgainst: 5,
    goalDiff: 4,
  },
  "Belgrano de Córdoba": {
    teamName: "Belgrano de Córdoba",
    zone: "Zona B",
    positionZone: 2,
    points: 10,
    played: 5,
    won: 3,
    drawn: 1,
    lost: 1,
    goalsFor: 6,
    goalsAgainst: 2,
    goalDiff: 4,
  },
  "Rosario Central": {
    teamName: "Rosario Central",
    zone: "Zona B",
    positionZone: 3,
    points: 10,
    played: 5,
    won: 3,
    drawn: 1,
    lost: 1,
    goalsFor: 5,
    goalsAgainst: 3,
    goalDiff: 2,
  },
  "Sarmiento de Junín": {
    teamName: "Sarmiento de Junín",
    zone: "Zona B",
    positionZone: 4,
    points: 9,
    played: 5,
    won: 3,
    drawn: 0,
    lost: 2,
    goalsFor: 10,
    goalsAgainst: 8,
    goalDiff: 2,
  },
  "Barracas Central": {
    teamName: "Barracas Central",
    zone: "Zona B",
    positionZone: 5,
    points: 9,
    played: 5,
    won: 3,
    drawn: 0,
    lost: 2,
    goalsFor: 3,
    goalsAgainst: 3,
    goalDiff: 0,
  },
  "Gimnasia y Esgrima La Plata": {
    teamName: "Gimnasia y Esgrima La Plata",
    zone: "Zona B",
    positionZone: 6,
    points: 9,
    played: 5,
    won: 3,
    drawn: 0,
    lost: 2,
    goalsFor: 6,
    goalsAgainst: 7,
    goalDiff: -1,
  },
  "Tigre": {
    teamName: "Tigre",
    zone: "Zona B",
    positionZone: 7,
    points: 8,
    played: 5,
    won: 2,
    drawn: 2,
    lost: 1,
    goalsFor: 4,
    goalsAgainst: 2,
    goalDiff: 2,
  },
  "Atlético Tucumán": {
    teamName: "Atlético Tucumán",
    zone: "Zona B",
    positionZone: 8,
    points: 8,
    played: 5,
    won: 2,
    drawn: 2,
    lost: 1,
    goalsFor: 4,
    goalsAgainst: 3,
    goalDiff: 1,
  },
  "Huracán": {
    teamName: "Huracán",
    zone: "Zona B",
    positionZone: 9,
    points: 7,
    played: 5,
    won: 2,
    drawn: 1,
    lost: 2,
    goalsFor: 4,
    goalsAgainst: 4,
    goalDiff: 0,
  },
  "Independiente Rivadavia": {
    teamName: "Independiente Rivadavia",
    zone: "Zona B",
    positionZone: 10,
    points: 7,
    played: 5,
    won: 2,
    drawn: 1,
    lost: 2,
    goalsFor: 5,
    goalsAgainst: 6,
    goalDiff: -1,
  },
  "Banfield": {
    teamName: "Banfield",
    zone: "Zona B",
    positionZone: 11,
    points: 7,
    played: 5,
    won: 2,
    drawn: 1,
    lost: 2,
    goalsFor: 4,
    goalsAgainst: 5,
    goalDiff: -1,
  },
  "Racing Club": {
    teamName: "Racing Club",
    zone: "Zona B",
    positionZone: 12,
    points: 4,
    played: 5,
    won: 1,
    drawn: 1,
    lost: 3,
    goalsFor: 4,
    goalsAgainst: 6,
    goalDiff: -2,
  },
  "Estudiantes de Río Cuarto": {
    teamName: "Estudiantes de Río Cuarto",
    zone: "Zona B",
    positionZone: 13,
    points: 4,
    played: 5,
    won: 1,
    drawn: 1,
    lost: 3,
    goalsFor: 3,
    goalsAgainst: 7,
    goalDiff: -4,
  },
  "River Plate": {
    teamName: "River Plate",
    zone: "Zona B",
    positionZone: 14,
    points: 3,
    played: 5,
    won: 0,
    drawn: 3,
    lost: 2,
    goalsFor: 4,
    goalsAgainst: 6,
    goalDiff: -2,
  },
  "Aldosivi": {
    teamName: "Aldosivi",
    zone: "Zona B",
    positionZone: 15,
    points: 2,
    played: 5,
    won: 0,
    drawn: 2,
    lost: 3,
    goalsFor: 2,
    goalsAgainst: 8,
    goalDiff: -6,
  },
};

/**
 * Comparador oficial de desempate en la tabla de posiciones AFA
 */
export function compareStandingsTeams(
  a: { points: number; goalDiff: number; goalsFor: number; teamName: string },
  b: { points: number; goalDiff: number; goalsFor: number; teamName: string }
): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.teamName.localeCompare(b.teamName);
}

/**
 * Calcula las posiciones y estadísticas de la tabla en tiempo real acumulando
 * los datos base con los partidos ya disputados o en juego del torneo.
 */
export function calculateDynamicStandings(
  currentDate: Date = new Date(),
  fixtures: MatchFixture[] = FIXTURES_DATA
): Record<string, TeamStanding> {
  // 1. Inicializar con los datos base pre-fecha
  const updated: Record<string, TeamStanding> = {};

  // Calcular posiciones iniciales pre-fecha de forma idéntica y consistente
  const initialZoneA = Object.values(RAW_STANDINGS_DATA)
    .filter(t => t.zone === 'Zona A')
    .sort(compareStandingsTeams);
  const initialZoneAMap: Record<string, number> = {};
  initialZoneA.forEach((team, idx) => {
    initialZoneAMap[team.teamName] = idx + 1;
  });

  const initialZoneB = Object.values(RAW_STANDINGS_DATA)
    .filter(t => t.zone === 'Zona B')
    .sort(compareStandingsTeams);
  const initialZoneBMap: Record<string, number> = {};
  initialZoneB.forEach((team, idx) => {
    initialZoneBMap[team.teamName] = idx + 1;
  });

  const initialGeneral = Object.values(RAW_STANDINGS_DATA).sort(compareStandingsTeams);
  const initialGeneralMap: Record<string, number> = {};
  initialGeneral.forEach((team, idx) => {
    initialGeneralMap[team.teamName] = idx + 1;
  });

  Object.values(RAW_STANDINGS_DATA).forEach(team => {
    const initZonePos =
      team.zone === 'Zona A' ? initialZoneAMap[team.teamName] : initialZoneBMap[team.teamName];
    const initGenPos = initialGeneralMap[team.teamName] || 15;

    updated[team.teamName] = {
      ...team,
      positionZone: initZonePos,
      positionGeneral: initGenPos,
      initialPositionZone: initZonePos,
      initialPositionGeneral: initGenPos,
      initialPoints: team.points,
      positionChangeZone: 0,
      positionChangeGeneral: 0,
      pointsGainedInRound: 0,
      isLiveMatch: false,
      roundMatchStatus: 'SCHEDULED',
      liveMinute: undefined,
      matchScoreInfo: undefined,
    };
  });

  // 2. Procesar todos los partidos de la fecha en curso o finalizados
  fixtures.forEach(match => {
    const dynamicState = getDynamicMatchState(match, currentDate);
    const homeName = match.homeTeam;
    const awayName = match.awayTeam;

    const homeTeam = updated[homeName];
    const awayTeam = updated[awayName];

    if (!homeTeam || !awayTeam) return;

    if (dynamicState.status === 'FINISHED' || dynamicState.status === 'LIVE') {
      const hScore = dynamicState.homeScore ?? 0;
      const aScore = dynamicState.awayScore ?? 0;
      const isLive = dynamicState.status === 'LIVE';

      // Datos Local
      homeTeam.played += 1;
      homeTeam.goalsFor += hScore;
      homeTeam.goalsAgainst += aScore;
      homeTeam.goalDiff = homeTeam.goalsFor - homeTeam.goalsAgainst;
      homeTeam.roundMatchStatus = dynamicState.status;
      homeTeam.isLiveMatch = isLive;
      homeTeam.liveMinute = dynamicState.liveMinute;

      const awayShort = getTeamData(awayName)?.shortName || awayName.slice(0, 3).toUpperCase();
      homeTeam.matchScoreInfo = `${hScore} - ${aScore} vs ${awayShort}`;

      // Datos Visitante
      awayTeam.played += 1;
      awayTeam.goalsFor += aScore;
      awayTeam.goalsAgainst += hScore;
      awayTeam.goalDiff = awayTeam.goalsFor - awayTeam.goalsAgainst;
      awayTeam.roundMatchStatus = dynamicState.status;
      awayTeam.isLiveMatch = isLive;
      awayTeam.liveMinute = dynamicState.liveMinute;

      const homeShort = getTeamData(homeName)?.shortName || homeName.slice(0, 3).toUpperCase();
      awayTeam.matchScoreInfo = `${aScore} - ${hScore} vs ${homeShort}`;

      if (hScore > aScore) {
        homeTeam.points += 3;
        homeTeam.won += 1;
        homeTeam.pointsGainedInRound = (homeTeam.pointsGainedInRound || 0) + 3;

        awayTeam.lost += 1;
        awayTeam.pointsGainedInRound = (awayTeam.pointsGainedInRound || 0) + 0;
      } else if (hScore === aScore) {
        homeTeam.points += 1;
        homeTeam.drawn += 1;
        homeTeam.pointsGainedInRound = (homeTeam.pointsGainedInRound || 0) + 1;

        awayTeam.points += 1;
        awayTeam.drawn += 1;
        awayTeam.pointsGainedInRound = (awayTeam.pointsGainedInRound || 0) + 1;
      } else {
        awayTeam.points += 3;
        awayTeam.won += 1;
        awayTeam.pointsGainedInRound = (awayTeam.pointsGainedInRound || 0) + 3;

        homeTeam.lost += 1;
        homeTeam.pointsGainedInRound = (homeTeam.pointsGainedInRound || 0) + 0;
      }
    }
  });

  // 3. Ordenar Zona A
  const sortedZoneA = Object.values(updated)
    .filter(t => t.zone === 'Zona A')
    .sort(compareStandingsTeams);

  sortedZoneA.forEach((t, idx) => {
    const newPos = idx + 1;
    t.positionZone = newPos;
    if (t.initialPositionZone !== undefined) {
      t.positionChangeZone = t.initialPositionZone - newPos; // Si estaba 4º y ahora 2º => +2 (subió)
    }
  });

  // 4. Ordenar Zona B
  const sortedZoneB = Object.values(updated)
    .filter(t => t.zone === 'Zona B')
    .sort(compareStandingsTeams);

  sortedZoneB.forEach((t, idx) => {
    const newPos = idx + 1;
    t.positionZone = newPos;
    if (t.initialPositionZone !== undefined) {
      t.positionChangeZone = t.initialPositionZone - newPos;
    }
  });

  // 5. Ordenar Tabla General (30 Equipos)
  const sortedGeneral = Object.values(updated).sort(compareStandingsTeams);

  sortedGeneral.forEach((t, idx) => {
    const newPos = idx + 1;
    t.positionGeneral = newPos;
    if (t.initialPositionGeneral !== undefined) {
      t.positionChangeGeneral = t.initialPositionGeneral - newPos;
    }
  });

  return updated;
}

// Instancia global inicial
export const STANDINGS_DATA: Record<string, TeamStanding> = calculateDynamicStandings(new Date());

/**
 * Obtiene la tabla completa de posiciones recalculada al instante
 */
export function getDynamicStandings(currentDate: Date = new Date()): Record<string, TeamStanding> {
  return calculateDynamicStandings(currentDate);
}

/**
 * Obtiene la información del próximo partido de un equipo en la Fecha 6
 */
export function getTeamMatchInfo(teamName: string, currentDate: Date = new Date()): TeamMatchInfo | undefined {
  const nextMatch = FIXTURES_DATA.find(
    m => m.fecha === 6 && (m.homeTeam === teamName || m.awayTeam === teamName)
  );

  if (!nextMatch) return undefined;

  const isHome = nextMatch.homeTeam === teamName;
  const role: 'LOCAL' | 'VISITANTE' = isHome ? 'LOCAL' : 'VISITANTE';
  const rival = isHome ? nextMatch.awayTeam : nextMatch.homeTeam;
  const rivalMeta = getTeamData(rival);
  const rivalShort = rivalMeta?.shortName || rival.slice(0, 3).toUpperCase();

  let dayOfWeek: 'Viernes' | 'Sábado' | 'Domingo' | 'Lunes' = 'Domingo';
  const lowerDate = nextMatch.dateStr.toLowerCase();
  if (lowerDate.includes('viernes')) dayOfWeek = 'Viernes';
  else if (lowerDate.includes('sábado') || lowerDate.includes('sabado')) dayOfWeek = 'Sábado';
  else if (lowerDate.includes('domingo')) dayOfWeek = 'Domingo';
  else if (lowerDate.includes('lunes')) dayOfWeek = 'Lunes';

  return {
    match: nextMatch,
    isHome,
    role,
    rival,
    rivalShort,
    dayOfWeek,
    displayTime: nextMatch.displayTime,
    kickoff: nextMatch.kickoff,
    stadium: nextMatch.stadium,
  };
}

/**
 * Obtiene la posición, puntos y zona de un equipo en tiempo real
 */
export function getTeamStanding(teamName: string, currentDate?: Date): TeamStanding | undefined {
  const map = currentDate ? getDynamicStandings(currentDate) : STANDINGS_DATA;
  return map[teamName] || STANDINGS_DATA[teamName];
}
