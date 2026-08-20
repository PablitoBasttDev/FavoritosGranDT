export interface MatchFixture {
  id: string;
  fecha: number;
  homeTeam: string;
  awayTeam: string;
  dateStr: string; // ISO or readable
  kickoff: string; // ISO date string for countdown calculation
  displayTime: string;
  stadium?: string;
  isInterzonal?: boolean;
}

// Fechas del Torneo Clausura 2026 de la Liga Profesional de Fútbol AFA
export const FIXTURES_DATA: MatchFixture[] = [
  // FECHA 6 (Interzonal)
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
  },

  // FECHA 7
  {
    id: 'f7-1',
    fecha: 7,
    homeTeam: 'Huracán',
    awayTeam: 'Estudiantes de Río Cuarto',
    dateStr: 'Viernes 28 de Agosto de 2026',
    kickoff: '2026-08-28T19:00:00-03:00',
    displayTime: 'Viernes 28/08 • 19:00 hs',
    stadium: 'Tomás Adolfo Ducó',
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
  },
  {
    id: 'f7-11',
    fecha: 7,
    homeTeam: 'Defensa y Justicia',
    awayTeam: 'Platense',
    dateStr: 'Lunes 31 de Agosto de 2026',
    kickoff: '2026-08-31T19:00:00-03:00',
    displayTime: 'Lunes 31/08 • 19:00 hs',
    stadium: 'Norberto Tomaghello',
  },
  {
    id: 'f7-12',
    fecha: 7,
    homeTeam: 'Estudiantes de La Plata',
    awayTeam: 'Newell\'s Old Boys',
    dateStr: 'Lunes 31 de Agosto de 2026',
    kickoff: '2026-08-31T19:00:00-03:00',
    displayTime: 'Lunes 31/08 • 19:00 hs',
    stadium: 'Jorge Luis Hirschi - UNO',
  },
  {
    id: 'f7-13',
    fecha: 7,
    homeTeam: 'Tigre',
    awayTeam: 'Barracas Central',
    dateStr: 'Lunes 31 de Agosto de 2026',
    kickoff: '2026-08-31T21:15:00-03:00',
    displayTime: 'Lunes 31/08 • 21:15 hs',
    stadium: 'José Dellagiovanna',
  },
  {
    id: 'f7-14',
    fecha: 7,
    homeTeam: 'Instituto de Córdoba',
    awayTeam: 'San Lorenzo de Almagro',
    dateStr: 'Lunes 31 de Agosto de 2026',
    kickoff: '2026-08-31T21:15:00-03:00',
    displayTime: 'Lunes 31/08 • 21:15 hs',
    stadium: 'Juan Domingo Perón (Alta Córdoba)',
  },
];

/**
 * Obtiene el próximo partido a disputarse a partir de la fecha y hora actual.
 */
export function getNextUpcomingMatch(currentDate: Date = new Date()): {
  match: MatchFixture;
  timeRemainingMs: number;
} {
  const nowMs = currentDate.getTime();

  // Find the first match whose kickoff is in the future
  for (const match of FIXTURES_DATA) {
    const kickoffMs = new Date(match.kickoff).getTime();
    if (kickoffMs > nowMs) {
      return {
        match,
        timeRemainingMs: kickoffMs - nowMs,
      };
    }
  }

  // Fallback to the first fixture in list if all passed
  const fallback = FIXTURES_DATA[0];
  const fallbackMs = new Date(fallback.kickoff).getTime();
  return {
    match: fallback,
    timeRemainingMs: Math.max(0, fallbackMs - nowMs),
  };
}
