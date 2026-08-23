export interface MatchEvent {
  id: string;
  minute: number;
  addedTime?: number;
  type: 'goal' | 'penalty_goal' | 'own_goal' | 'red_card' | 'second_yellow' | 'yellow_card' | 'penalty_saved';
  team: 'home' | 'away';
  playerName: string;
  assistPlayerName?: string;
  detail?: string;
}

export interface MatchFixture {
  id: string;
  fecha: number;
  homeTeam: string;
  awayTeam: string;
  dateStr: string; // Formato legible en español
  kickoff: string; // Formato ISO para cálculo de timer
  displayTime: string;
  stadium?: string;
  isInterzonal?: boolean;
  
  // Estado base o forzado
  status?: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  homeScore?: number;
  awayScore?: number;
  liveMinute?: string; // e.g. "Finalizado", "PT 24'", "Entretiempo", "ST 74'"
  events?: MatchEvent[];
}

export interface DynamicMatchState {
  fixture: MatchFixture;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  homeScore?: number;
  awayScore?: number;
  liveMinute: string;
  elapsedMinutes?: number;
  isLive: boolean;
  isFinished: boolean;
  isScheduled: boolean;
  visibleEvents: MatchEvent[];
}

// ============================================================================
// FIXTURE OFICIAL TORNEO CLAUSURA 2026 - LIGA PROFESIONAL DE FÚTBOL AFA
// ============================================================================
export const FIXTURES_DATA: MatchFixture[] = [
  // ========================== FECHA 6 (Interzonal) ==========================
  {
    id: 'f6-1',
    fecha: 6,
    homeTeam: 'Aldosivi',
    awayTeam: 'Unión de Santa Fe',
    dateStr: 'Viernes 21 de Agosto de 2026',
    kickoff: '2026-08-21T14:30:00-03:00',
    displayTime: 'Viernes 21/08 • 14:30 hs',
    stadium: 'José María Minella (Mar del Plata)',
    isInterzonal: true,
    status: 'FINISHED',
    homeScore: 1,
    awayScore: 3,
    liveMinute: 'Finalizado',
    events: [
      {
        id: 'ev-6-1-1',
        minute: 18,
        type: 'goal',
        team: 'home',
        playerName: 'Andrés Vombergar',
        detail: 'Puso el 1-0 para Aldosivi',
      },
      {
        id: 'ev-6-1-2',
        minute: 51,
        type: 'goal',
        team: 'away',
        playerName: 'Lucas Menossi',
        detail: 'Empate de Unión',
      },
      {
        id: 'ev-6-1-3',
        minute: 62,
        type: 'goal',
        team: 'away',
        playerName: 'Cristian Tarragona',
        detail: 'Dio vuelta el resultado',
      },
      {
        id: 'ev-6-1-4',
        minute: 64,
        type: 'goal',
        team: 'away',
        playerName: 'Cristian Tarragona',
        detail: 'Doblete para sellar el 3-1',
      },
      {
        id: 'ev-6-1-5',
        minute: 78,
        type: 'red_card',
        team: 'away',
        playerName: 'Julián Palacios',
        detail: 'Expulsión por falta peligrosa',
      },
    ],
  },
  {
    id: 'f6-2',
    fecha: 6,
    homeTeam: 'Estudiantes de Río Cuarto',
    awayTeam: 'San Lorenzo de Almagro',
    dateStr: 'Viernes 21 de Agosto de 2026',
    kickoff: '2026-08-21T20:00:00-03:00',
    displayTime: 'Viernes 21/08 • 20:00 hs',
    stadium: 'Antonio Candini (Río Cuarto)',
    isInterzonal: true,
    status: 'FINISHED',
    homeScore: 0,
    awayScore: 0,
    liveMinute: 'Finalizado',
    events: [],
  },
  {
    id: 'f6-3',
    fecha: 6,
    homeTeam: 'Gimnasia y Esgrima La Plata',
    awayTeam: 'Gimnasia y Esgrima de Mendoza',
    dateStr: 'Sábado 22 de Agosto de 2026',
    kickoff: '2026-08-22T16:00:00-03:00',
    displayTime: 'Sábado 22/08 • 16:00 hs',
    stadium: 'Juan Carmelo Zerillo (La Plata)',
    isInterzonal: true,
    status: 'FINISHED',
    homeScore: 2,
    awayScore: 3,
    liveMinute: 'Finalizado',
    events: [
      {
        id: 'ev-6-3-1',
        minute: 12,
        type: 'goal',
        team: 'away',
        playerName: 'Agustín Módica',
        detail: 'Gol de Gimnasia de Mendoza',
      },
      {
        id: 'ev-6-3-2',
        minute: 25,
        type: 'goal',
        team: 'home',
        playerName: 'Rodrigo Castillo',
        detail: 'Empate parcial del Lobo platense',
      },
      {
        id: 'ev-6-3-3',
        minute: 45,
        type: 'goal',
        team: 'away',
        playerName: 'Agustín Módica',
        detail: 'Doblete para la visita',
      },
      {
        id: 'ev-6-3-4',
        minute: 68,
        type: 'goal',
        team: 'home',
        playerName: 'Benjamín Domínguez',
        detail: 'Nuevo empate en La Plata',
      },
      {
        id: 'ev-6-3-5',
        minute: 78,
        type: 'goal',
        team: 'away',
        playerName: 'Agustín Módica',
        detail: 'Hat-trick y agónico triunfo mendocino',
      },
    ],
  },
  {
    id: 'f6-4',
    fecha: 6,
    homeTeam: 'Atlético Tucumán',
    awayTeam: 'Instituto de Córdoba',
    dateStr: 'Sábado 22 de Agosto de 2026',
    kickoff: '2026-08-22T16:00:00-03:00',
    displayTime: 'Sábado 22/08 • 16:00 hs',
    stadium: 'Monumental José Fierro (Tucumán)',
    isInterzonal: true,
    status: 'FINISHED',
    homeScore: 0,
    awayScore: 0,
    liveMinute: 'Finalizado',
    events: [],
  },
  {
    id: 'f6-5',
    fecha: 6,
    homeTeam: 'Independiente',
    awayTeam: 'Independiente Rivadavia',
    dateStr: 'Sábado 22 de Agosto de 2026',
    kickoff: '2026-08-22T18:30:00-03:00',
    displayTime: 'Sábado 22/08 • 18:30 hs',
    stadium: 'Libertadores de América - Ricardo Bochini',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },
  {
    id: 'f6-6',
    fecha: 6,
    homeTeam: 'Newell\'s Old Boys',
    awayTeam: 'Banfield',
    dateStr: 'Sábado 22 de Agosto de 2026',
    kickoff: '2026-08-22T21:00:00-03:00',
    displayTime: 'Sábado 22/08 • 21:00 hs',
    stadium: 'Marcelo Bielsa (Rosario)',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },
  {
    id: 'f6-7',
    fecha: 6,
    homeTeam: 'Huracán',
    awayTeam: 'Deportivo Riestra',
    dateStr: 'Sábado 22 de Agosto de 2026',
    kickoff: '2026-08-22T21:00:00-03:00',
    displayTime: 'Sábado 22/08 • 21:00 hs',
    stadium: 'Tomás Adolfo Ducó (Parque Patricios)',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },
  {
    id: 'f6-8',
    fecha: 6,
    homeTeam: 'Sarmiento de Junín',
    awayTeam: 'Estudiantes de La Plata',
    dateStr: 'Domingo 23 de Agosto de 2026',
    kickoff: '2026-08-23T14:45:00-03:00',
    displayTime: 'Domingo 23/08 • 14:45 hs',
    stadium: 'Eva Perón (Junín)',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },
  {
    id: 'f6-9',
    fecha: 6,
    homeTeam: 'Barracas Central',
    awayTeam: 'Platense',
    dateStr: 'Domingo 23 de Agosto de 2026',
    kickoff: '2026-08-23T14:45:00-03:00',
    displayTime: 'Domingo 23/08 • 14:45 hs',
    stadium: 'Claudio Chiqui Tapia (Barracas)',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },
  {
    id: 'f6-10',
    fecha: 6,
    homeTeam: 'Belgrano de Córdoba',
    awayTeam: 'Defensa y Justicia',
    dateStr: 'Domingo 23 de Agosto de 2026',
    kickoff: '2026-08-23T17:00:00-03:00',
    displayTime: 'Domingo 23/08 • 17:00 hs',
    stadium: 'Julio César Villagra (Córdoba)',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },
  {
    id: 'f6-11',
    fecha: 6,
    homeTeam: 'River Plate',
    awayTeam: 'Vélez Sarsfield',
    dateStr: 'Domingo 23 de Agosto de 2026',
    kickoff: '2026-08-23T19:15:00-03:00',
    displayTime: 'Domingo 23/08 • 19:15 hs',
    stadium: 'Más Monumental (Núñez)',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },
  {
    id: 'f6-12',
    fecha: 6,
    homeTeam: 'Racing Club',
    awayTeam: 'Boca Juniors',
    dateStr: 'Domingo 23 de Agosto de 2026',
    kickoff: '2026-08-23T21:30:00-03:00',
    displayTime: 'Domingo 23/08 • 21:30 hs',
    stadium: 'Presidente Perón (Avellaneda)',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },
  {
    id: 'f6-13',
    fecha: 6,
    homeTeam: 'Tigre',
    awayTeam: 'Central Córdoba de SDE',
    dateStr: 'Lunes 24 de Agosto de 2026',
    kickoff: '2026-08-24T19:00:00-03:00',
    displayTime: 'Lunes 24/08 • 19:00 hs',
    stadium: 'José Dellagiovanna (Victoria)',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },
  {
    id: 'f6-14',
    fecha: 6,
    homeTeam: 'Lanús',
    awayTeam: 'Argentinos Juniors',
    dateStr: 'Lunes 24 de Agosto de 2026',
    kickoff: '2026-08-24T21:15:00-03:00',
    displayTime: 'Lunes 24/08 • 21:15 hs',
    stadium: 'Ciudad de Lanús - Néstor Díaz Pérez',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },
  {
    id: 'f6-15',
    fecha: 6,
    homeTeam: 'Talleres de Córdoba',
    awayTeam: 'Rosario Central',
    dateStr: 'Lunes 24 de Agosto de 2026',
    kickoff: '2026-08-24T21:15:00-03:00',
    displayTime: 'Lunes 24/08 • 21:15 hs',
    stadium: 'Mario Alberto Kempes (Córdoba)',
    isInterzonal: true,
    status: 'SCHEDULED',
    events: [],
  },

  // ========================== FECHA 7 ==========================
  {
    id: 'f7-1',
    fecha: 7,
    homeTeam: 'Huracán',
    awayTeam: 'Estudiantes de Río Cuarto',
    dateStr: 'Viernes 28 de Agosto de 2026',
    kickoff: '2026-08-28T19:00:00-03:00',
    displayTime: 'Viernes 28/08 • 19:00 hs',
    stadium: 'Tomás Adolfo Ducó',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-2',
    fecha: 7,
    homeTeam: 'Unión de Santa Fe',
    awayTeam: 'Sarmiento de Junín',
    dateStr: 'Viernes 28 de Agosto de 2026',
    kickoff: '2026-08-28T21:15:00-03:00',
    displayTime: 'Viernes 28/08 • 21:15 hs',
    stadium: '15 de Abril (Santa Fe)',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-3',
    fecha: 7,
    homeTeam: 'Deportivo Riestra',
    awayTeam: 'Vélez Sarsfield',
    dateStr: 'Sábado 29 de Agosto de 2026',
    kickoff: '2026-08-29T14:45:00-03:00',
    displayTime: 'Sábado 29/08 • 14:45 hs',
    stadium: 'Guillermo Laza',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-4',
    fecha: 7,
    homeTeam: 'Rosario Central',
    awayTeam: 'Gimnasia y Esgrima La Plata',
    dateStr: 'Sábado 29 de Agosto de 2026',
    kickoff: '2026-08-29T17:00:00-03:00',
    displayTime: 'Sábado 29/08 • 17:00 hs',
    stadium: 'Gigante de Arroyito',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-5',
    fecha: 7,
    homeTeam: 'Boca Juniors',
    awayTeam: 'Lanús',
    dateStr: 'Sábado 29 de Agosto de 2026',
    kickoff: '2026-08-29T19:00:00-03:00',
    displayTime: 'Sábado 29/08 • 19:00 hs',
    stadium: 'Alberto J. Armando - La Bombonera',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-6',
    fecha: 7,
    homeTeam: 'Talleres de Córdoba',
    awayTeam: 'Central Córdoba de SDE',
    dateStr: 'Sábado 29 de Agosto de 2026',
    kickoff: '2026-08-29T21:30:00-03:00',
    displayTime: 'Sábado 29/08 • 21:30 hs',
    stadium: 'Mario Alberto Kempes',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-7',
    fecha: 7,
    homeTeam: 'Atlético Tucumán',
    awayTeam: 'Belgrano de Córdoba',
    dateStr: 'Sábado 29 de Agosto de 2026',
    kickoff: '2026-08-29T21:30:00-03:00',
    displayTime: 'Sábado 29/08 • 21:30 hs',
    stadium: 'Monumental José Fierro',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-8',
    fecha: 7,
    homeTeam: 'Banfield',
    awayTeam: 'River Plate',
    dateStr: 'Domingo 30 de Agosto de 2026',
    kickoff: '2026-08-30T15:00:00-03:00',
    displayTime: 'Domingo 30/08 • 15:00 hs',
    stadium: 'Florencio Sola',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-9',
    fecha: 7,
    homeTeam: 'Argentinos Juniors',
    awayTeam: 'Aldosivi',
    dateStr: 'Domingo 30 de Agosto de 2026',
    kickoff: '2026-08-30T17:00:00-03:00',
    displayTime: 'Domingo 30/08 • 17:00 hs',
    stadium: 'Diego Armando Maradona',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-10',
    fecha: 7,
    homeTeam: 'Independiente',
    awayTeam: 'Gimnasia y Esgrima de Mendoza',
    dateStr: 'Domingo 30 de Agosto de 2026',
    kickoff: '2026-08-30T19:15:00-03:00',
    displayTime: 'Domingo 30/08 • 19:15 hs',
    stadium: 'Libertadores de América',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-11',
    fecha: 7,
    homeTeam: 'Racing Club',
    awayTeam: 'Independiente Rivadavia',
    dateStr: 'Domingo 30 de Agosto de 2026',
    kickoff: '2026-08-30T21:30:00-03:00',
    displayTime: 'Domingo 30/08 • 21:30 hs',
    stadium: 'Presidente Perón - Cilindro de Avellaneda',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-12',
    fecha: 7,
    homeTeam: 'Defensa y Justicia',
    awayTeam: 'Platense',
    dateStr: 'Lunes 31 de Agosto de 2026',
    kickoff: '2026-08-31T19:00:00-03:00',
    displayTime: 'Lunes 31/08 • 19:00 hs',
    stadium: 'Norberto Tomaghello',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-13',
    fecha: 7,
    homeTeam: 'Estudiantes de La Plata',
    awayTeam: 'Newell\'s Old Boys',
    dateStr: 'Lunes 31 de Agosto de 2026',
    kickoff: '2026-08-31T19:00:00-03:00',
    displayTime: 'Lunes 31/08 • 19:00 hs',
    stadium: 'Jorge Luis Hirschi - UNO',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-14',
    fecha: 7,
    homeTeam: 'Tigre',
    awayTeam: 'Barracas Central',
    dateStr: 'Lunes 31 de Agosto de 2026',
    kickoff: '2026-08-31T21:15:00-03:00',
    displayTime: 'Lunes 31/08 • 21:15 hs',
    stadium: 'José Dellagiovanna',
    status: 'SCHEDULED',
  },
  {
    id: 'f7-15',
    fecha: 7,
    homeTeam: 'Instituto de Córdoba',
    awayTeam: 'San Lorenzo de Almagro',
    dateStr: 'Lunes 31 de Agosto de 2026',
    kickoff: '2026-08-31T21:15:00-03:00',
    displayTime: 'Lunes 31/08 • 21:15 hs',
    stadium: 'Juan Domingo Perón (Alta Córdoba)',
    status: 'SCHEDULED',
  },
];

// Duración estimada de un partido (115 minutos con tiempo añadido)
export const MATCH_DURATION_MS = 115 * 60 * 1000;

/**
 * Calcula el estado dinámico y automático de un partido en función de la hora actual:
 * - SCHEDULED si aún no empezó
 * - LIVE con marcador y minuto exacto (PT 15', Entretiempo, ST 70', etc.) si está en juego
 * - FINISHED si concluyeron los 115 minutos desde el pitazo inicial
 */
export function getDynamicMatchState(match: MatchFixture, currentDate: Date = new Date()): DynamicMatchState {
  const nowMs = currentDate.getTime();
  const kickoffMs = new Date(match.kickoff).getTime();
  const finishMs = kickoffMs + MATCH_DURATION_MS;

  // 1. Partido PROGRAMADO (Aún no empezó)
  if (nowMs < kickoffMs && match.status !== 'FINISHED') {
    return {
      fixture: match,
      status: 'SCHEDULED',
      homeScore: undefined,
      awayScore: undefined,
      liveMinute: match.displayTime,
      isLive: false,
      isFinished: false,
      isScheduled: true,
      visibleEvents: [],
    };
  }

  // 2. Partido EN VIVO (nowMs >= kickoffMs && nowMs < finishMs y no finalizado)
  if (nowMs >= kickoffMs && nowMs < finishMs && match.status !== 'FINISHED') {
    const elapsedMinutes = Math.floor((nowMs - kickoffMs) / 60000);
    let liveMinuteStr = '';

    if (elapsedMinutes <= 45) {
      liveMinuteStr = `PT ${Math.max(1, elapsedMinutes)}'`;
    } else if (elapsedMinutes > 45 && elapsedMinutes <= 60) {
      liveMinuteStr = 'Entretiempo';
    } else if (elapsedMinutes > 60 && elapsedMinutes <= 105) {
      liveMinuteStr = `ST ${elapsedMinutes - 15}'`;
    } else {
      const extra = Math.min(8, elapsedMinutes - 105);
      liveMinuteStr = `ST 90+${extra}'`;
    }

    const effectiveMin = elapsedMinutes <= 45 ? elapsedMinutes : (elapsedMinutes > 60 ? elapsedMinutes - 15 : 45);
    const visibleEvents = (match.events || []).filter(e => e.minute <= effectiveMin);

    let hScore = 0;
    let aScore = 0;
    visibleEvents.forEach(e => {
      if (e.type === 'goal' || e.type === 'penalty_goal') {
        if (e.team === 'home') hScore++;
        if (e.team === 'away') aScore++;
      }
    });

    return {
      fixture: match,
      status: 'LIVE',
      homeScore: hScore,
      awayScore: aScore,
      liveMinute: liveMinuteStr,
      elapsedMinutes,
      isLive: true,
      isFinished: false,
      isScheduled: false,
      visibleEvents,
    };
  }

  // 3. Partido FINALIZADO (nowMs >= finishMs o match.status === 'FINISHED')
  let finalHomeScore = match.homeScore;
  let finalAwayScore = match.awayScore;
  if ((finalHomeScore === undefined || finalAwayScore === undefined) && match.events && match.events.length > 0) {
    let hs = 0;
    let as = 0;
    match.events.forEach(e => {
      if (e.type === 'goal' || e.type === 'penalty_goal') {
        if (e.team === 'home') hs++;
        if (e.team === 'away') as++;
      }
    });
    finalHomeScore = finalHomeScore ?? hs;
    finalAwayScore = finalAwayScore ?? as;
  }

  return {
    fixture: match,
    status: 'FINISHED',
    homeScore: finalHomeScore ?? 0,
    awayScore: finalAwayScore ?? 0,
    liveMinute: match.liveMinute || 'Finalizado',
    isLive: false,
    isFinished: true,
    isScheduled: false,
    visibleEvents: match.events || [],
  };
}

export interface RoundStatusInfo {
  // Información de la fecha objetivo
  roundNumber: number;
  isRoundInPlay: boolean; // True si la fecha arrancó con su 1er partido y aún no terminó el último
  firstMatch: MatchFixture;
  lastMatch: MatchFixture;
  
  // Timer hacia el primer partido (si está pendiente) o hacia el próximo partido inmediato
  timeRemainingMs: number;
  
  // Contadores dinámicos de partidos de la fecha en juego
  finishedMatchesCount: number;
  liveMatchesCount: number;
  scheduledMatchesCount: number;
  totalMatchesCount: number;
  
  // Próximo partido inmediato a jugarse
  nextUpcomingMatch: MatchFixture;
}

/**
 * Agrupa los partidos por número de fecha.
 */
export function getFixturesGroupedByRound(): Record<number, MatchFixture[]> {
  const grouped: Record<number, MatchFixture[]> = {};
  for (const match of FIXTURES_DATA) {
    if (!grouped[match.fecha]) {
      grouped[match.fecha] = [];
    }
    grouped[match.fecha].push(match);
  }
  return grouped;
}

export function getAllAvailableFechas(): number[] {
  const grouped = getFixturesGroupedByRound();
  return Object.keys(grouped).map(Number).sort((a, b) => a - b);
}

export function getRoundFixtures(fechaNum: number): MatchFixture[] {
  return FIXTURES_DATA.filter(m => m.fecha === fechaNum);
}

/**
 * Calcula el estado de la fecha del torneo actual o próxima de manera totalmente automática:
 * - Si la fecha ya comenzó su primer partido y aún hay partidos pendientes o en juego:
 *   marca 'FECHA EN JUEGO' (isRoundInPlay = true).
 * - Una vez que concluye el último partido de la fecha, salta AUTOMÁTICAMENTE a la FECHA SIGUIENTE
 *   y fija el cronómetro con cuenta regresiva hacia el primer partido de dicha fecha nueva.
 */
export function getTournamentRoundStatus(currentDate: Date = new Date()): RoundStatusInfo {
  const nowMs = currentDate.getTime();
  const grouped = getFixturesGroupedByRound();
  const roundNumbers = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  for (const rNum of roundNumbers) {
    const matches = grouped[rNum];
    if (!matches || matches.length === 0) continue;

    // Ordenar partidos de la fecha cronológicamente
    const sortedMatches = [...matches].sort(
      (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
    );

    const firstMatch = sortedMatches[0];
    const lastMatch = sortedMatches[sortedMatches.length - 1];

    const firstKickoffMs = new Date(firstMatch.kickoff).getTime();
    const lastKickoffEndMs = new Date(lastMatch.kickoff).getTime() + MATCH_DURATION_MS;

    // 1. ¿Está la fecha EN JUEGO? (Ya comenzó el primer partido y no terminó el último)
    if (nowMs >= firstKickoffMs && nowMs <= lastKickoffEndMs) {
      let finished = 0;
      let live = 0;
      let scheduled = 0;

      sortedMatches.forEach(m => {
        const state = getDynamicMatchState(m, currentDate);
        if (state.status === 'FINISHED') finished++;
        else if (state.status === 'LIVE') live++;
        else scheduled++;
      });

      // Próximo partido inmediato de esta fecha que esté por disputarse
      const nextMatch = sortedMatches.find(m => new Date(m.kickoff).getTime() > nowMs) || lastMatch;

      return {
        roundNumber: rNum,
        isRoundInPlay: true,
        firstMatch,
        lastMatch,
        timeRemainingMs: Math.max(0, new Date(nextMatch.kickoff).getTime() - nowMs),
        finishedMatchesCount: finished,
        liveMatchesCount: live,
        scheduledMatchesCount: scheduled,
        totalMatchesCount: sortedMatches.length,
        nextUpcomingMatch: nextMatch,
      };
    }

    // 2. ¿Es esta la próxima fecha futura que aún no empezó?
    if (nowMs < firstKickoffMs) {
      return {
        roundNumber: rNum,
        isRoundInPlay: false,
        firstMatch,
        lastMatch,
        timeRemainingMs: Math.max(0, firstKickoffMs - nowMs),
        finishedMatchesCount: 0,
        liveMatchesCount: 0,
        scheduledMatchesCount: sortedMatches.length,
        totalMatchesCount: sortedMatches.length,
        nextUpcomingMatch: firstMatch,
      };
    }
  }

  // Fallback a la última fecha si ya pasaron todas
  const lastRoundNum = roundNumbers[roundNumbers.length - 1];
  const lastRoundMatches = grouped[lastRoundNum];
  const firstM = lastRoundMatches[0];
  const lastM = lastRoundMatches[lastRoundMatches.length - 1];

  return {
    roundNumber: lastRoundNum,
    isRoundInPlay: false,
    firstMatch: firstM,
    lastMatch: lastM,
    timeRemainingMs: 0,
    finishedMatchesCount: lastRoundMatches.length,
    liveMatchesCount: 0,
    scheduledMatchesCount: 0,
    totalMatchesCount: lastRoundMatches.length,
    nextUpcomingMatch: firstM,
  };
}

/**
 * Función compatible para obtener el próximo partido.
 */
export function getNextUpcomingMatch(currentDate: Date = new Date()): {
  match: MatchFixture;
  timeRemainingMs: number;
} {
  const info = getTournamentRoundStatus(currentDate);
  return {
    match: info.isRoundInPlay ? info.nextUpcomingMatch : info.firstMatch,
    timeRemainingMs: info.timeRemainingMs,
  };
}

// ============================================================================
// LIVE FIXTURE SYNCHRONIZATION & EVENT EMITTER
// ============================================================================

type FixtureUpdateListener = (fixtures: MatchFixture[]) => void;
const fixtureListeners: Set<FixtureUpdateListener> = new Set();

export function subscribeToFixturesUpdate(listener: FixtureUpdateListener): () => void {
  fixtureListeners.add(listener);
  return () => {
    fixtureListeners.delete(listener);
  };
}

function notifyFixtureListeners() {
  fixtureListeners.forEach(listener => {
    try {
      listener(FIXTURES_DATA);
    } catch (e) {
      console.warn('Error in fixture listener:', e);
    }
  });
}

/**
 * Actualiza los partidos en memoria en tiempo real con la data recibida de Promiedos
 */
export function updateFixturesFromPromiedos(
  promiedosMatches: Array<{
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
    liveMinute: string;
    displayTime?: string;
    events?: MatchEvent[];
  }>
): boolean {
  if (!promiedosMatches || promiedosMatches.length === 0) return false;

  let hasChanges = false;

  promiedosMatches.forEach(pm => {
    const match = FIXTURES_DATA.find(base => {
      const homeMatch =
        pm.homeTeam.toLowerCase() === base.homeTeam.toLowerCase() ||
        pm.homeTeam.toLowerCase().includes(base.homeTeam.toLowerCase()) ||
        base.homeTeam.toLowerCase().includes(pm.homeTeam.toLowerCase());

      const awayMatch =
        pm.awayTeam.toLowerCase() === base.awayTeam.toLowerCase() ||
        pm.awayTeam.toLowerCase().includes(base.awayTeam.toLowerCase()) ||
        base.awayTeam.toLowerCase().includes(pm.awayTeam.toLowerCase());

      return homeMatch && awayMatch;
    });

    if (match) {
      if (
        match.status !== pm.status ||
        match.homeScore !== pm.homeScore ||
        match.awayScore !== pm.awayScore ||
        match.liveMinute !== pm.liveMinute ||
        (pm.events && pm.events.length > 0 && JSON.stringify(match.events) !== JSON.stringify(pm.events))
      ) {
        match.status = pm.status;
        match.homeScore = pm.homeScore !== undefined ? pm.homeScore : match.homeScore;
        match.awayScore = pm.awayScore !== undefined ? pm.awayScore : match.awayScore;
        match.liveMinute = pm.liveMinute || match.liveMinute;
        if (pm.events && pm.events.length > 0) {
          match.events = pm.events;
        }
        hasChanges = true;
      }
    }
  });

  if (hasChanges) {
    notifyFixtureListeners();
  }

  return hasChanges;
}
