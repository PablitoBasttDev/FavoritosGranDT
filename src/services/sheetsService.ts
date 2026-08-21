import { Player, Position } from '../types';
import defaultPlayersSnapshot from '../data/liveSheetSnapshot.json';

export const GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSCtCdSe6xW7FVnObApbhqwfLF6sOhNkVxG4yr_k3ry8Jn6yUBOisyM_mVNakwPePQFU2pUuyza4Zn/pub?output=csv';

export const SHEET_TEAM_MAP: Record<string, string> = {
  'Aldosivi': 'Aldosivi',
  'Argentinos': 'Argentinos Juniors',
  'Argentinos Juniors': 'Argentinos Juniors',
  'Atl. Tucumán': 'Atlético Tucumán',
  'Atlético Tucumán': 'Atlético Tucumán',
  'Banfield': 'Banfield',
  'Barracas': 'Barracas Central',
  'Barracas Ctral.': 'Barracas Central',
  'Barracas Central': 'Barracas Central',
  'Belgrano': 'Belgrano de Córdoba',
  'Belgrano de Córdoba': 'Belgrano de Córdoba',
  'Boca': 'Boca Juniors',
  'Boca Juniors': 'Boca Juniors',
  'Central Cba': 'Central Córdoba de SDE',
  'Central Córdoba': 'Central Córdoba de SDE',
  'Central Córdoba de SDE': 'Central Córdoba de SDE',
  'Central Córdoba (SdE)': 'Central Córdoba de SDE',
  'Ctral. Córdoba': 'Central Córdoba de SDE',
  'Defensa': 'Defensa y Justicia',
  'Def. y Justicia': 'Defensa y Justicia',
  'Defensa y Justicia': 'Defensa y Justicia',
  'Riestra': 'Deportivo Riestra',
  'Dep. Riestra': 'Deportivo Riestra',
  'Deportivo Riestra': 'Deportivo Riestra',
  'Estudiantes': 'Estudiantes de La Plata',
  'Estudiantes LP': 'Estudiantes de La Plata',
  'Estudiantes de La Plata': 'Estudiantes de La Plata',
  'Estudiantes RC': 'Estudiantes de Río Cuarto',
  'Estudiantes de Río Cuarto': 'Estudiantes de Río Cuarto',
  'Estudiantes de Rio Cuarto': 'Estudiantes de Río Cuarto',
  'Gimnasia LP': 'Gimnasia y Esgrima La Plata',
  'Gimnasia y Esgrima La Plata': 'Gimnasia y Esgrima La Plata',
  'Gimnasia Mza': 'Gimnasia y Esgrima de Mendoza',
  'Gimnasia de Mendoza': 'Gimnasia y Esgrima de Mendoza',
  'Gimnasia y Esgrima de Mendoza': 'Gimnasia y Esgrima de Mendoza',
  'Gimnasia y Esgrima (Mendoza)': 'Gimnasia y Esgrima de Mendoza',
  'Huracán': 'Huracán',
  'Huracan': 'Huracán',
  'Ind. Rivadavia': 'Independiente Rivadavia',
  'Independiente Rivadavia': 'Independiente Rivadavia',
  'Independiente': 'Independiente',
  'Instituto': 'Instituto de Córdoba',
  'Instituto de Córdoba': 'Instituto de Córdoba',
  'Lanús': 'Lanús',
  'Lanus': 'Lanús',
  "Newell's": "Newell's Old Boys",
  "Newells": "Newell's Old Boys",
  "Newell's Old Boys": "Newell's Old Boys",
  'Platense': 'Platense',
  'Racing': 'Racing Club',
  'Racing Club': 'Racing Club',
  'River': 'River Plate',
  'River Plate': 'River Plate',
  'Rosario Ctral.': 'Rosario Central',
  'Rosario Central': 'Rosario Central',
  'San Lorenzo': 'San Lorenzo de Almagro',
  'San Lorenzo de Almagro': 'San Lorenzo de Almagro',
  'Sarmiento': 'Sarmiento de Junín',
  'Sarmiento de Junín': 'Sarmiento de Junín',
  'Talleres': 'Talleres de Córdoba',
  'Talleres de Córdoba': 'Talleres de Córdoba',
  'Tigre': 'Tigre',
  'Unión': 'Unión de Santa Fe',
  'Union': 'Unión de Santa Fe',
  'Unión de Santa Fe': 'Unión de Santa Fe',
  'Vélez': 'Vélez Sarsfield',
  'Velez': 'Vélez Sarsfield',
  'Vélez Sarsfield': 'Vélez Sarsfield',
};

function parseNumber(value: string | undefined, isFloat = false): number {
  if (!value) return 0;
  const clean = value.trim().replace('$', '').replace(/\./g, '').replace(',', '.');
  const num = isFloat ? parseFloat(clean) : parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
}

// Simple CSV parser handling quotes
export function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/);
  const rows: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let inQuotes = false;
    let currentField = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    row.push(currentField);
    rows.push(row);
  }

  return rows;
}

export function parsePlayersFromCSV(csvText: string): Player[] {
  const rows = parseCSV(csvText);
  let header: string[] | null = null;
  const players: Player[] = [];
  let idCounter = 1;

  for (const row of rows) {
    if (!row || row.length < 4) continue;

    // Detect header row
    if (row[0]?.trim() === 'Jugador' && row[1]?.trim() === 'POS') {
      header = row.map(h => h.trim());
      continue;
    }

    if (header && ['ARQ', 'DEF', 'VOL', 'DEL'].includes(row[1]?.trim())) {
      const rawObj: Record<string, string> = {};
      header.forEach((h, i) => {
        rawObj[h] = row[i] ? row[i].trim() : '';
      });

      const rawTeam = rawObj['Equipo'] || '';
      const mappedTeam = SHEET_TEAM_MAP[rawTeam] || rawTeam;
      const cotiz = rawObj['Cotización'] || '';
      const precioNum = parseNumber(cotiz);

      // Promedio torneo (PrT) and Gran DT (PrG)
      const prt = parseNumber(rawObj['PrT'], true);
      const prg = parseNumber(rawObj['PrG'], true);
      const act = parseNumber(rawObj['AcT']);
      const ct = parseNumber(rawObj['CT']);
      const gt = parseNumber(rawObj['GT']);
      const vf = parseNumber(rawObj['VF']);
      const vi = parseNumber(rawObj['VI']);
      const ta = parseNumber(rawObj['TA']);
      const tr = parseNumber(rawObj['TR']);
      const pe = parseNumber(rawObj['PE']);
      const pa = parseNumber(rawObj['PA']);
      const gp = parseNumber(rawObj['GP']);

      // Individual fixture points F1..F18
      const fechasPuntajes: Record<string, string | number> = {};
      for (let f = 1; f <= 18; f++) {
        const key = `F${f}`;
        if (rawObj[key]) {
          fechasPuntajes[key] = rawObj[key];
        }
      }

      players.push({
        id: idCounter++,
        nombre: rawObj['Jugador'] || '',
        equipo: mappedTeam,
        posicion: rawObj['POS'] as Position,
        precio: cotiz || `$ ${precioNum.toLocaleString('es-AR')}`,
        precioNum,
        promedio: prt,
        promedioGranDT: prg,
        puntosTotales: act,
        partidosJugados: ct,
        goles: gt,
        figura: vf,
        vallaInvicta: vi,
        amarillas: ta,
        rojas: tr,
        penalesErrados: pe,
        penalesAtajados: pa,
        golesPenal: gp,
        fechasPuntajes,
      });
    }
  }

  return players;
}

const STORAGE_KEY_PLAYERS = 'el_gran_asistente_sheet_players_v1';
const STORAGE_KEY_TIMESTAMP = 'el_gran_asistente_sheet_last_sync';

export interface SheetSyncResult {
  players: Player[];
  lastUpdated: number;
  isLive: boolean;
  error?: string;
}

export async function fetchLiveSheetPlayers(): Promise<SheetSyncResult> {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv, text/plain, */*',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Error en servidor de Google Sheets (${response.status})`);
    }

    const csvText = await response.text();
    const parsedPlayers = parsePlayersFromCSV(csvText);

    if (parsedPlayers.length >= 200) {
      const now = Date.now();
      try {
        localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(parsedPlayers));
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, now.toString());
      } catch {
        // Ignore quota limits
      }
      return {
        players: parsedPlayers,
        lastUpdated: now,
        isLive: true,
      };
    } else {
      throw new Error('Formato de datos incompleto en Google Sheet');
    }
  } catch (err: any) {
    console.warn('Fallback a snapshot local de Google Sheets:', err);
    // Try localStorage first
    try {
      const cached = localStorage.getItem(STORAGE_KEY_PLAYERS);
      const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
      if (cached) {
        const list = JSON.parse(cached);
        if (Array.isArray(list) && list.length > 0) {
          return {
            players: list as Player[],
            lastUpdated: timestamp ? parseInt(timestamp, 10) : Date.now(),
            isLive: false,
            error: err.message,
          };
        }
      }
    } catch {
      // ignore
    }

    // Default snapshot
    return {
      players: defaultPlayersSnapshot as unknown as Player[],
      lastUpdated: Date.now(),
      isLive: false,
      error: err.message,
    };
  }
}

export function getCachedSheetPlayers(): Player[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list) && list.length > 0) {
        return list as Player[];
      }
    }
  } catch {
    // ignore
  }
  return defaultPlayersSnapshot as unknown as Player[];
}
