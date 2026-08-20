import { FIXTURES_DATA, MatchFixture } from './fixture';
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
  "Gimnasia y Esgrima de Mendoza": {
    teamName: "Gimnasia y Esgrima de Mendoza",
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

// Calculate General Overall Table (1º a 30º) based on: points desc, goalDiff desc, goalsFor desc, name asc
const sortedGeneralTeams = Object.values(RAW_STANDINGS_DATA).sort((a, b) => {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.teamName.localeCompare(b.teamName);
});

export const STANDINGS_DATA: Record<string, TeamStanding> = {};

sortedGeneralTeams.forEach((team, index) => {
  STANDINGS_DATA[team.teamName] = {
    ...team,
    positionGeneral: index + 1,
  };
});

/**
 * Obtiene la información del próximo partido de un equipo en la Fecha 6
 */
export function getTeamMatchInfo(teamName: string): TeamMatchInfo | undefined {
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
 * Obtiene la posición, puntos y zona de un equipo
 */
export function getTeamStanding(teamName: string): TeamStanding | undefined {
  return STANDINGS_DATA[teamName];
}
