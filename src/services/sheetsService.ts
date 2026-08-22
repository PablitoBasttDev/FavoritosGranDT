import { Player, Position } from '../types';
import defaultPlayersSnapshot from '../data/liveSheetSnapshot.json';

export const DEFAULT_GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSCtCdSe6xW7FVnObApbhqwfLF6sOhNkVxG4yr_k3ry8Jn6yUBOisyM_mVNakwPePQFU2pUuyza4Zn/pub?output=csv';

const STORAGE_KEY_ACTIVE_URL = 'gran_dt_active_sheet_url_v1';
const STORAGE_KEY_ACTIVE_ROUND = 'gran_dt_active_sheet_round_v1';

/**
 * Convierte cualquier formato de URL de Google Sheets (Web, Compartido, PubHTML o Edit)
 * al enlace directo de descarga CSV publicado.
 */
export function formatGoogleSheetCsvUrl(url: string): string {
  if (!url || !url.trim()) return DEFAULT_GOOGLE_SHEETS_CSV_URL;
  let clean = url.trim();

  // Si ya es un pub CSV
  if (clean.includes('pub?output=csv') || clean.includes('export?format=csv')) {
    return clean;
  }

  // Si termina en pubhtml o contiene /pubhtml
  if (clean.includes('/pubhtml')) {
    return clean.replace(/\/pubhtml(\?.*)?$/, '/pub?output=csv');
  }

  // Si termina en /pub sin query
  if (clean.includes('/pub') && !clean.includes('output=')) {
    return clean.replace(/\/pub(\?.*)?$/, '/pub?output=csv');
  }

  // Si es un link de Google Sheet estándar /d/{ID}/edit...
  const docMatch = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch && docMatch[1]) {
    const sheetId = docMatch[1];
    // Si contiene pub o 2PACX (publicado en la web)
    if (clean.includes('/e/')) {
      return `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`;
    }
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  }

  return clean;
}

export function getActiveGoogleSheetUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_URL);
    if (saved && saved.trim().length > 10) {
      return saved;
    }
  }
  return DEFAULT_GOOGLE_SHEETS_CSV_URL;
}

export function setActiveGoogleSheetUrl(rawUrl: string, roundLabel?: string): string {
  const formatted = formatGoogleSheetCsvUrl(rawUrl);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ACTIVE_URL, formatted);
    if (roundLabel) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ROUND, roundLabel);
    }
  }
  return formatted;
}

export function getActiveRoundLabel(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ROUND);
    if (saved) return saved;
  }
  return 'Fecha 5 (Oficial Planeta Gran DT)';
}

export function resetToDefaultSheetUrl(): string {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_URL);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_ROUND);
  }
  return DEFAULT_GOOGLE_SHEETS_CSV_URL;
}

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

const STORAGE_KEY_PLAYERS = 'el_gran_asistente_sheet_players_v3';
const STORAGE_KEY_TIMESTAMP = 'el_gran_asistente_sheet_last_sync_v3';

export interface SheetSyncResult {
  players: Player[];
  lastUpdated: number;
  isLive: boolean;
  detectedRound?: string;
  error?: string;
}

/**
 * Inicia el motor de sincronización automática en segundo plano.
 * Consulta la hoja de Google Sheets de Planeta Gran DT al cargar y periódicamente cada 45 segundos,
 * o cuando la ventana vuelve a tener foco (tab activo).
 */
export function initBackgroundAutoSync(onUpdate?: (result: SheetSyncResult) => void): () => void {
  let isChecking = false;

  const runSync = async () => {
    if (isChecking) return;
    isChecking = true;
    try {
      const res = await fetchLiveSheetPlayers();
      if (onUpdate) onUpdate(res);
    } catch (e) {
      console.warn('Auto-sync en segundo plano:', e);
    } finally {
      isChecking = false;
    }
  };

  // 1. Ejecutar inmediatamente al inicio
  runSync();

  // 2. Intervalo periódico en segundo plano (cada 45 segundos)
  const intervalId = setInterval(runSync, 45000);

  // 3. Ejecutar cuando el usuario vuelve a la pestaña
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      runSync();
    }
  };
  window.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', runSync);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', runSync);
  };
}


export function detectRoundFromPlayers(players: Player[]): string {
  if (!players || players.length === 0) return 'Fecha 5 (Oficial Planeta Gran DT)';

  // Contar cuántos jugadores tienen puntajes numéricos válidos en cada fecha
  for (let f = 18; f >= 1; f--) {
    const key = `F${f}`;
    const playersWithScores = players.filter(p => {
      const val = p.fechasPuntajes?.[key];
      if (val === undefined || val === null || val === '' || val === '-') return false;
      const num = Number(val);
      return !isNaN(num) && num > 0;
    });

    // Si al menos 40 futbolistas tienen puntaje en la fecha, esa fecha ya está cerrada/publicada
    if (playersWithScores.length >= 40) {
      return `Fecha ${f} (Oficial Planeta Gran DT)`;
    }
  }

  return 'Fecha 5 (Oficial Planeta Gran DT)';
}

type SheetUpdateListener = (result: SheetSyncResult) => void;
const listeners = new Set<SheetUpdateListener>();

export function subscribeToLiveSheet(listener: SheetUpdateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(result: SheetSyncResult) {
  listeners.forEach(fn => {
    try {
      fn(result);
    } catch (e) {
      console.error('Error en listener de hoja en vivo:', e);
    }
  });
}

export async function fetchLiveSheetPlayers(customUrl?: string): Promise<SheetSyncResult> {
  const targetUrl = formatGoogleSheetCsvUrl(customUrl || getActiveGoogleSheetUrl());
  try {
    const response = await fetch(targetUrl, {
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
      const detectedRound = detectRoundFromPlayers(parsedPlayers);
      try {
        localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(parsedPlayers));
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, now.toString());
        localStorage.setItem(STORAGE_KEY_ACTIVE_ROUND, detectedRound);
      } catch {
        // Ignore quota limits
      }

      const result: SheetSyncResult = {
        players: parsedPlayers,
        lastUpdated: now,
        isLive: true,
        detectedRound,
      };

      notifyListeners(result);
      return result;
    } else {
      throw new Error('Formato de datos incompleto o columnas no coincidentes en Google Sheet');
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
          const detectedRound = detectRoundFromPlayers(list as Player[]);
          const result: SheetSyncResult = {
            players: list as Player[],
            lastUpdated: timestamp ? parseInt(timestamp, 10) : Date.now(),
            isLive: false,
            detectedRound,
            error: err.message,
          };
          return result;
        }
      }
    } catch {
      // ignore
    }

    // Default snapshot
    const defPlayers = defaultPlayersSnapshot as unknown as Player[];
    const detectedRound = detectRoundFromPlayers(defPlayers);
    const result: SheetSyncResult = {
      players: defPlayers,
      lastUpdated: Date.now(),
      isLive: false,
      detectedRound,
      error: err.message,
    };
    return result;
  }
}


export function getCachedSheetPlayers(): Player[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list) && list.length > 0) {
        const first = list[0];
        if (first && typeof first.promedio === 'number' && first.fechasPuntajes) {
          return list as Player[];
        }
      }
    }
  } catch {
    // ignore
  }
  return defaultPlayersSnapshot as unknown as Player[];
}
