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
// FIXTURE OFICIAL TORNEO CLAUSURA 2026 - LIGA PROFESIONAL DE FÚTBOL AFA (240 PARTIDOS)
// ============================================================================
export const FIXTURES_DATA: MatchFixture[] = [
  {
    "id": "f1-1",
    "fecha": 1,
    "homeTeam": "Sarmiento de Junín",
    "awayTeam": "Argentinos Juniors",
    "dateStr": "Jueves 23 de Julio de 2026",
    "kickoff": "2026-07-23T19:30:00-03:00",
    "displayTime": "Jueves 23/07 • 19:30 hs",
    "stadium": "Eva Perón (Junín)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 3,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-1-h-1",
        "minute": 30,
        "type": "goal",
        "team": "home",
        "playerName": "Junior Marabel",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-1-a-1",
        "minute": 48,
        "type": "goal",
        "team": "away",
        "playerName": "Alan Lescano",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-1-a-2",
        "minute": 58,
        "type": "goal",
        "team": "away",
        "playerName": "Sebastián Prieto",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-1-h-2",
        "minute": 69,
        "type": "goal",
        "team": "home",
        "playerName": "Renzo Orihuela",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-1-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      },
      {
        "id": "ev-1-1-a-3",
        "minute": 90,
        "type": "goal",
        "team": "away",
        "playerName": "Diego Porcel",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-2",
    "fecha": 1,
    "homeTeam": "Belgrano de Córdoba",
    "awayTeam": "Rosario Central",
    "dateStr": "Jueves 23 de Julio de 2026",
    "kickoff": "2026-07-23T19:30:00-03:00",
    "displayTime": "Jueves 23/07 • 19:30 hs",
    "stadium": "Julio César Villagra - Gigante de Alberdi",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-2-h-1",
        "minute": 36,
        "type": "goal",
        "team": "home",
        "playerName": "Nicolás Fernández",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-2-a-1",
        "minute": 77,
        "type": "goal",
        "team": "away",
        "playerName": "Julián Fernández",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-2-h-2",
        "minute": 88,
        "type": "goal",
        "team": "home",
        "playerName": "Francisco González Metilli",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-3",
    "fecha": 1,
    "homeTeam": "Defensa y Justicia",
    "awayTeam": "Aldosivi",
    "dateStr": "Jueves 23 de Julio de 2026",
    "kickoff": "2026-07-23T21:45:00-03:00",
    "displayTime": "Jueves 23/07 • 21:45 hs",
    "stadium": "Norberto Tomaghello",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-3-a-1",
        "minute": 16,
        "type": "goal",
        "team": "away",
        "playerName": "Nicolás Cordero",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-3-h-1",
        "minute": 29,
        "type": "goal",
        "team": "home",
        "playerName": "David Barbona",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-4",
    "fecha": 1,
    "homeTeam": "Gimnasia y Esgrima de Mendoza",
    "awayTeam": "Central Córdoba de SDE",
    "dateStr": "Viernes 24 de Julio de 2026",
    "kickoff": "2026-07-24T16:45:00-03:00",
    "displayTime": "Viernes 24/07 • 16:45 hs",
    "stadium": "Víctor Antonio Legrotaglie (Mendoza)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-4-h-1",
        "minute": 66,
        "type": "goal",
        "team": "home",
        "playerName": "Agustin Modica",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-5",
    "fecha": 1,
    "homeTeam": "Racing Club",
    "awayTeam": "Gimnasia y Esgrima La Plata",
    "dateStr": "Viernes 24 de Julio de 2026",
    "kickoff": "2026-07-24T19:00:00-03:00",
    "displayTime": "Viernes 24/07 • 19:00 hs",
    "stadium": "Presidente Perón - Cilindro de Avellaneda",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-5-h-1",
        "minute": 6,
        "type": "goal",
        "team": "home",
        "playerName": "Matko Miljevic",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-5-a-1",
        "minute": 32,
        "type": "goal",
        "team": "away",
        "playerName": "Bautista Barros Schelotto",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-5-h-2",
        "minute": 69,
        "type": "goal",
        "team": "home",
        "playerName": "Nazareno Colombo",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-6",
    "fecha": 1,
    "homeTeam": "Vélez Sarsfield",
    "awayTeam": "Instituto de Córdoba",
    "dateStr": "Viernes 24 de Julio de 2026",
    "kickoff": "2026-07-24T19:00:00-03:00",
    "displayTime": "Viernes 24/07 • 19:00 hs",
    "stadium": "José Amalfitani",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-6-h-1",
        "minute": 45,
        "type": "goal",
        "team": "home",
        "playerName": "Manuel Lanzini",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-7",
    "fecha": 1,
    "homeTeam": "Platense",
    "awayTeam": "Unión de Santa Fe",
    "dateStr": "Viernes 24 de Julio de 2026",
    "kickoff": "2026-07-24T21:15:00-03:00",
    "displayTime": "Viernes 24/07 • 21:15 hs",
    "stadium": "Ciudad de Vicente López",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-7-h-1",
        "minute": 24,
        "type": "goal",
        "team": "home",
        "playerName": "Tomas Fagioli",
        "detail": "E.C"
      },
      {
        "id": "ev-1-7-a-1",
        "minute": 72,
        "type": "goal",
        "team": "away",
        "playerName": "Juan Pablo Ludueña",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-7-a-2",
        "minute": 79,
        "type": "penalty_goal",
        "team": "away",
        "playerName": "Cristian Tarragona",
        "detail": "Pen"
      },
      {
        "id": "ev-1-7-h-2",
        "minute": 87,
        "type": "goal",
        "team": "home",
        "playerName": "Bautista Merlini",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-8",
    "fecha": 1,
    "homeTeam": "Huracán",
    "awayTeam": "Banfield",
    "dateStr": "Viernes 24 de Julio de 2026",
    "kickoff": "2026-07-24T21:15:00-03:00",
    "displayTime": "Viernes 24/07 • 21:15 hs",
    "stadium": "Tomás Adolfo Ducó",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-8-h-1",
        "minute": 65,
        "type": "goal",
        "team": "home",
        "playerName": "Jordy Caicedo",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-9",
    "fecha": 1,
    "homeTeam": "Estudiantes de Río Cuarto",
    "awayTeam": "Tigre",
    "dateStr": "Sábado 25 de Julio de 2026",
    "kickoff": "2026-07-25T14:45:00-03:00",
    "displayTime": "Sábado 25/07 • 14:45 hs",
    "stadium": "Antonio Candini (Río Cuarto)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-9-h-1",
        "minute": 70,
        "type": "goal",
        "team": "home",
        "playerName": "Sergio Ojeda",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-10",
    "fecha": 1,
    "homeTeam": "Newell's Old Boys",
    "awayTeam": "Talleres de Córdoba",
    "dateStr": "Sábado 25 de Julio de 2026",
    "kickoff": "2026-07-25T17:00:00-03:00",
    "displayTime": "Sábado 25/07 • 17:00 hs",
    "stadium": "Marcelo Bielsa - Coloso del Parque",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-10-h-1",
        "minute": 55,
        "type": "penalty_goal",
        "team": "home",
        "playerName": "Matias Cóccaro",
        "detail": "Pen"
      },
      {
        "id": "ev-1-10-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      }
    ]
  },
  {
    "id": "f1-11",
    "fecha": 1,
    "homeTeam": "River Plate",
    "awayTeam": "Barracas Central",
    "dateStr": "Sábado 25 de Julio de 2026",
    "kickoff": "2026-07-25T19:15:00-03:00",
    "displayTime": "Sábado 25/07 • 19:15 hs",
    "stadium": "Más Monumental",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-11-a-1",
        "minute": 22,
        "type": "goal",
        "team": "away",
        "playerName": "Gonzalo Morales",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-12",
    "fecha": 1,
    "homeTeam": "Lanús",
    "awayTeam": "San Lorenzo de Almagro",
    "dateStr": "Sábado 25 de Julio de 2026",
    "kickoff": "2026-07-25T21:30:00-03:00",
    "displayTime": "Sábado 25/07 • 21:30 hs",
    "stadium": "Ciudad de Lanús - Néstor Díaz Pérez",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-12-h-1",
        "minute": 65,
        "type": "goal",
        "team": "home",
        "playerName": "Yoshan Valois",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-13",
    "fecha": 1,
    "homeTeam": "Atlético Tucumán",
    "awayTeam": "Independiente Rivadavia",
    "dateStr": "Domingo 26 de Julio de 2026",
    "kickoff": "2026-07-26T15:00:00-03:00",
    "displayTime": "Domingo 26/07 • 15:00 hs",
    "stadium": "Monumental José Fierro",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": []
  },
  {
    "id": "f1-14",
    "fecha": 1,
    "homeTeam": "Estudiantes de La Plata",
    "awayTeam": "Independiente",
    "dateStr": "Domingo 26 de Julio de 2026",
    "kickoff": "2026-07-26T17:15:00-03:00",
    "displayTime": "Domingo 26/07 • 17:15 hs",
    "stadium": "Jorge Luis Hirschi - UNO",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-14-a-1",
        "minute": 76,
        "type": "goal",
        "team": "away",
        "playerName": "Gabriel Ávalos",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-14-a-2",
        "minute": 82,
        "type": "goal",
        "team": "away",
        "playerName": "Santiago Montiel",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f1-15",
    "fecha": 1,
    "homeTeam": "Deportivo Riestra",
    "awayTeam": "Boca Juniors",
    "dateStr": "Domingo 26 de Julio de 2026",
    "kickoff": "2026-07-26T19:30:00-03:00",
    "displayTime": "Domingo 26/07 • 19:30 hs",
    "stadium": "Guillermo Laza",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 3,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-1-15-h-1",
        "minute": 7,
        "type": "goal",
        "team": "home",
        "playerName": "Braian Sánchez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-15-h-2",
        "minute": 23,
        "type": "goal",
        "team": "home",
        "playerName": "Antony Alonso",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-1-15-h-3",
        "minute": 38,
        "type": "goal",
        "team": "home",
        "playerName": "Alexander Díaz",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-1",
    "fecha": 2,
    "homeTeam": "Banfield",
    "awayTeam": "Sarmiento de Junín",
    "dateStr": "Martes 28 de Julio de 2026",
    "kickoff": "2026-07-28T19:00:00-03:00",
    "displayTime": "Martes 28/07 • 19:00 hs",
    "stadium": "Florencio Sola",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 3,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-1-h-1",
        "minute": 53,
        "type": "goal",
        "team": "home",
        "playerName": "Tiziano Perrotta",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-1-h-2",
        "minute": 59,
        "type": "goal",
        "team": "home",
        "playerName": "Tiziano Perrotta",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-1-h-3",
        "minute": 82,
        "type": "penalty_goal",
        "team": "home",
        "playerName": "Bruno Sepúlveda",
        "detail": "Pen"
      },
      {
        "id": "ev-2-1-a-1",
        "minute": 84,
        "type": "goal",
        "team": "away",
        "playerName": "Jonathan Herrera",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-1-a-2",
        "minute": 86,
        "type": "goal",
        "team": "away",
        "playerName": "Junior Marabel",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-2",
    "fecha": 2,
    "homeTeam": "San Lorenzo de Almagro",
    "awayTeam": "Gimnasia y Esgrima de Mendoza",
    "dateStr": "Martes 28 de Julio de 2026",
    "kickoff": "2026-07-28T19:00:00-03:00",
    "displayTime": "Martes 28/07 • 19:00 hs",
    "stadium": "Pedro Bidegain - Nuevo Gasómetro",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-2-h-1",
        "minute": 86,
        "type": "goal",
        "team": "home",
        "playerName": "Rodrigo Auzmendi",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-3",
    "fecha": 2,
    "homeTeam": "Rosario Central",
    "awayTeam": "Racing Club",
    "dateStr": "Martes 28 de Julio de 2026",
    "kickoff": "2026-07-28T21:15:00-03:00",
    "displayTime": "Martes 28/07 • 21:15 hs",
    "stadium": "Gigante de Arroyito",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": []
  },
  {
    "id": "f2-4",
    "fecha": 2,
    "homeTeam": "Argentinos Juniors",
    "awayTeam": "Estudiantes de Río Cuarto",
    "dateStr": "Martes 28 de Julio de 2026",
    "kickoff": "2026-07-28T21:15:00-03:00",
    "displayTime": "Martes 28/07 • 21:15 hs",
    "stadium": "Diego Armando Maradona",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 3,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-4-h-1",
        "minute": 30,
        "type": "goal",
        "team": "home",
        "playerName": "Gastón Verón",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-4-h-2",
        "minute": 70,
        "type": "goal",
        "team": "home",
        "playerName": "Matías Giménez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-4-h-3",
        "minute": 88,
        "type": "goal",
        "team": "home",
        "playerName": "Hernán López Muñoz",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-5",
    "fecha": 2,
    "homeTeam": "Barracas Central",
    "awayTeam": "Aldosivi",
    "dateStr": "Miércoles 29 de Julio de 2026",
    "kickoff": "2026-07-29T14:30:00-03:00",
    "displayTime": "Miércoles 29/07 • 14:30 hs",
    "stadium": "Claudio Fabián Tapia",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-5-h-1",
        "minute": 40,
        "type": "goal",
        "team": "home",
        "playerName": "Tomás Porra",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-6",
    "fecha": 2,
    "homeTeam": "Defensa y Justicia",
    "awayTeam": "Deportivo Riestra",
    "dateStr": "Miércoles 29 de Julio de 2026",
    "kickoff": "2026-07-29T17:00:00-03:00",
    "displayTime": "Miércoles 29/07 • 17:00 hs",
    "stadium": "Norberto Tomaghello",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-6-h-1",
        "minute": 23,
        "type": "goal",
        "team": "home",
        "playerName": "Juan Gutiérrez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-6-h-2",
        "minute": 37,
        "type": "goal",
        "team": "home",
        "playerName": "David Barbona",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-6-a-1",
        "minute": 72,
        "type": "goal",
        "team": "away",
        "playerName": "Tomás González",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-7",
    "fecha": 2,
    "homeTeam": "Gimnasia y Esgrima La Plata",
    "awayTeam": "River Plate",
    "dateStr": "Miércoles 29 de Julio de 2026",
    "kickoff": "2026-07-29T19:15:00-03:00",
    "displayTime": "Miércoles 29/07 • 19:15 hs",
    "stadium": "Juan Carmelo Zerillo - El Bosque",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-7-h-1",
        "minute": 80,
        "type": "goal",
        "team": "home",
        "playerName": "Alexis Steimbach",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-8",
    "fecha": 2,
    "homeTeam": "Instituto de Córdoba",
    "awayTeam": "Platense",
    "dateStr": "Miércoles 29 de Julio de 2026",
    "kickoff": "2026-07-29T21:30:00-03:00",
    "displayTime": "Miércoles 29/07 • 21:30 hs",
    "stadium": "Juan Domingo Perón (Alta Córdoba)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-8-h-1",
        "minute": 13,
        "type": "goal",
        "team": "home",
        "playerName": "Giuliano Cerato",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-8-h-2",
        "minute": 55,
        "type": "goal",
        "team": "home",
        "playerName": "Matías Tissera",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-8-a-1",
        "minute": 90,
        "type": "goal",
        "team": "away",
        "playerName": "Héctor Bobadilla",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-9",
    "fecha": 2,
    "homeTeam": "Independiente Rivadavia",
    "awayTeam": "Huracán",
    "dateStr": "Jueves 30 de Julio de 2026",
    "kickoff": "2026-07-30T19:00:00-03:00",
    "displayTime": "Jueves 30/07 • 19:00 hs",
    "stadium": "Bautista Gargantini (Mendoza)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-9-h-1",
        "minute": 22,
        "type": "goal",
        "team": "home",
        "playerName": "Álex Arce",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-9-h-2",
        "minute": 45,
        "type": "goal",
        "team": "home",
        "playerName": "Jose Florentín",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-9-a-1",
        "minute": 47,
        "type": "goal",
        "team": "away",
        "playerName": "Oscar Cortés",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-9-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      }
    ]
  },
  {
    "id": "f2-10",
    "fecha": 2,
    "homeTeam": "Talleres de Córdoba",
    "awayTeam": "Vélez Sarsfield",
    "dateStr": "Jueves 30 de Julio de 2026",
    "kickoff": "2026-07-30T19:00:00-03:00",
    "displayTime": "Jueves 30/07 • 19:00 hs",
    "stadium": "Mario Alberto Kempes",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 3,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-10-h-1",
        "minute": 27,
        "type": "goal",
        "team": "home",
        "playerName": "Ronaldo Martínez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-10-a-1",
        "minute": 45,
        "type": "goal",
        "team": "away",
        "playerName": "Rodrigo Aliendro",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-10-a-2",
        "minute": 79,
        "type": "goal",
        "team": "away",
        "playerName": "Thiago Silvero",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-10-a-3",
        "minute": 90,
        "type": "goal",
        "team": "away",
        "playerName": "Diego Valdes",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-11",
    "fecha": 2,
    "homeTeam": "Independiente",
    "awayTeam": "Newell's Old Boys",
    "dateStr": "Jueves 30 de Julio de 2026",
    "kickoff": "2026-07-30T21:15:00-03:00",
    "displayTime": "Jueves 30/07 • 21:15 hs",
    "stadium": "Libertadores de América - Ricardo E. Bochini",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-11-h-1",
        "minute": 41,
        "type": "goal",
        "team": "home",
        "playerName": "Santiago Montiel",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-12",
    "fecha": 2,
    "homeTeam": "Central Córdoba de SDE",
    "awayTeam": "Atlético Tucumán",
    "dateStr": "Jueves 30 de Julio de 2026",
    "kickoff": "2026-07-30T21:15:00-03:00",
    "displayTime": "Jueves 30/07 • 21:15 hs",
    "stadium": "Madre de Ciudades (Santiago del Estero)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-12-a-1",
        "minute": 63,
        "type": "goal",
        "team": "away",
        "playerName": "Leandro Diaz",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-12-a-2",
        "minute": 90,
        "type": "goal",
        "team": "away",
        "playerName": "Leandro Diaz",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-13",
    "fecha": 2,
    "homeTeam": "Boca Juniors",
    "awayTeam": "Estudiantes de La Plata",
    "dateStr": "Miércoles 5 de Agosto de 2026",
    "kickoff": "2026-08-05T19:00:00-03:00",
    "displayTime": "Miércoles 05/08 • 19:00 hs",
    "stadium": "Alberto J. Armando - La Bombonera",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-13-h-1",
        "minute": 45,
        "type": "goal",
        "team": "home",
        "playerName": "Santiago Ascacibar",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f2-14",
    "fecha": 2,
    "homeTeam": "Tigre",
    "awayTeam": "Belgrano de Córdoba",
    "dateStr": "Miércoles 5 de Agosto de 2026",
    "kickoff": "2026-08-05T21:15:00-03:00",
    "displayTime": "Miércoles 05/08 • 21:15 hs",
    "stadium": "José Dellagiovanna (Victoria)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-14-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      }
    ]
  },
  {
    "id": "f2-15",
    "fecha": 2,
    "homeTeam": "Unión de Santa Fe",
    "awayTeam": "Lanús",
    "dateStr": "Jueves 6 de Agosto de 2026",
    "kickoff": "2026-08-06T19:00:00-03:00",
    "displayTime": "Jueves 06/08 • 19:00 hs",
    "stadium": "15 de Abril (Santa Fe)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-2-15-h-1",
        "minute": 53,
        "type": "goal",
        "team": "home",
        "playerName": "Lucas Menossi",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-15-a-1",
        "minute": 73,
        "type": "goal",
        "team": "away",
        "playerName": "Felipe Peña Biafore",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-2-15-h-2",
        "minute": 76,
        "type": "goal",
        "team": "home",
        "playerName": "Joaquín Mosqueira",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-1",
    "fecha": 3,
    "homeTeam": "Estudiantes de Río Cuarto",
    "awayTeam": "Banfield",
    "dateStr": "Sábado 1 de Agosto de 2026",
    "kickoff": "2026-08-01T15:30:00-03:00",
    "displayTime": "Sábado 01/08 • 15:30 hs",
    "stadium": "Antonio Candini (Río Cuarto)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": []
  },
  {
    "id": "f3-2",
    "fecha": 3,
    "homeTeam": "Gimnasia y Esgrima de Mendoza",
    "awayTeam": "Unión de Santa Fe",
    "dateStr": "Sábado 1 de Agosto de 2026",
    "kickoff": "2026-08-01T15:30:00-03:00",
    "displayTime": "Sábado 01/08 • 15:30 hs",
    "stadium": "Víctor Antonio Legrotaglie (Mendoza)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-2-h-1",
        "minute": 45,
        "type": "penalty_goal",
        "team": "home",
        "playerName": "Agustin Modica",
        "detail": "Pen"
      },
      {
        "id": "ev-3-2-h-2",
        "minute": 50,
        "type": "goal",
        "team": "home",
        "playerName": "Agustin Modica",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-3",
    "fecha": 3,
    "homeTeam": "Belgrano de Córdoba",
    "awayTeam": "Argentinos Juniors",
    "dateStr": "Sábado 1 de Agosto de 2026",
    "kickoff": "2026-08-01T18:00:00-03:00",
    "displayTime": "Sábado 01/08 • 18:00 hs",
    "stadium": "Julio César Villagra - Gigante de Alberdi",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-3-a-1",
        "minute": 45,
        "type": "goal",
        "team": "away",
        "playerName": "Francisco Álvarez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-3-h-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "home",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      }
    ]
  },
  {
    "id": "f3-4",
    "fecha": 3,
    "homeTeam": "Estudiantes de La Plata",
    "awayTeam": "Defensa y Justicia",
    "dateStr": "Sábado 1 de Agosto de 2026",
    "kickoff": "2026-08-01T18:00:00-03:00",
    "displayTime": "Sábado 01/08 • 18:00 hs",
    "stadium": "Jorge Luis Hirschi - UNO",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 3,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-4-h-1",
        "minute": 9,
        "type": "goal",
        "team": "home",
        "playerName": "Guido Carrillo",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-4-h-2",
        "minute": 16,
        "type": "goal",
        "team": "home",
        "playerName": "Ezequiel Piovi",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-4-h-3",
        "minute": 36,
        "type": "goal",
        "team": "home",
        "playerName": "Tomás Palacios",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-5",
    "fecha": 3,
    "homeTeam": "Racing Club",
    "awayTeam": "Tigre",
    "dateStr": "Sábado 1 de Agosto de 2026",
    "kickoff": "2026-08-01T20:30:00-03:00",
    "displayTime": "Sábado 01/08 • 20:30 hs",
    "stadium": "Presidente Perón - Cilindro de Avellaneda",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 3,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-5-a-1",
        "minute": 19,
        "type": "goal",
        "team": "away",
        "playerName": "Gonzalo Martínez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-5-a-2",
        "minute": 26,
        "type": "goal",
        "team": "away",
        "playerName": "Martín Garay",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-5-a-3",
        "minute": 51,
        "type": "goal",
        "team": "away",
        "playerName": "Ignacio Russo",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-5-h-1",
        "minute": 65,
        "type": "goal",
        "team": "home",
        "playerName": "Duván Vergara",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-6",
    "fecha": 3,
    "homeTeam": "Aldosivi",
    "awayTeam": "Gimnasia y Esgrima La Plata",
    "dateStr": "Domingo 2 de Agosto de 2026",
    "kickoff": "2026-08-02T14:30:00-03:00",
    "displayTime": "Domingo 02/08 • 14:30 hs",
    "stadium": "José María Minella (Mar del Plata)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-6-a-1",
        "minute": 40,
        "type": "goal",
        "team": "away",
        "playerName": "Agustín Auzmendi",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-6-a-2",
        "minute": 66,
        "type": "goal",
        "team": "away",
        "playerName": "Agustín Colazo",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-6-h-1",
        "minute": 78,
        "type": "goal",
        "team": "home",
        "playerName": "Nico Gaitán",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-7",
    "fecha": 3,
    "homeTeam": "Deportivo Riestra",
    "awayTeam": "Barracas Central",
    "dateStr": "Domingo 2 de Agosto de 2026",
    "kickoff": "2026-08-02T14:30:00-03:00",
    "displayTime": "Domingo 02/08 • 14:30 hs",
    "stadium": "Guillermo Laza",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-7-a-1",
        "minute": 72,
        "type": "goal",
        "team": "away",
        "playerName": "Gonzalo Maroni",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-8",
    "fecha": 3,
    "homeTeam": "Newell's Old Boys",
    "awayTeam": "Boca Juniors",
    "dateStr": "Domingo 2 de Agosto de 2026",
    "kickoff": "2026-08-02T17:00:00-03:00",
    "displayTime": "Domingo 02/08 • 17:00 hs",
    "stadium": "Marcelo Bielsa - Coloso del Parque",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-8-a-1",
        "minute": 30,
        "type": "goal",
        "team": "away",
        "playerName": "Santiago Ascacibar",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-8-h-1",
        "minute": 50,
        "type": "goal",
        "team": "home",
        "playerName": "Matias Cóccaro",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-8-h-2",
        "minute": 59,
        "type": "goal",
        "team": "home",
        "playerName": "Luca Regiardo",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-8-a-2",
        "minute": 81,
        "type": "goal",
        "team": "away",
        "playerName": "Alan Velasco",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-9",
    "fecha": 3,
    "homeTeam": "River Plate",
    "awayTeam": "Rosario Central",
    "dateStr": "Domingo 2 de Agosto de 2026",
    "kickoff": "2026-08-02T19:15:00-03:00",
    "displayTime": "Domingo 02/08 • 19:15 hs",
    "stadium": "Más Monumental",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-9-a-1",
        "minute": 27,
        "type": "goal",
        "team": "away",
        "playerName": "Nicolás Otamendi",
        "detail": "E.C"
      },
      {
        "id": "ev-3-9-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      }
    ]
  },
  {
    "id": "f3-10",
    "fecha": 3,
    "homeTeam": "Lanús",
    "awayTeam": "Instituto de Córdoba",
    "dateStr": "Domingo 2 de Agosto de 2026",
    "kickoff": "2026-08-02T21:30:00-03:00",
    "displayTime": "Domingo 02/08 • 21:30 hs",
    "stadium": "Ciudad de Lanús - Néstor Díaz Pérez",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-10-a-1",
        "minute": 90,
        "type": "goal",
        "team": "away",
        "playerName": "Fernando Alarcón",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-11",
    "fecha": 3,
    "homeTeam": "Sarmiento de Junín",
    "awayTeam": "Independiente Rivadavia",
    "dateStr": "Lunes 3 de Agosto de 2026",
    "kickoff": "2026-08-03T16:45:00-03:00",
    "displayTime": "Lunes 03/08 • 16:45 hs",
    "stadium": "Eva Perón (Junín)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-11-h-1",
        "minute": 12,
        "type": "goal",
        "team": "home",
        "playerName": "Mauricio Martínez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-11-a-1",
        "minute": 31,
        "type": "goal",
        "team": "away",
        "playerName": "Matías Fernández",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-11-h-2",
        "minute": 37,
        "type": "goal",
        "team": "home",
        "playerName": "Julian Mavilla",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-12",
    "fecha": 3,
    "homeTeam": "Platense",
    "awayTeam": "Talleres de Córdoba",
    "dateStr": "Lunes 3 de Agosto de 2026",
    "kickoff": "2026-08-03T19:00:00-03:00",
    "displayTime": "Lunes 03/08 • 19:00 hs",
    "stadium": "Ciudad de Vicente López",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 4,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-12-a-1",
        "minute": 43,
        "type": "goal",
        "team": "away",
        "playerName": "Rick",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-12-a-2",
        "minute": 69,
        "type": "goal",
        "team": "away",
        "playerName": "Valentín Depietri",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-12-a-3",
        "minute": 74,
        "type": "goal",
        "team": "away",
        "playerName": "Rick",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-3-12-a-4",
        "minute": 77,
        "type": "goal",
        "team": "away",
        "playerName": "Franco Cristaldo",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-13",
    "fecha": 3,
    "homeTeam": "Vélez Sarsfield",
    "awayTeam": "Independiente",
    "dateStr": "Lunes 3 de Agosto de 2026",
    "kickoff": "2026-08-03T19:00:00-03:00",
    "displayTime": "Lunes 03/08 • 19:00 hs",
    "stadium": "José Amalfitani",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-13-h-1",
        "minute": 70,
        "type": "goal",
        "team": "home",
        "playerName": "Thiago Aguirre",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f3-14",
    "fecha": 3,
    "homeTeam": "Huracán",
    "awayTeam": "Atlético Tucumán",
    "dateStr": "Lunes 3 de Agosto de 2026",
    "kickoff": "2026-08-03T21:15:00-03:00",
    "displayTime": "Lunes 03/08 • 21:15 hs",
    "stadium": "Tomás Adolfo Ducó",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": []
  },
  {
    "id": "f3-15",
    "fecha": 3,
    "homeTeam": "Central Córdoba de SDE",
    "awayTeam": "San Lorenzo de Almagro",
    "dateStr": "Lunes 3 de Agosto de 2026",
    "kickoff": "2026-08-03T21:15:00-03:00",
    "displayTime": "Lunes 03/08 • 21:15 hs",
    "stadium": "Madre de Ciudades (Santiago del Estero)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-3-15-h-1",
        "minute": 31,
        "type": "goal",
        "team": "home",
        "playerName": "Michael Santos",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-1",
    "fecha": 4,
    "homeTeam": "Rosario Central",
    "awayTeam": "Aldosivi",
    "dateStr": "Viernes 7 de Agosto de 2026",
    "kickoff": "2026-08-07T19:30:00-03:00",
    "displayTime": "Viernes 07/08 • 19:30 hs",
    "stadium": "Gigante de Arroyito",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-1-a-1",
        "minute": 52,
        "type": "goal",
        "team": "away",
        "playerName": "Alan Sosa",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-1-h-1",
        "minute": 61,
        "type": "goal",
        "team": "home",
        "playerName": "Nicolás Zalazar",
        "detail": "E.C"
      },
      {
        "id": "ev-4-1-h-2",
        "minute": 80,
        "type": "goal",
        "team": "home",
        "playerName": "Jáminton Campaz",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-2",
    "fecha": 4,
    "homeTeam": "Independiente Rivadavia",
    "awayTeam": "Estudiantes de Río Cuarto",
    "dateStr": "Viernes 7 de Agosto de 2026",
    "kickoff": "2026-08-07T21:45:00-03:00",
    "displayTime": "Viernes 07/08 • 21:45 hs",
    "stadium": "Bautista Gargantini (Mendoza)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-2-h-1",
        "minute": 71,
        "type": "penalty_goal",
        "team": "home",
        "playerName": "Álex Arce",
        "detail": "Pen"
      },
      {
        "id": "ev-4-2-h-2",
        "minute": 80,
        "type": "goal",
        "team": "home",
        "playerName": "Álex Arce",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-2-a-1",
        "minute": 88,
        "type": "goal",
        "team": "away",
        "playerName": "Gabriel Alanís",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-3",
    "fecha": 4,
    "homeTeam": "Atlético Tucumán",
    "awayTeam": "Sarmiento de Junín",
    "dateStr": "Sábado 8 de Agosto de 2026",
    "kickoff": "2026-08-08T14:45:00-03:00",
    "displayTime": "Sábado 08/08 • 14:45 hs",
    "stadium": "Monumental José Fierro",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-3-a-1",
        "minute": 69,
        "type": "penalty_goal",
        "team": "away",
        "playerName": "Junior Marabel",
        "detail": "Pen"
      },
      {
        "id": "ev-4-3-a-2",
        "minute": 71,
        "type": "goal",
        "team": "away",
        "playerName": "Julian Mavilla",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-3-h-1",
        "minute": 81,
        "type": "goal",
        "team": "home",
        "playerName": "Luciano Vallejo",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-4",
    "fecha": 4,
    "homeTeam": "Deportivo Riestra",
    "awayTeam": "Estudiantes de La Plata",
    "dateStr": "Sábado 8 de Agosto de 2026",
    "kickoff": "2026-08-08T14:45:00-03:00",
    "displayTime": "Sábado 08/08 • 14:45 hs",
    "stadium": "Guillermo Laza",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-4-h-1",
        "minute": 12,
        "type": "penalty_goal",
        "team": "home",
        "playerName": "Milton Celiz",
        "detail": "Pen"
      },
      {
        "id": "ev-4-4-h-2",
        "minute": 73,
        "type": "goal",
        "team": "home",
        "playerName": "Antony Alonso",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-5",
    "fecha": 4,
    "homeTeam": "Tigre",
    "awayTeam": "River Plate",
    "dateStr": "Sábado 8 de Agosto de 2026",
    "kickoff": "2026-08-08T17:00:00-03:00",
    "displayTime": "Sábado 08/08 • 17:00 hs",
    "stadium": "José Dellagiovanna (Victoria)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-5-h-1",
        "minute": 78,
        "type": "goal",
        "team": "home",
        "playerName": "Ignacio Russo",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-6",
    "fecha": 4,
    "homeTeam": "Boca Juniors",
    "awayTeam": "Vélez Sarsfield",
    "dateStr": "Sábado 8 de Agosto de 2026",
    "kickoff": "2026-08-08T19:15:00-03:00",
    "displayTime": "Sábado 08/08 • 19:15 hs",
    "stadium": "Alberto J. Armando - La Bombonera",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-6-a-1",
        "minute": 12,
        "type": "goal",
        "team": "away",
        "playerName": "Diego Valdes",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-6-h-1",
        "minute": 39,
        "type": "goal",
        "team": "home",
        "playerName": "Santiago Ascacibar",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-7",
    "fecha": 4,
    "homeTeam": "Independiente",
    "awayTeam": "Platense",
    "dateStr": "Sábado 8 de Agosto de 2026",
    "kickoff": "2026-08-08T21:30:00-03:00",
    "displayTime": "Sábado 08/08 • 21:30 hs",
    "stadium": "Libertadores de América - Ricardo E. Bochini",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-7-a-1",
        "minute": 65,
        "type": "goal",
        "team": "away",
        "playerName": "Guido Mainero",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-8",
    "fecha": 4,
    "homeTeam": "Instituto de Córdoba",
    "awayTeam": "Gimnasia y Esgrima de Mendoza",
    "dateStr": "Sábado 8 de Agosto de 2026",
    "kickoff": "2026-08-08T21:30:00-03:00",
    "displayTime": "Sábado 08/08 • 21:30 hs",
    "stadium": "Juan Domingo Perón (Alta Córdoba)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-8-h-1",
        "minute": 80,
        "type": "goal",
        "team": "home",
        "playerName": "Alex Luna",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-9",
    "fecha": 4,
    "homeTeam": "San Lorenzo de Almagro",
    "awayTeam": "Huracán",
    "dateStr": "Domingo 9 de Agosto de 2026",
    "kickoff": "2026-08-09T15:00:00-03:00",
    "displayTime": "Domingo 09/08 • 15:00 hs",
    "stadium": "Pedro Bidegain - Nuevo Gasómetro",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-9-a-1",
        "minute": 45,
        "type": "goal",
        "team": "away",
        "playerName": "Jordy Caicedo",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-9-a-2",
        "minute": 57,
        "type": "goal",
        "team": "away",
        "playerName": "Jordy Caicedo",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-9-h-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "home",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      }
    ]
  },
  {
    "id": "f4-10",
    "fecha": 4,
    "homeTeam": "Gimnasia y Esgrima La Plata",
    "awayTeam": "Barracas Central",
    "dateStr": "Domingo 9 de Agosto de 2026",
    "kickoff": "2026-08-09T17:45:00-03:00",
    "displayTime": "Domingo 09/08 • 17:45 hs",
    "stadium": "Juan Carmelo Zerillo - El Bosque",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-10-h-1",
        "minute": 46,
        "type": "goal",
        "team": "home",
        "playerName": "Agustín Colazo",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-10-h-2",
        "minute": 90,
        "type": "goal",
        "team": "home",
        "playerName": "Franco Torres",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-11",
    "fecha": 4,
    "homeTeam": "Defensa y Justicia",
    "awayTeam": "Newell's Old Boys",
    "dateStr": "Domingo 9 de Agosto de 2026",
    "kickoff": "2026-08-09T17:45:00-03:00",
    "displayTime": "Domingo 09/08 • 17:45 hs",
    "stadium": "Norberto Tomaghello",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-11-h-1",
        "minute": 32,
        "type": "goal",
        "team": "home",
        "playerName": "Fernando Román",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-11-h-2",
        "minute": 68,
        "type": "goal",
        "team": "home",
        "playerName": "Tomás Pérez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-11-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      },
      {
        "id": "ev-4-11-a-1",
        "minute": 83,
        "type": "goal",
        "team": "away",
        "playerName": "Bruno Cabrera",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-12",
    "fecha": 4,
    "homeTeam": "Argentinos Juniors",
    "awayTeam": "Racing Club",
    "dateStr": "Domingo 9 de Agosto de 2026",
    "kickoff": "2026-08-09T20:15:00-03:00",
    "displayTime": "Domingo 09/08 • 20:15 hs",
    "stadium": "Diego Armando Maradona",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-12-h-1",
        "minute": 9,
        "type": "goal",
        "team": "home",
        "playerName": "Tomás Molina",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-12-a-1",
        "minute": 28,
        "type": "goal",
        "team": "away",
        "playerName": "Ezequiel Cannavo",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-12-h-2",
        "minute": 77,
        "type": "goal",
        "team": "home",
        "playerName": "Hernán López Muñoz",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-12-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      }
    ]
  },
  {
    "id": "f4-13",
    "fecha": 4,
    "homeTeam": "Banfield",
    "awayTeam": "Belgrano de Córdoba",
    "dateStr": "Lunes 10 de Agosto de 2026",
    "kickoff": "2026-08-10T19:00:00-03:00",
    "displayTime": "Lunes 10/08 • 19:00 hs",
    "stadium": "Florencio Sola",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-13-a-1",
        "minute": 48,
        "type": "goal",
        "team": "away",
        "playerName": "Lucas Passerini",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-13-a-2",
        "minute": 61,
        "type": "goal",
        "team": "away",
        "playerName": "Lisandro López",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-14",
    "fecha": 4,
    "homeTeam": "Unión de Santa Fe",
    "awayTeam": "Central Córdoba de SDE",
    "dateStr": "Lunes 10 de Agosto de 2026",
    "kickoff": "2026-08-10T21:15:00-03:00",
    "displayTime": "Lunes 10/08 • 21:15 hs",
    "stadium": "15 de Abril (Santa Fe)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-14-h-1",
        "minute": 17,
        "type": "goal",
        "team": "home",
        "playerName": "Lucas Menossi",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-14-a-1",
        "minute": 51,
        "type": "goal",
        "team": "away",
        "playerName": "Michael Santos",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-14-a-2",
        "minute": 54,
        "type": "goal",
        "team": "away",
        "playerName": "Facundo Mansilla",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f4-15",
    "fecha": 4,
    "homeTeam": "Talleres de Córdoba",
    "awayTeam": "Lanús",
    "dateStr": "Martes 11 de Agosto de 2026",
    "kickoff": "2026-08-11T21:00:00-03:00",
    "displayTime": "Martes 11/08 • 21:00 hs",
    "stadium": "Mario Alberto Kempes",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 3,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-4-15-a-1",
        "minute": 74,
        "type": "goal",
        "team": "away",
        "playerName": "Dylan Aquino",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-15-a-2",
        "minute": 79,
        "type": "goal",
        "team": "away",
        "playerName": "Yoshan Valois",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-4-15-a-3",
        "minute": 87,
        "type": "goal",
        "team": "away",
        "playerName": "Yoshan Valois",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-1",
    "fecha": 5,
    "homeTeam": "Racing Club",
    "awayTeam": "Banfield",
    "dateStr": "Viernes 14 de Agosto de 2026",
    "kickoff": "2026-08-14T20:30:00-03:00",
    "displayTime": "Viernes 14/08 • 20:30 hs",
    "stadium": "Presidente Perón - Cilindro de Avellaneda",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-1-a-1",
        "minute": 24,
        "type": "goal",
        "team": "away",
        "playerName": "Alexander Machado",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-2",
    "fecha": 5,
    "homeTeam": "Aldosivi",
    "awayTeam": "Tigre",
    "dateStr": "Sábado 15 de Agosto de 2026",
    "kickoff": "2026-08-15T14:30:00-03:00",
    "displayTime": "Sábado 15/08 • 14:30 hs",
    "stadium": "José María Minella (Mar del Plata)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-2-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      }
    ]
  },
  {
    "id": "f5-3",
    "fecha": 5,
    "homeTeam": "San Lorenzo de Almagro",
    "awayTeam": "Unión de Santa Fe",
    "dateStr": "Sábado 15 de Agosto de 2026",
    "kickoff": "2026-08-15T14:30:00-03:00",
    "displayTime": "Sábado 15/08 • 14:30 hs",
    "stadium": "Pedro Bidegain - Nuevo Gasómetro",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-3-h-1",
        "minute": 64,
        "type": "goal",
        "team": "home",
        "playerName": "Rodrigo Auzmendi",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-4",
    "fecha": 5,
    "homeTeam": "Estudiantes de La Plata",
    "awayTeam": "Gimnasia y Esgrima La Plata",
    "dateStr": "Sábado 15 de Agosto de 2026",
    "kickoff": "2026-08-15T16:45:00-03:00",
    "displayTime": "Sábado 15/08 • 16:45 hs",
    "stadium": "Jorge Luis Hirschi - UNO",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 4,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-4-h-1",
        "minute": 43,
        "type": "goal",
        "team": "home",
        "playerName": "Eros Mancuso",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-4-h-2",
        "minute": 60,
        "type": "goal",
        "team": "home",
        "playerName": "Tiago Palacios",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-4-h-3",
        "minute": 70,
        "type": "goal",
        "team": "home",
        "playerName": "Joaquín Tobio Burgos",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-4-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      },
      {
        "id": "ev-5-4-a-red-2",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      },
      {
        "id": "ev-5-4-h-4",
        "minute": 84,
        "type": "goal",
        "team": "home",
        "playerName": "Alexis Castro",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-5",
    "fecha": 5,
    "homeTeam": "Belgrano de Córdoba",
    "awayTeam": "Independiente Rivadavia",
    "dateStr": "Sábado 15 de Agosto de 2026",
    "kickoff": "2026-08-15T19:00:00-03:00",
    "displayTime": "Sábado 15/08 • 19:00 hs",
    "stadium": "Julio César Villagra - Gigante de Alberdi",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-5-h-1",
        "minute": 42,
        "type": "goal",
        "team": "home",
        "playerName": "Tomas Bottari",
        "detail": "E.C"
      },
      {
        "id": "ev-5-5-h-2",
        "minute": 46,
        "type": "goal",
        "team": "home",
        "playerName": "Emiliano Rigoni",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-6",
    "fecha": 5,
    "homeTeam": "Newell's Old Boys",
    "awayTeam": "Deportivo Riestra",
    "dateStr": "Sábado 15 de Agosto de 2026",
    "kickoff": "2026-08-15T19:00:00-03:00",
    "displayTime": "Sábado 15/08 • 19:00 hs",
    "stadium": "Marcelo Bielsa - Coloso del Parque",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-6-h-1",
        "minute": 67,
        "type": "goal",
        "team": "home",
        "playerName": "Facundo Guch",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-6-h-2",
        "minute": 85,
        "type": "goal",
        "team": "home",
        "playerName": "Walter Mazzantti",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-7",
    "fecha": 5,
    "homeTeam": "Platense",
    "awayTeam": "Boca Juniors",
    "dateStr": "Sábado 15 de Agosto de 2026",
    "kickoff": "2026-08-15T21:15:00-03:00",
    "displayTime": "Sábado 15/08 • 21:15 hs",
    "stadium": "Ciudad de Vicente López",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-7-h-1",
        "minute": 53,
        "type": "goal",
        "team": "home",
        "playerName": "Nicolas Retamar",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-7-a-1",
        "minute": 80,
        "type": "goal",
        "team": "away",
        "playerName": "Miguel Merentiel",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-8",
    "fecha": 5,
    "homeTeam": "Sarmiento de Junín",
    "awayTeam": "Huracán",
    "dateStr": "Domingo 16 de Agosto de 2026",
    "kickoff": "2026-08-16T15:00:00-03:00",
    "displayTime": "Domingo 16/08 • 15:00 hs",
    "stadium": "Eva Perón (Junín)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-8-h-1",
        "minute": 30,
        "type": "goal",
        "team": "home",
        "playerName": "Junior Marabel",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-8-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      },
      {
        "id": "ev-5-8-h-2",
        "minute": 86,
        "type": "goal",
        "team": "home",
        "playerName": "Lucas Suarez",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-9",
    "fecha": 5,
    "homeTeam": "River Plate",
    "awayTeam": "Argentinos Juniors",
    "dateStr": "Domingo 16 de Agosto de 2026",
    "kickoff": "2026-08-16T18:00:00-03:00",
    "displayTime": "Domingo 16/08 • 18:00 hs",
    "stadium": "Más Monumental",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-9-h-1",
        "minute": 37,
        "type": "goal",
        "team": "home",
        "playerName": "Gonzalo Montiel",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-9-h-2",
        "minute": 89,
        "type": "penalty_goal",
        "team": "home",
        "playerName": "Angel Correa",
        "detail": "Pen"
      }
    ]
  },
  {
    "id": "f5-10",
    "fecha": 5,
    "homeTeam": "Barracas Central",
    "awayTeam": "Rosario Central",
    "dateStr": "Domingo 16 de Agosto de 2026",
    "kickoff": "2026-08-16T20:15:00-03:00",
    "displayTime": "Domingo 16/08 • 20:15 hs",
    "stadium": "Claudio Fabián Tapia",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-10-a-1",
        "minute": 39,
        "type": "goal",
        "team": "away",
        "playerName": "Alan Rodriguez",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-11",
    "fecha": 5,
    "homeTeam": "Central Córdoba de SDE",
    "awayTeam": "Instituto de Córdoba",
    "dateStr": "Domingo 16 de Agosto de 2026",
    "kickoff": "2026-08-16T20:15:00-03:00",
    "displayTime": "Domingo 16/08 • 20:15 hs",
    "stadium": "Madre de Ciudades (Santiago del Estero)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-11-a-1",
        "minute": 89,
        "type": "goal",
        "team": "away",
        "playerName": "Facundo Suárez",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-12",
    "fecha": 5,
    "homeTeam": "Estudiantes de Río Cuarto",
    "awayTeam": "Atlético Tucumán",
    "dateStr": "Lunes 17 de Agosto de 2026",
    "kickoff": "2026-08-17T14:45:00-03:00",
    "displayTime": "Lunes 17/08 • 14:45 hs",
    "stadium": "Antonio Candini (Río Cuarto)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-12-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      },
      {
        "id": "ev-5-12-a-1",
        "minute": 82,
        "type": "goal",
        "team": "away",
        "playerName": "Clever Ferreira",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-13",
    "fecha": 5,
    "homeTeam": "Lanús",
    "awayTeam": "Independiente",
    "dateStr": "Lunes 17 de Agosto de 2026",
    "kickoff": "2026-08-17T17:00:00-03:00",
    "displayTime": "Lunes 17/08 • 17:00 hs",
    "stadium": "Ciudad de Lanús - Néstor Díaz Pérez",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 3,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-13-a-1",
        "minute": 37,
        "type": "goal",
        "team": "away",
        "playerName": "Lautaro Millán",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-13-a-2",
        "minute": 47,
        "type": "goal",
        "team": "away",
        "playerName": "Lautaro Millán",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-13-h-1",
        "minute": 50,
        "type": "goal",
        "team": "home",
        "playerName": "Allan Wlk",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-13-h-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "home",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      },
      {
        "id": "ev-5-13-a-3",
        "minute": 90,
        "type": "goal",
        "team": "away",
        "playerName": "Maximiliano Gutiérrez",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-14",
    "fecha": 5,
    "homeTeam": "Vélez Sarsfield",
    "awayTeam": "Defensa y Justicia",
    "dateStr": "Lunes 17 de Agosto de 2026",
    "kickoff": "2026-08-17T19:15:00-03:00",
    "displayTime": "Lunes 17/08 • 19:15 hs",
    "stadium": "José Amalfitani",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-14-h-1",
        "minute": 4,
        "type": "goal",
        "team": "home",
        "playerName": "Manuel Lanzini",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-14-a-1",
        "minute": 79,
        "type": "goal",
        "team": "away",
        "playerName": "Leandro Fernandez",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f5-15",
    "fecha": 5,
    "homeTeam": "Gimnasia y Esgrima de Mendoza",
    "awayTeam": "Talleres de Córdoba",
    "dateStr": "Lunes 17 de Agosto de 2026",
    "kickoff": "2026-08-17T21:30:00-03:00",
    "displayTime": "Lunes 17/08 • 21:30 hs",
    "stadium": "Víctor Antonio Legrotaglie (Mendoza)",
    "isInterzonal": false,
    "status": "FINISHED",
    "homeScore": 3,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-5-15-h-1",
        "minute": 9,
        "type": "penalty_goal",
        "team": "home",
        "playerName": "Agustin Modica",
        "detail": "Pen"
      },
      {
        "id": "ev-5-15-h-2",
        "minute": 20,
        "type": "goal",
        "team": "home",
        "playerName": "Agustin Modica",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-15-h-3",
        "minute": 51,
        "type": "goal",
        "team": "home",
        "playerName": "Luciano Cingolani",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-5-15-h-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "home",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      },
      {
        "id": "ev-5-15-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      },
      {
        "id": "ev-5-15-a-1",
        "minute": 85,
        "type": "goal",
        "team": "away",
        "playerName": "Santiago Fernandez",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f6-1",
    "fecha": 6,
    "homeTeam": "Aldosivi",
    "awayTeam": "Unión de Santa Fe",
    "dateStr": "Viernes 21 de Agosto de 2026",
    "kickoff": "2026-08-21T14:30:00-03:00",
    "displayTime": "Viernes 21/08 • 14:30 hs",
    "stadium": "José María Minella (Mar del Plata)",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 3,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-1-h-1",
        "minute": 18,
        "type": "goal",
        "team": "home",
        "playerName": "Andres Vombergar",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-1-a-1",
        "minute": 51,
        "type": "goal",
        "team": "away",
        "playerName": "Lucas Menossi",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-1-a-2",
        "minute": 62,
        "type": "goal",
        "team": "away",
        "playerName": "Cristian Tarragona",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-1-a-3",
        "minute": 64,
        "type": "goal",
        "team": "away",
        "playerName": "Cristian Tarragona",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-1-a-red-1",
        "minute": 80,
        "type": "red_card",
        "team": "away",
        "playerName": "Tarjeta Roja",
        "detail": "Expulsión"
      }
    ]
  },
  {
    "id": "f6-2",
    "fecha": 6,
    "homeTeam": "Estudiantes de Río Cuarto",
    "awayTeam": "San Lorenzo de Almagro",
    "dateStr": "Viernes 21 de Agosto de 2026",
    "kickoff": "2026-08-21T20:00:00-03:00",
    "displayTime": "Viernes 21/08 • 20:00 hs",
    "stadium": "Antonio Candini (Río Cuarto)",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": []
  },
  {
    "id": "f6-3",
    "fecha": 6,
    "homeTeam": "Gimnasia y Esgrima La Plata",
    "awayTeam": "Gimnasia y Esgrima de Mendoza",
    "dateStr": "Sábado 22 de Agosto de 2026",
    "kickoff": "2026-08-22T16:00:00-03:00",
    "displayTime": "Sábado 22/08 • 16:00 hs",
    "stadium": "Juan Carmelo Zerillo - El Bosque",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 3,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-3-a-1",
        "minute": 17,
        "type": "goal",
        "team": "away",
        "playerName": "Agustin Modica",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-3-a-2",
        "minute": 39,
        "type": "goal",
        "team": "away",
        "playerName": "Agustin Modica",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-3-h-1",
        "minute": 46,
        "type": "goal",
        "team": "home",
        "playerName": "Agustín Auzmendi",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-3-h-2",
        "minute": 62,
        "type": "goal",
        "team": "home",
        "playerName": "Maximiliano Zalazar",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-3-a-3",
        "minute": 76,
        "type": "goal",
        "team": "away",
        "playerName": "Agustin Modica",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f6-4",
    "fecha": 6,
    "homeTeam": "Atlético Tucumán",
    "awayTeam": "Instituto de Córdoba",
    "dateStr": "Sábado 22 de Agosto de 2026",
    "kickoff": "2026-08-22T16:00:00-03:00",
    "displayTime": "Sábado 22/08 • 16:00 hs",
    "stadium": "Monumental José Fierro",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": []
  },
  {
    "id": "f6-5",
    "fecha": 6,
    "homeTeam": "Independiente",
    "awayTeam": "Independiente Rivadavia",
    "dateStr": "Sábado 22 de Agosto de 2026",
    "kickoff": "2026-08-22T18:30:00-03:00",
    "displayTime": "Sábado 22/08 • 18:30 hs",
    "stadium": "Libertadores de América - Ricardo E. Bochini",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": []
  },
  {
    "id": "f6-6",
    "fecha": 6,
    "homeTeam": "Newell's Old Boys",
    "awayTeam": "Banfield",
    "dateStr": "Sábado 22 de Agosto de 2026",
    "kickoff": "2026-08-22T21:00:00-03:00",
    "displayTime": "Sábado 22/08 • 21:00 hs",
    "stadium": "Marcelo Bielsa - Coloso del Parque",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-6-h-1",
        "minute": 51,
        "type": "goal",
        "team": "home",
        "playerName": "Matias Cóccaro",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-6-h-2",
        "minute": 77,
        "type": "goal",
        "team": "home",
        "playerName": "Matias Cóccaro",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-6-a-1",
        "minute": 90,
        "type": "penalty_goal",
        "team": "away",
        "playerName": "Bruno Sepúlveda",
        "detail": "Pen"
      }
    ]
  },
  {
    "id": "f6-7",
    "fecha": 6,
    "homeTeam": "Huracán",
    "awayTeam": "Deportivo Riestra",
    "dateStr": "Sábado 22 de Agosto de 2026",
    "kickoff": "2026-08-22T21:00:00-03:00",
    "displayTime": "Sábado 22/08 • 21:00 hs",
    "stadium": "Tomás Adolfo Ducó",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 0,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": []
  },
  {
    "id": "f6-8",
    "fecha": 6,
    "homeTeam": "Sarmiento de Junín",
    "awayTeam": "Estudiantes de La Plata",
    "dateStr": "Domingo 23 de Agosto de 2026",
    "kickoff": "2026-08-23T14:45:00-03:00",
    "displayTime": "Domingo 23/08 • 14:45 hs",
    "stadium": "Eva Perón (Junín)",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 0,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-8-h-1",
        "minute": 18,
        "type": "goal",
        "team": "home",
        "playerName": "Mauricio Martínez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-8-h-2",
        "minute": 80,
        "type": "goal",
        "team": "home",
        "playerName": "Gastón González",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f6-9",
    "fecha": 6,
    "homeTeam": "Barracas Central",
    "awayTeam": "Platense",
    "dateStr": "Domingo 23 de Agosto de 2026",
    "kickoff": "2026-08-23T14:45:00-03:00",
    "displayTime": "Domingo 23/08 • 14:45 hs",
    "stadium": "Claudio Fabián Tapia",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-9-h-1",
        "minute": 23,
        "type": "penalty_goal",
        "team": "home",
        "playerName": "Iván Tapia",
        "detail": "Pen"
      },
      {
        "id": "ev-6-9-a-1",
        "minute": 59,
        "type": "goal",
        "team": "away",
        "playerName": "Nicolas Retamar",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-9-a-2",
        "minute": 90,
        "type": "goal",
        "team": "away",
        "playerName": "Luciano Giménez",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f6-10",
    "fecha": 6,
    "homeTeam": "Belgrano de Córdoba",
    "awayTeam": "Defensa y Justicia",
    "dateStr": "Domingo 23 de Agosto de 2026",
    "kickoff": "2026-08-23T17:00:00-03:00",
    "displayTime": "Domingo 23/08 • 17:00 hs",
    "stadium": "Julio César Villagra - Gigante de Alberdi",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-10-a-1",
        "minute": 12,
        "type": "goal",
        "team": "away",
        "playerName": "César Pérez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-10-a-2",
        "minute": 47,
        "type": "goal",
        "team": "away",
        "playerName": "Damián Fernández",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-10-h-1",
        "minute": 59,
        "type": "goal",
        "team": "home",
        "playerName": "Ramiro Hernandes",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f6-11",
    "fecha": 6,
    "homeTeam": "River Plate",
    "awayTeam": "Vélez Sarsfield",
    "dateStr": "Domingo 23 de Agosto de 2026",
    "kickoff": "2026-08-23T19:15:00-03:00",
    "displayTime": "Domingo 23/08 • 19:15 hs",
    "stadium": "Más Monumental",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-11-h-1",
        "minute": 11,
        "type": "goal",
        "team": "home",
        "playerName": "Angel Correa",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-11-h-2",
        "minute": 43,
        "type": "goal",
        "team": "home",
        "playerName": "Thiago Silvero",
        "detail": "E.C"
      },
      {
        "id": "ev-6-11-a-1",
        "minute": 61,
        "type": "goal",
        "team": "away",
        "playerName": "Diego Valdes",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-11-a-2",
        "minute": 79,
        "type": "goal",
        "team": "away",
        "playerName": "Manuel Lanzini",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f6-12",
    "fecha": 6,
    "homeTeam": "Racing Club",
    "awayTeam": "Boca Juniors",
    "dateStr": "Domingo 23 de Agosto de 2026",
    "kickoff": "2026-08-23T21:30:00-03:00",
    "displayTime": "Domingo 23/08 • 21:30 hs",
    "stadium": "Presidente Perón - Cilindro de Avellaneda",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-12-h-1",
        "minute": 9,
        "type": "penalty_goal",
        "team": "home",
        "playerName": "Marcos Rojo",
        "detail": "Pen"
      },
      {
        "id": "ev-6-12-a-1",
        "minute": 28,
        "type": "goal",
        "team": "away",
        "playerName": "Miguel Merentiel",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f6-13",
    "fecha": 6,
    "homeTeam": "Tigre",
    "awayTeam": "Central Córdoba de SDE",
    "dateStr": "Lunes 24 de Agosto de 2026",
    "kickoff": "2026-08-24T19:00:00-03:00",
    "displayTime": "Lunes 24/08 • 19:00 hs",
    "stadium": "José Dellagiovanna (Victoria)",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-13-h-1",
        "minute": 6,
        "type": "goal",
        "team": "home",
        "playerName": "Mauro Méndez",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-13-h-2",
        "minute": 26,
        "type": "goal",
        "team": "home",
        "playerName": "Santiago Lopéz",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-13-a-1",
        "minute": 58,
        "type": "penalty_goal",
        "team": "away",
        "playerName": "Michael Santos",
        "detail": "Pen"
      }
    ]
  },
  {
    "id": "f6-14",
    "fecha": 6,
    "homeTeam": "Lanús",
    "awayTeam": "Argentinos Juniors",
    "dateStr": "Lunes 24 de Agosto de 2026",
    "kickoff": "2026-08-24T21:15:00-03:00",
    "displayTime": "Lunes 24/08 • 21:15 hs",
    "stadium": "Ciudad de Lanús - Néstor Díaz Pérez",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 1,
    "awayScore": 1,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-14-h-1",
        "minute": 70,
        "type": "goal",
        "team": "home",
        "playerName": "Felipe Peña Biafore",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-14-a-1",
        "minute": 74,
        "type": "goal",
        "team": "away",
        "playerName": "Gastón Verón",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f6-15",
    "fecha": 6,
    "homeTeam": "Talleres de Córdoba",
    "awayTeam": "Rosario Central",
    "dateStr": "Lunes 24 de Agosto de 2026",
    "kickoff": "2026-08-24T21:15:00-03:00",
    "displayTime": "Lunes 24/08 • 21:15 hs",
    "stadium": "Mario Alberto Kempes",
    "isInterzonal": true,
    "status": "FINISHED",
    "homeScore": 2,
    "awayScore": 2,
    "liveMinute": "Finalizado",
    "events": [
      {
        "id": "ev-6-15-h-1",
        "minute": 21,
        "type": "penalty_goal",
        "team": "home",
        "playerName": "Agustín Álvarez",
        "detail": "Pen"
      },
      {
        "id": "ev-6-15-h-2",
        "minute": 47,
        "type": "goal",
        "team": "home",
        "playerName": "Valentín Depietri",
        "detail": "Gol de jugada"
      },
      {
        "id": "ev-6-15-a-1",
        "minute": 55,
        "type": "penalty_goal",
        "team": "away",
        "playerName": "Ángel Di María",
        "detail": "Pen"
      },
      {
        "id": "ev-6-15-a-2",
        "minute": 63,
        "type": "goal",
        "team": "away",
        "playerName": "Ángel Di María",
        "detail": "Gol de jugada"
      }
    ]
  },
  {
    "id": "f7-1",
    "fecha": 7,
    "homeTeam": "Unión de Santa Fe",
    "awayTeam": "Sarmiento de Junín",
    "dateStr": "Viernes 28 de Agosto de 2026",
    "kickoff": "2026-08-28T19:00:00-03:00",
    "displayTime": "Viernes 28/08 • 19:00 hs",
    "stadium": "15 de Abril (Santa Fe)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-2",
    "fecha": 7,
    "homeTeam": "Boca Juniors",
    "awayTeam": "Lanús",
    "dateStr": "Viernes 28 de Agosto de 2026",
    "kickoff": "2026-08-28T21:30:00-03:00",
    "displayTime": "Viernes 28/08 • 21:30 hs",
    "stadium": "Alberto J. Armando - La Bombonera",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-3",
    "fecha": 7,
    "homeTeam": "Deportivo Riestra",
    "awayTeam": "Vélez Sarsfield",
    "dateStr": "Sábado 29 de Agosto de 2026",
    "kickoff": "2026-08-29T14:45:00-03:00",
    "displayTime": "Sábado 29/08 • 14:45 hs",
    "stadium": "Guillermo Laza",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-4",
    "fecha": 7,
    "homeTeam": "Rosario Central",
    "awayTeam": "Gimnasia y Esgrima La Plata",
    "dateStr": "Sábado 29 de Agosto de 2026",
    "kickoff": "2026-08-29T17:00:00-03:00",
    "displayTime": "Sábado 29/08 • 17:00 hs",
    "stadium": "Gigante de Arroyito",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-5",
    "fecha": 7,
    "homeTeam": "Huracán",
    "awayTeam": "Estudiantes de Río Cuarto",
    "dateStr": "Sábado 29 de Agosto de 2026",
    "kickoff": "2026-08-29T19:00:00-03:00",
    "displayTime": "Sábado 29/08 • 19:00 hs",
    "stadium": "Tomás Adolfo Ducó",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-6",
    "fecha": 7,
    "homeTeam": "Atlético Tucumán",
    "awayTeam": "Belgrano de Córdoba",
    "dateStr": "Sábado 29 de Agosto de 2026",
    "kickoff": "2026-08-29T21:30:00-03:00",
    "displayTime": "Sábado 29/08 • 21:30 hs",
    "stadium": "Monumental José Fierro",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-7",
    "fecha": 7,
    "homeTeam": "Talleres de Córdoba",
    "awayTeam": "Central Córdoba de SDE",
    "dateStr": "Sábado 29 de Agosto de 2026",
    "kickoff": "2026-08-29T21:30:00-03:00",
    "displayTime": "Sábado 29/08 • 21:30 hs",
    "stadium": "Mario Alberto Kempes",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-8",
    "fecha": 7,
    "homeTeam": "Banfield",
    "awayTeam": "River Plate",
    "dateStr": "Domingo 30 de Agosto de 2026",
    "kickoff": "2026-08-30T15:00:00-03:00",
    "displayTime": "Domingo 30/08 • 15:00 hs",
    "stadium": "Florencio Sola",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-9",
    "fecha": 7,
    "homeTeam": "Argentinos Juniors",
    "awayTeam": "Aldosivi",
    "dateStr": "Domingo 30 de Agosto de 2026",
    "kickoff": "2026-08-30T17:00:00-03:00",
    "displayTime": "Domingo 30/08 • 17:00 hs",
    "stadium": "Diego Armando Maradona",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-10",
    "fecha": 7,
    "homeTeam": "Independiente",
    "awayTeam": "Gimnasia y Esgrima de Mendoza",
    "dateStr": "Domingo 30 de Agosto de 2026",
    "kickoff": "2026-08-30T19:15:00-03:00",
    "displayTime": "Domingo 30/08 • 19:15 hs",
    "stadium": "Libertadores de América - Ricardo E. Bochini",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-11",
    "fecha": 7,
    "homeTeam": "Independiente Rivadavia",
    "awayTeam": "Racing Club",
    "dateStr": "Domingo 30 de Agosto de 2026",
    "kickoff": "2026-08-30T21:30:00-03:00",
    "displayTime": "Domingo 30/08 • 21:30 hs",
    "stadium": "Bautista Gargantini (Mendoza)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-12",
    "fecha": 7,
    "homeTeam": "Estudiantes de La Plata",
    "awayTeam": "Newell's Old Boys",
    "dateStr": "Lunes 31 de Agosto de 2026",
    "kickoff": "2026-08-31T19:00:00-03:00",
    "displayTime": "Lunes 31/08 • 19:00 hs",
    "stadium": "Jorge Luis Hirschi - UNO",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-13",
    "fecha": 7,
    "homeTeam": "Defensa y Justicia",
    "awayTeam": "Platense",
    "dateStr": "Lunes 31 de Agosto de 2026",
    "kickoff": "2026-08-31T19:00:00-03:00",
    "displayTime": "Lunes 31/08 • 19:00 hs",
    "stadium": "Norberto Tomaghello",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-14",
    "fecha": 7,
    "homeTeam": "Tigre",
    "awayTeam": "Barracas Central",
    "dateStr": "Lunes 31 de Agosto de 2026",
    "kickoff": "2026-08-31T21:15:00-03:00",
    "displayTime": "Lunes 31/08 • 21:15 hs",
    "stadium": "José Dellagiovanna (Victoria)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f7-15",
    "fecha": 7,
    "homeTeam": "Instituto de Córdoba",
    "awayTeam": "San Lorenzo de Almagro",
    "dateStr": "Lunes 31 de Agosto de 2026",
    "kickoff": "2026-08-31T21:15:00-03:00",
    "displayTime": "Lunes 31/08 • 21:15 hs",
    "stadium": "Juan Domingo Perón (Alta Córdoba)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-1",
    "fecha": 8,
    "homeTeam": "Estudiantes de Río Cuarto",
    "awayTeam": "Sarmiento de Junín",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Antonio Candini (Río Cuarto)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-2",
    "fecha": 8,
    "homeTeam": "Belgrano de Córdoba",
    "awayTeam": "Huracán",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Julio César Villagra - Gigante de Alberdi",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-3",
    "fecha": 8,
    "homeTeam": "Racing Club",
    "awayTeam": "Atlético Tucumán",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Presidente Perón - Cilindro de Avellaneda",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-4",
    "fecha": 8,
    "homeTeam": "River Plate",
    "awayTeam": "Independiente Rivadavia",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Más Monumental",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-5",
    "fecha": 8,
    "homeTeam": "Aldosivi",
    "awayTeam": "Banfield",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "José María Minella (Mar del Plata)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-6",
    "fecha": 8,
    "homeTeam": "Barracas Central",
    "awayTeam": "Argentinos Juniors",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Claudio Fabián Tapia",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-7",
    "fecha": 8,
    "homeTeam": "Gimnasia y Esgrima La Plata",
    "awayTeam": "Tigre",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Juan Carmelo Zerillo - El Bosque",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-8",
    "fecha": 8,
    "homeTeam": "Unión de Santa Fe",
    "awayTeam": "Instituto de Córdoba",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "15 de Abril (Santa Fe)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-9",
    "fecha": 8,
    "homeTeam": "San Lorenzo de Almagro",
    "awayTeam": "Talleres de Córdoba",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Pedro Bidegain - Nuevo Gasómetro",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-10",
    "fecha": 8,
    "homeTeam": "Central Córdoba de SDE",
    "awayTeam": "Independiente",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Madre de Ciudades (Santiago del Estero)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-11",
    "fecha": 8,
    "homeTeam": "Gimnasia y Esgrima de Mendoza",
    "awayTeam": "Boca Juniors",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Víctor Antonio Legrotaglie (Mendoza)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-12",
    "fecha": 8,
    "homeTeam": "Lanús",
    "awayTeam": "Defensa y Justicia",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Ciudad de Lanús - Néstor Díaz Pérez",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-13",
    "fecha": 8,
    "homeTeam": "Platense",
    "awayTeam": "Deportivo Riestra",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Ciudad de Vicente López",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-14",
    "fecha": 8,
    "homeTeam": "Vélez Sarsfield",
    "awayTeam": "Estudiantes de La Plata",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "José Amalfitani",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f8-15",
    "fecha": 8,
    "homeTeam": "Rosario Central",
    "awayTeam": "Newell's Old Boys",
    "dateStr": "Domingo 6 de Septiembre de 2026",
    "kickoff": "2026-09-06T14:00:00-03:00",
    "displayTime": "Domingo 06/09 • 14:00 hs",
    "stadium": "Gigante de Arroyito",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-1",
    "fecha": 9,
    "homeTeam": "Tigre",
    "awayTeam": "Rosario Central",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "José Dellagiovanna (Victoria)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-2",
    "fecha": 9,
    "homeTeam": "Argentinos Juniors",
    "awayTeam": "Gimnasia y Esgrima La Plata",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Diego Armando Maradona",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-3",
    "fecha": 9,
    "homeTeam": "Banfield",
    "awayTeam": "Barracas Central",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Florencio Sola",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-4",
    "fecha": 9,
    "homeTeam": "Atlético Tucumán",
    "awayTeam": "River Plate",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Monumental José Fierro",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-5",
    "fecha": 9,
    "homeTeam": "Independiente Rivadavia",
    "awayTeam": "Aldosivi",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Bautista Gargantini (Mendoza)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-6",
    "fecha": 9,
    "homeTeam": "Huracán",
    "awayTeam": "Racing Club",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Tomás Adolfo Ducó",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-7",
    "fecha": 9,
    "homeTeam": "Sarmiento de Junín",
    "awayTeam": "Belgrano de Córdoba",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Eva Perón (Junín)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-8",
    "fecha": 9,
    "homeTeam": "Newell's Old Boys",
    "awayTeam": "Vélez Sarsfield",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Marcelo Bielsa - Coloso del Parque",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-9",
    "fecha": 9,
    "homeTeam": "Estudiantes de La Plata",
    "awayTeam": "Platense",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Jorge Luis Hirschi - UNO",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-10",
    "fecha": 9,
    "homeTeam": "Deportivo Riestra",
    "awayTeam": "Lanús",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Guillermo Laza",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-11",
    "fecha": 9,
    "homeTeam": "Defensa y Justicia",
    "awayTeam": "Gimnasia y Esgrima de Mendoza",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Norberto Tomaghello",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-12",
    "fecha": 9,
    "homeTeam": "Boca Juniors",
    "awayTeam": "Central Córdoba de SDE",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Alberto J. Armando - La Bombonera",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-13",
    "fecha": 9,
    "homeTeam": "Independiente",
    "awayTeam": "San Lorenzo de Almagro",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Libertadores de América - Ricardo E. Bochini",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-14",
    "fecha": 9,
    "homeTeam": "Talleres de Córdoba",
    "awayTeam": "Unión de Santa Fe",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Mario Alberto Kempes",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f9-15",
    "fecha": 9,
    "homeTeam": "Instituto de Córdoba",
    "awayTeam": "Estudiantes de Río Cuarto",
    "dateStr": "Domingo 13 de Septiembre de 2026",
    "kickoff": "2026-09-13T14:00:00-03:00",
    "displayTime": "Domingo 13/09 • 14:00 hs",
    "stadium": "Juan Domingo Perón (Alta Córdoba)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-1",
    "fecha": 10,
    "homeTeam": "Belgrano de Córdoba",
    "awayTeam": "Estudiantes de Río Cuarto",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Julio César Villagra - Gigante de Alberdi",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-2",
    "fecha": 10,
    "homeTeam": "River Plate",
    "awayTeam": "Huracán",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Más Monumental",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-3",
    "fecha": 10,
    "homeTeam": "Racing Club",
    "awayTeam": "Sarmiento de Junín",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Presidente Perón - Cilindro de Avellaneda",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-4",
    "fecha": 10,
    "homeTeam": "Aldosivi",
    "awayTeam": "Atlético Tucumán",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "José María Minella (Mar del Plata)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-5",
    "fecha": 10,
    "homeTeam": "Barracas Central",
    "awayTeam": "Independiente Rivadavia",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Claudio Fabián Tapia",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-6",
    "fecha": 10,
    "homeTeam": "Gimnasia y Esgrima La Plata",
    "awayTeam": "Banfield",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Juan Carmelo Zerillo - El Bosque",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-7",
    "fecha": 10,
    "homeTeam": "Rosario Central",
    "awayTeam": "Argentinos Juniors",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Gigante de Arroyito",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-8",
    "fecha": 10,
    "homeTeam": "Instituto de Córdoba",
    "awayTeam": "Talleres de Córdoba",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Juan Domingo Perón (Alta Córdoba)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-9",
    "fecha": 10,
    "homeTeam": "Unión de Santa Fe",
    "awayTeam": "Independiente",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "15 de Abril (Santa Fe)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-10",
    "fecha": 10,
    "homeTeam": "San Lorenzo de Almagro",
    "awayTeam": "Boca Juniors",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Pedro Bidegain - Nuevo Gasómetro",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-11",
    "fecha": 10,
    "homeTeam": "Central Córdoba de SDE",
    "awayTeam": "Defensa y Justicia",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Madre de Ciudades (Santiago del Estero)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-12",
    "fecha": 10,
    "homeTeam": "Gimnasia y Esgrima de Mendoza",
    "awayTeam": "Deportivo Riestra",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Víctor Antonio Legrotaglie (Mendoza)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-13",
    "fecha": 10,
    "homeTeam": "Lanús",
    "awayTeam": "Estudiantes de La Plata",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Ciudad de Lanús - Néstor Díaz Pérez",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-14",
    "fecha": 10,
    "homeTeam": "Platense",
    "awayTeam": "Newell's Old Boys",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "Ciudad de Vicente López",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f10-15",
    "fecha": 10,
    "homeTeam": "Vélez Sarsfield",
    "awayTeam": "Tigre",
    "dateStr": "Domingo 20 de Septiembre de 2026",
    "kickoff": "2026-09-20T14:00:00-03:00",
    "displayTime": "Domingo 20/09 • 14:00 hs",
    "stadium": "José Amalfitani",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-1",
    "fecha": 11,
    "homeTeam": "Argentinos Juniors",
    "awayTeam": "Tigre",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Diego Armando Maradona",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-2",
    "fecha": 11,
    "homeTeam": "Banfield",
    "awayTeam": "Rosario Central",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Florencio Sola",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-3",
    "fecha": 11,
    "homeTeam": "Independiente Rivadavia",
    "awayTeam": "Gimnasia y Esgrima La Plata",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Bautista Gargantini (Mendoza)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-4",
    "fecha": 11,
    "homeTeam": "Atlético Tucumán",
    "awayTeam": "Barracas Central",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Monumental José Fierro",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-5",
    "fecha": 11,
    "homeTeam": "Huracán",
    "awayTeam": "Aldosivi",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Tomás Adolfo Ducó",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-6",
    "fecha": 11,
    "homeTeam": "Sarmiento de Junín",
    "awayTeam": "River Plate",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Eva Perón (Junín)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-7",
    "fecha": 11,
    "homeTeam": "Estudiantes de Río Cuarto",
    "awayTeam": "Racing Club",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Antonio Candini (Río Cuarto)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-8",
    "fecha": 11,
    "homeTeam": "Vélez Sarsfield",
    "awayTeam": "Platense",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "José Amalfitani",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-9",
    "fecha": 11,
    "homeTeam": "Newell's Old Boys",
    "awayTeam": "Lanús",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Marcelo Bielsa - Coloso del Parque",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-10",
    "fecha": 11,
    "homeTeam": "Estudiantes de La Plata",
    "awayTeam": "Gimnasia y Esgrima de Mendoza",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Jorge Luis Hirschi - UNO",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-11",
    "fecha": 11,
    "homeTeam": "Deportivo Riestra",
    "awayTeam": "Central Córdoba de SDE",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Guillermo Laza",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-12",
    "fecha": 11,
    "homeTeam": "Defensa y Justicia",
    "awayTeam": "San Lorenzo de Almagro",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Norberto Tomaghello",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-13",
    "fecha": 11,
    "homeTeam": "Boca Juniors",
    "awayTeam": "Unión de Santa Fe",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Alberto J. Armando - La Bombonera",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-14",
    "fecha": 11,
    "homeTeam": "Independiente",
    "awayTeam": "Instituto de Córdoba",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Libertadores de América - Ricardo E. Bochini",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f11-15",
    "fecha": 11,
    "homeTeam": "Talleres de Córdoba",
    "awayTeam": "Belgrano de Córdoba",
    "dateStr": "Domingo 4 de Octubre de 2026",
    "kickoff": "2026-10-04T14:00:00-03:00",
    "displayTime": "Domingo 04/10 • 14:00 hs",
    "stadium": "Mario Alberto Kempes",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-1",
    "fecha": 12,
    "homeTeam": "Racing Club",
    "awayTeam": "Belgrano de Córdoba",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Presidente Perón - Cilindro de Avellaneda",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-2",
    "fecha": 12,
    "homeTeam": "River Plate",
    "awayTeam": "Estudiantes de Río Cuarto",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Más Monumental",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-3",
    "fecha": 12,
    "homeTeam": "Aldosivi",
    "awayTeam": "Sarmiento de Junín",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "José María Minella (Mar del Plata)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-4",
    "fecha": 12,
    "homeTeam": "Barracas Central",
    "awayTeam": "Huracán",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Claudio Fabián Tapia",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-5",
    "fecha": 12,
    "homeTeam": "Gimnasia y Esgrima La Plata",
    "awayTeam": "Atlético Tucumán",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Juan Carmelo Zerillo - El Bosque",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-6",
    "fecha": 12,
    "homeTeam": "Rosario Central",
    "awayTeam": "Independiente Rivadavia",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Gigante de Arroyito",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-7",
    "fecha": 12,
    "homeTeam": "Tigre",
    "awayTeam": "Banfield",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "José Dellagiovanna (Victoria)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-8",
    "fecha": 12,
    "homeTeam": "Talleres de Córdoba",
    "awayTeam": "Independiente",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Mario Alberto Kempes",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-9",
    "fecha": 12,
    "homeTeam": "Instituto de Córdoba",
    "awayTeam": "Boca Juniors",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Juan Domingo Perón (Alta Córdoba)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-10",
    "fecha": 12,
    "homeTeam": "Unión de Santa Fe",
    "awayTeam": "Defensa y Justicia",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "15 de Abril (Santa Fe)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-11",
    "fecha": 12,
    "homeTeam": "San Lorenzo de Almagro",
    "awayTeam": "Deportivo Riestra",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Pedro Bidegain - Nuevo Gasómetro",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-12",
    "fecha": 12,
    "homeTeam": "Central Córdoba de SDE",
    "awayTeam": "Estudiantes de La Plata",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Madre de Ciudades (Santiago del Estero)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-13",
    "fecha": 12,
    "homeTeam": "Gimnasia y Esgrima de Mendoza",
    "awayTeam": "Newell's Old Boys",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Víctor Antonio Legrotaglie (Mendoza)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-14",
    "fecha": 12,
    "homeTeam": "Lanús",
    "awayTeam": "Vélez Sarsfield",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Ciudad de Lanús - Néstor Díaz Pérez",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f12-15",
    "fecha": 12,
    "homeTeam": "Platense",
    "awayTeam": "Argentinos Juniors",
    "dateStr": "Domingo 11 de Octubre de 2026",
    "kickoff": "2026-10-11T14:00:00-03:00",
    "displayTime": "Domingo 11/10 • 14:00 hs",
    "stadium": "Ciudad de Vicente López",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-1",
    "fecha": 13,
    "homeTeam": "Banfield",
    "awayTeam": "Argentinos Juniors",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Florencio Sola",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-2",
    "fecha": 13,
    "homeTeam": "Independiente Rivadavia",
    "awayTeam": "Tigre",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Bautista Gargantini (Mendoza)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-3",
    "fecha": 13,
    "homeTeam": "Atlético Tucumán",
    "awayTeam": "Rosario Central",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Monumental José Fierro",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-4",
    "fecha": 13,
    "homeTeam": "Huracán",
    "awayTeam": "Gimnasia y Esgrima La Plata",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Tomás Adolfo Ducó",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-5",
    "fecha": 13,
    "homeTeam": "Sarmiento de Junín",
    "awayTeam": "Barracas Central",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Eva Perón (Junín)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-6",
    "fecha": 13,
    "homeTeam": "Estudiantes de Río Cuarto",
    "awayTeam": "Aldosivi",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Antonio Candini (Río Cuarto)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-7",
    "fecha": 13,
    "homeTeam": "Belgrano de Córdoba",
    "awayTeam": "River Plate",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Julio César Villagra - Gigante de Alberdi",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-8",
    "fecha": 13,
    "homeTeam": "Platense",
    "awayTeam": "Lanús",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Ciudad de Vicente López",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-9",
    "fecha": 13,
    "homeTeam": "Vélez Sarsfield",
    "awayTeam": "Gimnasia y Esgrima de Mendoza",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "José Amalfitani",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-10",
    "fecha": 13,
    "homeTeam": "Newell's Old Boys",
    "awayTeam": "Central Córdoba de SDE",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Marcelo Bielsa - Coloso del Parque",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-11",
    "fecha": 13,
    "homeTeam": "Estudiantes de La Plata",
    "awayTeam": "San Lorenzo de Almagro",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Jorge Luis Hirschi - UNO",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-12",
    "fecha": 13,
    "homeTeam": "Deportivo Riestra",
    "awayTeam": "Unión de Santa Fe",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Guillermo Laza",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-13",
    "fecha": 13,
    "homeTeam": "Defensa y Justicia",
    "awayTeam": "Instituto de Córdoba",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Norberto Tomaghello",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-14",
    "fecha": 13,
    "homeTeam": "Boca Juniors",
    "awayTeam": "Talleres de Córdoba",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Alberto J. Armando - La Bombonera",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f13-15",
    "fecha": 13,
    "homeTeam": "Racing Club",
    "awayTeam": "Independiente",
    "dateStr": "Domingo 18 de Octubre de 2026",
    "kickoff": "2026-10-18T14:00:00-03:00",
    "displayTime": "Domingo 18/10 • 14:00 hs",
    "stadium": "Presidente Perón - Cilindro de Avellaneda",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-1",
    "fecha": 14,
    "homeTeam": "River Plate",
    "awayTeam": "Racing Club",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Más Monumental",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-2",
    "fecha": 14,
    "homeTeam": "Aldosivi",
    "awayTeam": "Belgrano de Córdoba",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "José María Minella (Mar del Plata)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-3",
    "fecha": 14,
    "homeTeam": "Barracas Central",
    "awayTeam": "Estudiantes de Río Cuarto",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Claudio Fabián Tapia",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-4",
    "fecha": 14,
    "homeTeam": "Gimnasia y Esgrima La Plata",
    "awayTeam": "Sarmiento de Junín",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Juan Carmelo Zerillo - El Bosque",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-5",
    "fecha": 14,
    "homeTeam": "Rosario Central",
    "awayTeam": "Huracán",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Gigante de Arroyito",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-6",
    "fecha": 14,
    "homeTeam": "Tigre",
    "awayTeam": "Atlético Tucumán",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "José Dellagiovanna (Victoria)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-7",
    "fecha": 14,
    "homeTeam": "Argentinos Juniors",
    "awayTeam": "Independiente Rivadavia",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Diego Armando Maradona",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-8",
    "fecha": 14,
    "homeTeam": "Independiente",
    "awayTeam": "Boca Juniors",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Libertadores de América - Ricardo E. Bochini",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-9",
    "fecha": 14,
    "homeTeam": "Talleres de Córdoba",
    "awayTeam": "Defensa y Justicia",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Mario Alberto Kempes",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-10",
    "fecha": 14,
    "homeTeam": "Instituto de Córdoba",
    "awayTeam": "Deportivo Riestra",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Juan Domingo Perón (Alta Córdoba)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-11",
    "fecha": 14,
    "homeTeam": "Unión de Santa Fe",
    "awayTeam": "Estudiantes de La Plata",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "15 de Abril (Santa Fe)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-12",
    "fecha": 14,
    "homeTeam": "Central Córdoba de SDE",
    "awayTeam": "Vélez Sarsfield",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Madre de Ciudades (Santiago del Estero)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-13",
    "fecha": 14,
    "homeTeam": "San Lorenzo de Almagro",
    "awayTeam": "Newell's Old Boys",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Pedro Bidegain - Nuevo Gasómetro",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-14",
    "fecha": 14,
    "homeTeam": "Gimnasia y Esgrima de Mendoza",
    "awayTeam": "Platense",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Víctor Antonio Legrotaglie (Mendoza)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f14-15",
    "fecha": 14,
    "homeTeam": "Banfield",
    "awayTeam": "Lanús",
    "dateStr": "Domingo 25 de Octubre de 2026",
    "kickoff": "2026-10-25T14:00:00-03:00",
    "displayTime": "Domingo 25/10 • 14:00 hs",
    "stadium": "Florencio Sola",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-1",
    "fecha": 15,
    "homeTeam": "Independiente Rivadavia",
    "awayTeam": "Banfield",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Bautista Gargantini (Mendoza)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-2",
    "fecha": 15,
    "homeTeam": "Atlético Tucumán",
    "awayTeam": "Argentinos Juniors",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Monumental José Fierro",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-3",
    "fecha": 15,
    "homeTeam": "Sarmiento de Junín",
    "awayTeam": "Rosario Central",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Eva Perón (Junín)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-4",
    "fecha": 15,
    "homeTeam": "Huracán",
    "awayTeam": "Tigre",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Tomás Adolfo Ducó",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-5",
    "fecha": 15,
    "homeTeam": "Estudiantes de Río Cuarto",
    "awayTeam": "Gimnasia y Esgrima La Plata",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Antonio Candini (Río Cuarto)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-6",
    "fecha": 15,
    "homeTeam": "Belgrano de Córdoba",
    "awayTeam": "Barracas Central",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Julio César Villagra - Gigante de Alberdi",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-7",
    "fecha": 15,
    "homeTeam": "Racing Club",
    "awayTeam": "Aldosivi",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Presidente Perón - Cilindro de Avellaneda",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-8",
    "fecha": 15,
    "homeTeam": "Lanús",
    "awayTeam": "Gimnasia y Esgrima de Mendoza",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Ciudad de Lanús - Néstor Díaz Pérez",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-9",
    "fecha": 15,
    "homeTeam": "Platense",
    "awayTeam": "Central Córdoba de SDE",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Ciudad de Vicente López",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-10",
    "fecha": 15,
    "homeTeam": "Vélez Sarsfield",
    "awayTeam": "San Lorenzo de Almagro",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "José Amalfitani",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-11",
    "fecha": 15,
    "homeTeam": "Newell's Old Boys",
    "awayTeam": "Unión de Santa Fe",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Marcelo Bielsa - Coloso del Parque",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-12",
    "fecha": 15,
    "homeTeam": "Estudiantes de La Plata",
    "awayTeam": "Instituto de Córdoba",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Jorge Luis Hirschi - UNO",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-13",
    "fecha": 15,
    "homeTeam": "Deportivo Riestra",
    "awayTeam": "Talleres de Córdoba",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Guillermo Laza",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-14",
    "fecha": 15,
    "homeTeam": "Defensa y Justicia",
    "awayTeam": "Independiente",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Norberto Tomaghello",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f15-15",
    "fecha": 15,
    "homeTeam": "Boca Juniors",
    "awayTeam": "River Plate",
    "dateStr": "Domingo 1 de Noviembre de 2026",
    "kickoff": "2026-11-01T13:00:00-03:00",
    "displayTime": "Domingo 01/11 • 13:00 hs",
    "stadium": "Alberto J. Armando - La Bombonera",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-1",
    "fecha": 16,
    "homeTeam": "Rosario Central",
    "awayTeam": "Estudiantes de Río Cuarto",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Gigante de Arroyito",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-2",
    "fecha": 16,
    "homeTeam": "Gimnasia y Esgrima La Plata",
    "awayTeam": "Belgrano de Córdoba",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Juan Carmelo Zerillo - El Bosque",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-3",
    "fecha": 16,
    "homeTeam": "Aldosivi",
    "awayTeam": "River Plate",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "José María Minella (Mar del Plata)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-4",
    "fecha": 16,
    "homeTeam": "Barracas Central",
    "awayTeam": "Racing Club",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Claudio Fabián Tapia",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-5",
    "fecha": 16,
    "homeTeam": "Tigre",
    "awayTeam": "Sarmiento de Junín",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "José Dellagiovanna (Victoria)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-6",
    "fecha": 16,
    "homeTeam": "Argentinos Juniors",
    "awayTeam": "Huracán",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Diego Armando Maradona",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-7",
    "fecha": 16,
    "homeTeam": "Banfield",
    "awayTeam": "Atlético Tucumán",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Florencio Sola",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-8",
    "fecha": 16,
    "homeTeam": "Boca Juniors",
    "awayTeam": "Defensa y Justicia",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Alberto J. Armando - La Bombonera",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-9",
    "fecha": 16,
    "homeTeam": "Independiente",
    "awayTeam": "Deportivo Riestra",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Libertadores de América - Ricardo E. Bochini",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-10",
    "fecha": 16,
    "homeTeam": "Talleres de Córdoba",
    "awayTeam": "Estudiantes de La Plata",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Mario Alberto Kempes",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-11",
    "fecha": 16,
    "homeTeam": "Instituto de Córdoba",
    "awayTeam": "Newell's Old Boys",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Juan Domingo Perón (Alta Córdoba)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-12",
    "fecha": 16,
    "homeTeam": "Unión de Santa Fe",
    "awayTeam": "Vélez Sarsfield",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "15 de Abril (Santa Fe)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-13",
    "fecha": 16,
    "homeTeam": "San Lorenzo de Almagro",
    "awayTeam": "Platense",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Pedro Bidegain - Nuevo Gasómetro",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-14",
    "fecha": 16,
    "homeTeam": "Central Córdoba de SDE",
    "awayTeam": "Lanús",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Madre de Ciudades (Santiago del Estero)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  },
  {
    "id": "f16-15",
    "fecha": 16,
    "homeTeam": "Gimnasia y Esgrima de Mendoza",
    "awayTeam": "Independiente Rivadavia",
    "dateStr": "Domingo 8 de Noviembre de 2026",
    "kickoff": "2026-11-08T13:00:00-03:00",
    "displayTime": "Domingo 08/11 • 13:00 hs",
    "stadium": "Víctor Antonio Legrotaglie (Mendoza)",
    "isInterzonal": false,
    "status": "SCHEDULED",
    "events": []
  }
];

// Duración estimada de un partido (115 minutos con tiempo añadido)
export const MATCH_DURATION_MS = 115 * 60 * 1000;

/**
 * Calcula el estado dinámico y automático de un partido:
 * - Si match.status === 'FINISHED', devuelve FINISHED con sus marcadores y eventos definitivos.
 * - Si match.status === 'LIVE', devuelve LIVE con sus marcadores en vivo.
 * - Si match.status === 'SCHEDULED', calcula el estado temporal según la hora actual.
 */
export function getDynamicMatchState(match: MatchFixture, currentDate: Date = new Date()): DynamicMatchState {
  const nowMs = currentDate.getTime();
  const kickoffMs = match.kickoff ? new Date(match.kickoff).getTime() : 0;
  const finishMs = kickoffMs + MATCH_DURATION_MS;

  // 1. Partido ya marcado como FINALIZADO (Definitivo)
  if (match.status === 'FINISHED' || (kickoffMs > 0 && nowMs >= finishMs)) {
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

  // 2. Partido EN VIVO (por estado explícito o por horario)
  if (match.status === 'LIVE' || (kickoffMs > 0 && nowMs >= kickoffMs && nowMs < finishMs)) {
    const elapsedMinutes = kickoffMs > 0 ? Math.floor((nowMs - kickoffMs) / 60000) : 0;
    let liveMinuteStr = match.liveMinute;

    if (!liveMinuteStr || liveMinuteStr === 'Finalizado' || liveMinuteStr.includes('•') || liveMinuteStr === 'Prog.') {
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
    }

    const effectiveMin = elapsedMinutes <= 45 ? elapsedMinutes : (elapsedMinutes > 60 ? elapsedMinutes - 15 : 45);
    const visibleEvents = match.events && match.events.length > 0
      ? (match.status === 'LIVE' ? match.events : match.events.filter(e => e.minute <= effectiveMin))
      : [];

    let hScore = match.homeScore;
    let aScore = match.awayScore;

    if (hScore === undefined || aScore === undefined) {
      let hs = 0;
      let as = 0;
      visibleEvents.forEach(e => {
        if (e.type === 'goal' || e.type === 'penalty_goal') {
          if (e.team === 'home') hs++;
          if (e.team === 'away') as++;
        }
      });
      hScore = hScore ?? hs;
      aScore = aScore ?? as;
    }

    return {
      fixture: match,
      status: 'LIVE',
      homeScore: hScore ?? 0,
      awayScore: aScore ?? 0,
      liveMinute: liveMinuteStr,
      elapsedMinutes: Math.max(0, elapsedMinutes),
      isLive: true,
      isFinished: false,
      isScheduled: false,
      visibleEvents,
    };
  }

  // 3. Partido PROGRAMADO (Aún no empezó)
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

export interface RoundStatusInfo {
  roundNumber: number;
  isRoundInPlay: boolean;
  firstMatch: MatchFixture;
  lastMatch: MatchFixture;
  timeRemainingMs: number;
  finishedMatchesCount: number;
  liveMatchesCount: number;
  scheduledMatchesCount: number;
  totalMatchesCount: number;
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
    const sortedMatches = [...matches].sort((a, b) => {
      const aT = a.kickoff ? new Date(a.kickoff).getTime() : 0;
      const bT = b.kickoff ? new Date(b.kickoff).getTime() : 0;
      return aT - bT;
    });

    const firstMatch = sortedMatches[0];
    const lastMatch = sortedMatches[sortedMatches.length - 1];

    const firstKickoffMs = firstMatch.kickoff ? new Date(firstMatch.kickoff).getTime() : 0;
    const lastKickoffEndMs = (lastMatch.kickoff ? new Date(lastMatch.kickoff).getTime() : 0) + MATCH_DURATION_MS;

    // Si todos los partidos de la fecha tienen status FINISHED, saltar a la siguiente
    const allFinished = matches.every(m => m.status === 'FINISHED');
    if (allFinished) {
      continue;
    }

    // 1. ¿Está la fecha EN JUEGO? (Ya comenzó el primer partido y no terminó el último)
    if (firstKickoffMs > 0 && nowMs >= firstKickoffMs && nowMs <= lastKickoffEndMs) {
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
      const nextMatch = sortedMatches.find(m => (m.kickoff ? new Date(m.kickoff).getTime() : 0) > nowMs) || lastMatch;

      return {
        roundNumber: rNum,
        isRoundInPlay: true,
        firstMatch,
        lastMatch,
        timeRemainingMs: Math.max(0, (nextMatch.kickoff ? new Date(nextMatch.kickoff).getTime() : 0) - nowMs),
        finishedMatchesCount: finished,
        liveMatchesCount: live,
        scheduledMatchesCount: scheduled,
        totalMatchesCount: sortedMatches.length,
        nextUpcomingMatch: nextMatch,
      };
    }

    // 2. ¿Es esta la próxima fecha futura que aún no empezó?
    if (firstKickoffMs > 0 && nowMs < firstKickoffMs) {
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

    // Si tiene partidos SCHEDULED pero la fecha está pendiente
    const hasScheduled = matches.some(m => m.status === 'SCHEDULED' || !m.status);
    if (hasScheduled) {
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
  const lastRoundNum = roundNumbers[roundNumbers.length - 1] || 7;
  const lastRoundMatches = grouped[lastRoundNum] || [];
  const firstM = lastRoundMatches[0] || FIXTURES_DATA[0];
  const lastM = lastRoundMatches[lastRoundMatches.length - 1] || FIXTURES_DATA[FIXTURES_DATA.length - 1];

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

function cleanTeamString(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza nombres de clubes a los 30 nombres canónicos utilizados en FIXTURES_DATA
 */
export function toCanonicalTeamName(raw: string): string {
  const c = cleanTeamString(raw);
  if (!c) return raw;

  if (c.includes('mendoza') || c.includes('mza') || c.includes('gimnasia m')) return 'Gimnasia y Esgrima de Mendoza';
  if (c.includes('gimnasia') || c.includes('gimnasia lp') || c.includes('gimnasia la plata')) return 'Gimnasia y Esgrima La Plata';
  if (c.includes('cuarto') || c.includes('estudiantes rc') || c.includes('estudiantes de rio')) return 'Estudiantes de Río Cuarto';
  if (c.includes('estudiantes')) return 'Estudiantes de La Plata';
  if (c.includes('rivadavia') || c.includes('ind rivadavia') || c.includes('independiente rivadavia')) return 'Independiente Rivadavia';
  if (c.includes('independiente')) return 'Independiente';
  if (c.includes('central cordoba') || c.includes('central cba') || c.includes('sde') || c.includes('santiago del estero')) return 'Central Córdoba de SDE';
  if (c.includes('rosario central') || (c.includes('central') && !c.includes('barracas') && !c.includes('cordoba'))) return 'Rosario Central';
  if (c.includes('barracas')) return 'Barracas Central';
  if (c.includes('sarmiento')) return 'Sarmiento de Junín';
  if (c.includes('talleres')) return 'Talleres de Córdoba';
  if (c.includes('belgrano')) return 'Belgrano de Córdoba';
  if (c.includes('instituto')) return 'Instituto de Córdoba';
  if (c.includes('san lorenzo')) return 'San Lorenzo de Almagro';
  if (c.includes('union') || c.includes('unión')) return 'Unión de Santa Fe';
  if (c.includes('velez') || c.includes('vélez')) return 'Vélez Sarsfield';
  if (c.includes('newell') || c.includes('nob')) return "Newell's Old Boys";
  if (c.includes('defensa')) return 'Defensa y Justicia';
  if (c.includes('riestra')) return 'Deportivo Riestra';
  if (c.includes('boca')) return 'Boca Juniors';
  if (c.includes('river')) return 'River Plate';
  if (c.includes('racing')) return 'Racing Club';
  if (c.includes('huracan') || c.includes('huracán')) return 'Huracán';
  if (c.includes('lanus') || c.includes('lanús')) return 'Lanús';
  if (c.includes('banfield')) return 'Banfield';
  if (c.includes('tigre')) return 'Tigre';
  if (c.includes('platense')) return 'Platense';
  if (c.includes('aldosivi')) return 'Aldosivi';
  if (c.includes('argentinos')) return 'Argentinos Juniors';
  if (c.includes('tucuman') || c.includes('tucumán')) return 'Atlético Tucumán';

  return raw;
}

export function areTeamNamesEqual(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  const cA = toCanonicalTeamName(nameA);
  const cB = toCanonicalTeamName(nameB);
  if (cA === cB) return true;

  const a = cleanTeamString(nameA);
  const b = cleanTeamString(nameB);
  if (a === b) return true;

  // Prevent false substring collisions between distinct clubs with similar words
  if (
    a.includes('rivadavia') !== b.includes('rivadavia') ||
    a.includes('cuarto') !== b.includes('cuarto') ||
    a.includes('mendoza') !== b.includes('mendoza') ||
    a.includes('cordoba') !== b.includes('cordoba')
  ) {
    return false;
  }

  return a.includes(b) || b.includes(a);
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
    dateStr?: string;
    kickoff?: string;
    events?: MatchEvent[];
  }>
): boolean {
  if (!promiedosMatches || promiedosMatches.length === 0) return false;

  let hasChanges = false;

  promiedosMatches.forEach(pm => {
    // Buscar coincidencia directa o invertida
    const match = FIXTURES_DATA.find(base => {
      const direct = areTeamNamesEqual(pm.homeTeam, base.homeTeam) && areTeamNamesEqual(pm.awayTeam, base.awayTeam);
      const inverted = areTeamNamesEqual(pm.homeTeam, base.awayTeam) && areTeamNamesEqual(pm.awayTeam, base.homeTeam);
      return direct || inverted;
    });

    if (match) {
      const isInverted = areTeamNamesEqual(pm.homeTeam, match.awayTeam) && areTeamNamesEqual(pm.awayTeam, match.homeTeam);
      const targetHomeScore = isInverted ? pm.awayScore : pm.homeScore;
      const targetAwayScore = isInverted ? pm.homeScore : pm.awayScore;

      // Adaptar eventos si los equipos están invertidos
      let adaptedEvents = pm.events;
      if (isInverted && pm.events && pm.events.length > 0) {
        adaptedEvents = pm.events.map(ev => ({
          ...ev,
          team: ev.team === 'home' ? 'away' : 'home',
        }));
      }

      const statusChanged = match.status !== pm.status;
      const scoreChanged = match.homeScore !== targetHomeScore || match.awayScore !== targetAwayScore;
      const liveMinChanged = match.liveMinute !== pm.liveMinute;
      const timeChanged = (pm.displayTime && pm.displayTime !== match.displayTime) || (pm.kickoff && pm.kickoff !== match.kickoff);

      if (statusChanged || scoreChanged || liveMinChanged || timeChanged) {
        match.status = pm.status;
        match.homeScore = targetHomeScore !== undefined ? targetHomeScore : match.homeScore;
        match.awayScore = targetAwayScore !== undefined ? targetAwayScore : match.awayScore;
        match.liveMinute = pm.liveMinute || match.liveMinute;
        if (pm.displayTime) match.displayTime = pm.displayTime;
        if (pm.dateStr) match.dateStr = pm.dateStr;
        if (pm.kickoff) match.kickoff = pm.kickoff;
        if (adaptedEvents && adaptedEvents.length > 0) {
          match.events = adaptedEvents;
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
