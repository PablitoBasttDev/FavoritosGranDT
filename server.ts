import express from 'express';
import path from 'path';
import * as cheerio from 'cheerio';
import defaultPlayersSnapshot from './src/data/liveSheetSnapshot.js';
import { FIXTURES_DATA, getTournamentRoundStatus } from './src/data/fixture.js';
import { RAW_STANDINGS_DATA, getDynamicStandings } from './src/data/standings.js';
import { getDynamicTopScorers, getDynamicClubDefenseStats } from './src/data/tournamentStats.js';

const app = express();
const PORT = 3000;

app.use(express.json());

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const PROMIEDOS_HEADERS = {
  'X-VER': '1.11.7.3',
  'User-Agent': BROWSER_USER_AGENT,
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Referer': 'https://www.promiedos.com.ar/',
};

function safeTimeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof (AbortSignal as any).timeout === 'function') {
    try {
      return (AbortSignal as any).timeout(ms);
    } catch {
      // Fallback below
    }
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

// ============================================================================
// PROMIEDOS LIVE FIXTURE SCRAPING & NORMALIZATION ENGINE
// ============================================================================

interface PromiedosLiveMatch {
  id: string;
  promiedosId?: string;
  fecha: number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  liveMinute: string;
  displayTime: string;
  dateStr?: string;
  kickoff?: string;
  stadium?: string;
  isInterzonal?: boolean;
  tvNetworks?: string[];
  events: Array<{
    id: string;
    minute: number;
    type: 'goal' | 'penalty_goal' | 'own_goal' | 'red_card' | 'second_yellow' | 'yellow_card' | 'penalty_saved';
    team: 'home' | 'away';
    playerName: string;
    assistPlayerName?: string;
    detail?: string;
  }>;
}

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function formatPromiedosSchedule(start_time: string) {
  if (!start_time) {
    return { dateStr: 'A confirmar', kickoff: '', displayTime: 'Horario a confirmar' };
  }
  const match = start_time.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/);
  if (!match) {
    return { dateStr: start_time, kickoff: '', displayTime: start_time };
  }

  const [_, dayStr, monthStr, yearStr, hourStr, minStr] = match;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const year = parseInt(yearStr, 10);
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);

  // Add 4 hours to convert Promiedos UTC/base timestamp to Argentina Local Time
  const dateObj = new Date(year, month, day, hour + 4, min);

  const adjYear = dateObj.getFullYear();
  const adjMonth = dateObj.getMonth();
  const adjDay = dateObj.getDate();
  const adjHour = dateObj.getHours();
  const adjMin = dateObj.getMinutes();

  const dayOfWeek = DAYS_ES[dateObj.getDay()];
  const monthName = MONTHS_ES[adjMonth];

  const pad = (n: number) => n.toString().padStart(2, '0');
  const isoKickoff = `${adjYear}-${pad(adjMonth + 1)}-${pad(adjDay)}T${pad(adjHour)}:${pad(adjMin)}:00-03:00`;
  const dateStr = `${dayOfWeek} ${adjDay} de ${monthName} de ${adjYear}`;
  const displayTime = `${dayOfWeek} ${pad(adjDay)}/${pad(adjMonth + 1)} • ${pad(adjHour)}:${pad(adjMin)} hs`;

  return { dateStr, kickoff: isoKickoff, displayTime };
}

interface PromiedosCache {
  lastFetched: number;
  currentRound: number;
  matches: PromiedosLiveMatch[];
  allRounds: Record<number, PromiedosLiveMatch[]>;
  source: 'promiedos' | 'fallback';
}

let cachedData: PromiedosCache | null = null;
const CACHE_TTL_MS = 45 * 1000; // 45s in-memory server cache for real-time live updates

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
function normalizeTeamName(raw: string): string {
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

  return raw.trim();
}

function parsePromiedosGame(g: any, roundNumber: number, idx: number): PromiedosLiveMatch {
  const homeRaw = g.teams?.[0]?.name || g.teams?.[0]?.short_name || '';
  const awayRaw = g.teams?.[1]?.name || g.teams?.[1]?.short_name || '';
  const homeTeam = normalizeTeamName(homeRaw);
  const awayTeam = normalizeTeamName(awayRaw);

  let status: 'SCHEDULED' | 'LIVE' | 'FINISHED' = 'SCHEDULED';
  let liveMinute = g.game_time_status_to_display || g.status?.name || '';
  const statusEnum = g.status?.enum;

  if (statusEnum === 3 || g.status?.name?.toLowerCase().includes('fin')) {
    status = 'FINISHED';
    liveMinute = 'Finalizado';
  } else if (
    statusEnum === 2 ||
    liveMinute.includes('PT') ||
    liveMinute.includes('ST') ||
    liveMinute.includes('Entre') ||
    liveMinute.includes('ET') ||
    (typeof g.game_time === 'number' && g.game_time > 0 && statusEnum !== 3)
  ) {
    status = 'LIVE';
    if (!liveMinute && typeof g.game_time === 'number') {
      liveMinute = `${g.game_time}'`;
    }
  } else {
    status = 'SCHEDULED';
  }

  let homeScore: number | undefined = undefined;
  let awayScore: number | undefined = undefined;
  const events: PromiedosLiveMatch['events'] = [];

  if (status !== 'SCHEDULED') {
    if (Array.isArray(g.scores) && g.scores.length >= 2) {
      homeScore = typeof g.scores[0] === 'number' ? g.scores[0] : undefined;
      awayScore = typeof g.scores[1] === 'number' ? g.scores[1] : undefined;
    } else if (g.teams?.[0]?.score !== undefined && g.teams?.[1]?.score !== undefined) {
      const hs = parseInt(g.teams[0].score, 10);
      const as_ = parseInt(g.teams[1].score, 10);
      if (!isNaN(hs)) homeScore = hs;
      if (!isNaN(as_)) awayScore = as_;
    }

    // Home events
    (g.teams?.[0]?.goals || []).forEach((goal: any, gIdx: number) => {
      events.push({
        id: `ev-prom-${g.id || idx}-h-${gIdx}`,
        minute: typeof goal.time === 'number' ? goal.time : 0,
        type: goal.goal_type?.toLowerCase().includes('pen') ? 'penalty_goal' : 'goal',
        team: 'home',
        playerName: goal.player_name || goal.player_sname || 'Gol',
        detail: goal.goal_type || 'Gol',
      });
    });

    if (g.teams?.[0]?.red_cards > 0) {
      for (let rc = 0; rc < g.teams[0].red_cards; rc++) {
        events.push({
          id: `ev-prom-${g.id || idx}-h-red-${rc}`,
          minute: 80,
          type: 'red_card',
          team: 'home',
          playerName: 'Tarjeta Roja',
          detail: 'Expulsión',
        });
      }
    }

    // Away events
    (g.teams?.[1]?.goals || []).forEach((goal: any, gIdx: number) => {
      events.push({
        id: `ev-prom-${g.id || idx}-a-${gIdx}`,
        minute: typeof goal.time === 'number' ? goal.time : 0,
        type: goal.goal_type?.toLowerCase().includes('pen') ? 'penalty_goal' : 'goal',
        team: 'away',
        playerName: goal.player_name || goal.player_sname || 'Gol',
        detail: goal.goal_type || 'Gol',
      });
    });

    if (g.teams?.[1]?.red_cards > 0) {
      for (let rc = 0; rc < g.teams[1].red_cards; rc++) {
        events.push({
          id: `ev-prom-${g.id || idx}-a-red-${rc}`,
          minute: 80,
          type: 'red_card',
          team: 'away',
          playerName: 'Tarjeta Roja',
          detail: 'Expulsión',
        });
      }
    }

    events.sort((a, b) => a.minute - b.minute);
  }

  const tvList = (g.tv_networks || []).map((t: any) => t.name).filter(Boolean);
  const scheduleInfo = formatPromiedosSchedule(g.start_time || '');

  return {
    id: `prom-${g.id || `${roundNumber}-${idx + 1}`}`,
    promiedosId: g.id,
    fecha: roundNumber,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    status,
    liveMinute,
    displayTime: scheduleInfo.displayTime,
    dateStr: scheduleInfo.dateStr,
    kickoff: scheduleInfo.kickoff,
    tvNetworks: tvList,
    events,
  };
}

async function fetchPromiedosLiveData(targetRound?: number): Promise<PromiedosCache> {
  const now = Date.now();
  if (cachedData && now - cachedData.lastFetched < CACHE_TTL_MS) {
    if (!targetRound || cachedData.allRounds[targetRound]) {
      return cachedData;
    }
  }

  const allRounds: Record<number, PromiedosLiveMatch[]> = cachedData ? { ...cachedData.allRounds } : {};
  let activeRoundNumber = cachedData?.currentRound || 7;
  const currentMatches: PromiedosLiveMatch[] = [];

  try {
    // 1. Fetch the main league structure to discover filters and the preloaded active round games
    let filterList: Array<{ name: string; key: string; selected?: boolean }> = [];
    let initialSelectedRound = 7;

    try {
      const leagueRes = await fetch('https://www.promiedos.com.ar/league/liga-profesional/hc', {
        headers: PROMIEDOS_HEADERS,
        signal: safeTimeoutSignal(3500),
      });
      if (leagueRes.ok) {
        const html = await leagueRes.text();
        const $ = cheerio.load(html);
        const nextData = JSON.parse($('#__NEXT_DATA__').html() || '{}');
        const gamesData = nextData.props?.pageProps?.data?.games;
        filterList = gamesData?.filters || [];

        // Directly extract the preloaded games for the active/selected round
        const preloadedGames = gamesData?.games;
        if (Array.isArray(preloadedGames) && preloadedGames.length > 0) {
          const selectedFilter = filterList.find(f => f.selected);
          const roundNameMatch = (preloadedGames[0]?.stage_round_name || selectedFilter?.name || '').match(/Fecha\s+(\d+)/i);
          initialSelectedRound = roundNameMatch ? parseInt(roundNameMatch[1], 10) : 7;
          allRounds[initialSelectedRound] = preloadedGames.map((g: any, idx: number) =>
            parsePromiedosGame(g, initialSelectedRound, idx)
          );
          activeRoundNumber = initialSelectedRound;
        }
      } else {
        console.warn(`[PROMIEDOS_FETCH_NOTICE] League discovery HTTP ${leagueRes.status}`);
      }
    } catch (err) {
      console.warn('[PROMIEDOS_FETCH_NOTICE] League structure discovery notice:', (err as Error).message);
    }

    // Isolate ONLY Torneo Clausura 2026 filters
    const clausuraFilters = filterList.filter(
      f => f.key?.startsWith('72_228_8_') || f.key?.includes('_8_')
    );
    const effectiveFilters = clausuraFilters.length > 0 ? clausuraFilters : filterList;

    // 2. Determine target rounds to fetch: focused on active round, neighbors (±1), and any requested round
    const targetRoundNumbers = new Set<number>();
    if (targetRound && targetRound > 0) targetRoundNumbers.add(targetRound);
    targetRoundNumbers.add(activeRoundNumber);
    if (activeRoundNumber > 1) targetRoundNumbers.add(activeRoundNumber - 1);
    if (activeRoundNumber < 16) targetRoundNumbers.add(activeRoundNumber + 1);

    // Filter down to only needed round filters that aren't already loaded
    const filtersToFetch = effectiveFilters.filter(f => {
      const matchFecha = f.name?.match(/Fecha\s+(\d+)/i);
      const fechaNum = matchFecha ? parseInt(matchFecha[1], 10) : 0;
      return fechaNum > 0 && targetRoundNumbers.has(fechaNum) && (!allRounds[fechaNum] || allRounds[fechaNum].length === 0);
    });

    // Fetch only the 2-3 focused rounds concurrently
    if (filtersToFetch.length > 0) {
      const roundFetchPromises = filtersToFetch.map(async filter => {
        const matchFecha = filter.name?.match(/Fecha\s+(\d+)/i);
        const fechaNum = matchFecha ? parseInt(matchFecha[1], 10) : 0;
        if (fechaNum > 0 && filter.key) {
          try {
            const res = await fetch(`https://api.promiedos.com.ar/league/games/hc/${filter.key}`, {
              headers: PROMIEDOS_HEADERS,
              signal: safeTimeoutSignal(3500),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.games && Array.isArray(data.games)) {
                const parsed = data.games.map((g: any, idx: number) =>
                  parsePromiedosGame(g, fechaNum, idx)
                );
                return { fechaNum, matches: parsed };
              }
            }
          } catch (err) {
            console.warn(`[PROMIEDOS_FETCH_NOTICE] Round ${fechaNum} fetch notice:`, (err as Error).message);
          }
        }
        return null;
      });

      const settledResults = await Promise.allSettled(roundFetchPromises);
      settledResults.forEach(r => {
        if (r.status === 'fulfilled' && r.value) {
          allRounds[r.value.fechaNum] = r.value.matches;
        }
      });
    }

    // 3. If no rounds were fetched from filters, try latest endpoint as fallback
    if (Object.keys(allRounds).length === 0) {
      try {
        const latestRes = await fetch('https://api.promiedos.com.ar/league/games/hc/latest', {
          headers: PROMIEDOS_HEADERS,
          signal: safeTimeoutSignal(3500),
        });
        if (latestRes.ok) {
          const latestData = await latestRes.json();
          if (latestData.games && Array.isArray(latestData.games)) {
            const matchFecha = latestData.games[0]?.stage_round_name?.match(/Fecha\s+(\d+)/i);
            const roundNum = matchFecha ? parseInt(matchFecha[1], 10) : 6;

            const parsedMatches = latestData.games.map((g: any, idx: number) =>
              parsePromiedosGame(g, roundNum, idx)
            );
            allRounds[roundNum] = parsedMatches;
          }
        }
      } catch (err) {
        console.warn('[PROMIEDOS_FETCH_NOTICE] Latest round fallback notice:', (err as Error).message);
      }
    }

    // 4. Determine the active round in dispute:
    let resolvedActiveRound = activeRoundNumber;
    const sortedRoundNums = Object.keys(allRounds).map(Number).sort((a, b) => a - b);
    for (const rNum of sortedRoundNums) {
      const rMatches = allRounds[rNum];
      if (!rMatches || rMatches.length === 0) continue;
      const allFinished = rMatches.every(m => m.status === 'FINISHED');
      if (!allFinished) {
        resolvedActiveRound = rNum;
        break;
      } else {
        resolvedActiveRound = Math.min(16, rNum + 1);
      }
    }

    activeRoundNumber = resolvedActiveRound;
    if (allRounds[activeRoundNumber] && allRounds[activeRoundNumber].length > 0) {
      currentMatches.push(...allRounds[activeRoundNumber]);
    } else if (allRounds[7] && allRounds[7].length > 0) {
      currentMatches.push(...allRounds[7]);
    } else if (allRounds[6] && allRounds[6].length > 0) {
      currentMatches.push(...allRounds[6]);
    }

    // 5. Also fetch today homepage live matches to merge any active live match updates in real-time
    try {
      const homeRes = await fetch('https://www.promiedos.com.ar/', {
        headers: PROMIEDOS_HEADERS,
        signal: safeTimeoutSignal(2500),
      });
      if (homeRes.ok) {
        const html = await homeRes.text();
        const $ = cheerio.load(html);
        const nextData = JSON.parse($('#__NEXT_DATA__').html() || '{}');
        const leagues = nextData.props?.pageProps?.data?.leagues || [];
        const argLeague = leagues.find(
          (l: any) => l.name === 'Liga Profesional Argentina' || l.url_name === 'liga-profesional'
        );
        if (argLeague && Array.isArray(argLeague.games)) {
          argLeague.games.forEach((g: any) => {
            const hTeam = normalizeTeamName(g.teams?.[0]?.name || '');
            const aTeam = normalizeTeamName(g.teams?.[1]?.name || '');

            // Find in currentMatches or allRounds
            const target = currentMatches.find(
              m =>
                (m.homeTeam === hTeam && m.awayTeam === aTeam) ||
                (m.homeTeam === aTeam && m.awayTeam === hTeam)
            );

            if (target) {
              const isInverted = target.homeTeam === aTeam && target.awayTeam === hTeam;
              if (Array.isArray(g.scores) && g.scores.length >= 2) {
                target.homeScore = isInverted ? g.scores[1] : g.scores[0];
                target.awayScore = isInverted ? g.scores[0] : g.scores[1];
              }
              if (g.status?.enum === 3) {
                target.status = 'FINISHED';
                target.liveMinute = 'Finalizado';
              } else if (g.status?.enum === 2) {
                target.status = 'LIVE';
                target.liveMinute = g.game_time_status_to_display || 'En Vivo';
              }
            }
          });
        }
      }
    } catch (err) {
      console.warn('[PROMIEDOS_FETCH_NOTICE] Today live homepage fetch notice:', (err as Error).message);
    }

    if (currentMatches.length > 0) {
      cachedData = {
        lastFetched: now,
        currentRound: activeRoundNumber,
        matches: currentMatches,
        allRounds,
        source: 'promiedos',
      };
      return cachedData;
    }

    throw new Error('No match data could be parsed from Promiedos API');
  } catch (error) {
    console.error('[PROMIEDOS_FETCH_ERROR] Fatal in fetchPromiedosLiveData:', (error as Error).message);
    if (cachedData) {
      return cachedData;
    }
    return {
      lastFetched: now,
      currentRound: 6,
      matches: [],
      allRounds: {},
      source: 'fallback',
    };
  }
}

interface PromiedosLeagueData {
  standingsZoneA: any[];
  standingsZoneB: any[];
  standingsGeneral: any[];
  topScorers: any[];
  cleanSheetsClubs: any[];
  teamIdMap: Record<string, string>;
  lastFetched: number;
}

let cachedLeagueData: PromiedosLeagueData | null = null;

interface PlanetaGranDTCache {
  sheetUrl: string;
  roundTitle: string;
  postTitle: string;
  players: any[];
  playersCount: number;
  lastFetched: number;
}

let cachedPlanetaData: PlanetaGranDTCache | null = null;

// Parse numbers from CSV
function parseCsvNum(val: string | undefined, isFloat = false): number {
  if (!val) return 0;
  const clean = val.trim().replace('$', '').replace(/\./g, '').replace(',', '.');
  const num = isFloat ? parseFloat(clean) : parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
}

// CSV Parser
function parseServerCsv(text: string): string[][] {
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
          i++;
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

function generateDeterministicPlayerIdServer(nombre: string, equipo: string = '', posicion: string = ''): number {
  const clean = (str: string) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const nameSig = clean(nombre).split('').sort().join('');
  const teamNorm = clean(equipo);
  const posNorm = clean(posicion);
  const key = `${nameSig}_${teamNorm}_${posNorm}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const positiveHash = Math.abs(hash >>> 0);
  return 100000 + (positiveHash % 9899999);
}

// Scrape and parse Planeta Gran DT Estadísticas
function formatGoogleSheetCsvUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (url.includes('/pubhtml')) {
    return url.replace(/\/pubhtml(\?.*)?$/, '/pub?output=csv');
  }
  if (url.includes('/d/e/') && !url.includes('output=csv')) {
    const docMatch = url.match(/\/d\/e\/([a-zA-Z0-9_-]+)/);
    if (docMatch && docMatch[1]) {
      return `https://docs.google.com/spreadsheets/d/e/${docMatch[1]}/pub?output=csv`;
    }
  }
  if (url.includes('/d/') && !url.includes('export?format=csv')) {
    const docMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch && docMatch[1]) {
      return `https://docs.google.com/spreadsheets/d/${docMatch[1]}/export?format=csv`;
    }
  }
  return url;
}

async function fetchPlanetaGranDTStats(customUrl?: string): Promise<PlanetaGranDTCache> {
  const now = Date.now();
  if (!customUrl && cachedPlanetaData && now - cachedPlanetaData.lastFetched < 45 * 1000) {
    return cachedPlanetaData;
  }

  let sheetUrl = customUrl ? formatGoogleSheetCsvUrl(customUrl) : '';
  let postTitle = 'Estadísticas Gran DT Clausura 2026';
  let roundTitle = 'Última Fecha Oficial (Planeta Gran DT)';

  if (!sheetUrl) {
    try {
      const targetUrl = 'https://www.planetagrandt.com.ar/search/label/Estad%C3%ADsticas';
      const resp = await fetch(targetUrl, {
        headers: {
          'User-Agent': BROWSER_USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
        signal: safeTimeoutSignal(3000),
      });

      if (resp.ok) {
        const html = await resp.text();
        const $ = cheerio.load(html);

        // Find published google sheet in top post
        $('a').each((_i, el) => {
          const href = $(el).attr('href') || '';
          if (href.includes('docs.google.com/spreadsheets') && !sheetUrl) {
            sheetUrl = href;
            const container = $(el).closest('.post, .date-outer, article, .post-outer');
            const title = container.find('.post-title, h2, h3, .entry-title').text().trim();
            if (title) postTitle = title;
          }
        });

        if (!sheetUrl) {
          const sheetRegex = /https?:\/\/docs\.google\.com\/spreadsheets\/d\/(?:e\/)?[a-zA-Z0-9_\-]+[^\s"'\)>]*/gi;
          const matches = html.match(sheetRegex);
          if (matches && matches[0]) {
            sheetUrl = matches[0];
          }
        }
      } else {
        console.warn(`[PLANETAGRANDT_FETCH_NOTICE] Blog scrape HTTP ${resp.status}`);
      }
    } catch (err) {
      console.warn('[PLANETAGRANDT_FETCH_NOTICE] Blog HTML scrape notice:', (err as Error).message);
    }

    // Backup via JSON feed ONLY if sheetUrl was not found in HTML scrape
    if (!sheetUrl) {
      try {
        const feedResp = await fetch(
          'https://www.planetagrandt.com.ar/feeds/posts/default/-/Estad%C3%ADsticas?alt=json',
          {
            headers: {
              'User-Agent': BROWSER_USER_AGENT,
              'Accept': 'application/json, text/plain, */*',
            },
            signal: safeTimeoutSignal(2500),
          }
        );
        if (feedResp.ok) {
          const feedData = await feedResp.json();
          const entries = feedData.feed?.entry || [];
          for (const entry of entries) {
            const content = entry.content?.$t || entry.summary?.$t || '';
            const title = entry.title?.$t || '';
            const sheetMatch = content.match(/https?:\/\/docs\.google\.com\/spreadsheets\/d\/(?:e\/)?[a-zA-Z0-9_\-]+[^\s"'>]*/i);
            if (sheetMatch && sheetMatch[0]) {
              sheetUrl = sheetMatch[0];
              postTitle = title;
              break;
            }
          }
        }
      } catch (err) {
        console.warn('[PLANETAGRANDT_FETCH_NOTICE] Feed backup notice:', (err as Error).message);
      }
    }
  }

  // Fallback to known stable published sheet if still empty
  if (!sheetUrl) {
    sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSCtCdSe6xW7FVnObApbhqwfLF6sOhNkVxG4yr_k3ry8Jn6yUBOisyM_mVNakwPePQFU2pUuyza4Zn/pubhtml';
  }

  const csvUrl = formatGoogleSheetCsvUrl(sheetUrl);
  const parsedPlayers: any[] = [];

  try {
    const csvResp = await fetch(csvUrl, {
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        'Accept': 'text/csv, text/plain, */*',
      },
      signal: safeTimeoutSignal(3500),
    });

    if (csvResp.ok) {
      const csvText = await csvResp.text();
      const rows = parseServerCsv(csvText);
      let header: string[] | null = null;

      for (const row of rows) {
        if (!row || row.length < 4) continue;
        if (row[0]?.trim() === 'Jugador' && row[1]?.trim() === 'POS') {
          header = row.map(h => h.trim());
          continue;
        }

        if (header && ['ARQ', 'DEF', 'VOL', 'DEL'].includes(row[1]?.trim())) {
          const rawObj: Record<string, string> = {};
          header.forEach((h, i) => {
            rawObj[h] = row[i] ? row[i].trim() : '';
          });

          const rawName = rawObj['Jugador'] || '';
          const rawTeam = rawObj['Equipo'] || '';
          const mappedTeam = normalizeTeamName(rawTeam);
          const pos = rawObj['POS'] || 'VOL';
          const cotiz = rawObj['Cotización'] || '';
          const precioNum = parseCsvNum(cotiz);

          const stableId = generateDeterministicPlayerIdServer(rawName, mappedTeam, pos);

          const prt = parseCsvNum(rawObj['PrT'], true);
          const prg = parseCsvNum(rawObj['PrG'], true);
          const act = parseCsvNum(rawObj['AcT']);
          const ct = parseCsvNum(rawObj['CT']);
          const gt = parseCsvNum(rawObj['GT']);
          const vf = parseCsvNum(rawObj['VF']);
          const vi = parseCsvNum(rawObj['VI']);
          const ta = parseCsvNum(rawObj['TA']);
          const tr = parseCsvNum(rawObj['TR']);
          const pe = parseCsvNum(rawObj['PE']);
          const pa = parseCsvNum(rawObj['PA']);
          const gp = parseCsvNum(rawObj['GP']);

          const fechasPuntajes: Record<string, string | number> = {};
          for (let f = 1; f <= 18; f++) {
            const key = `F${f}`;
            if (rawObj[key]) {
              fechasPuntajes[key] = rawObj[key];
            }
          }

          parsedPlayers.push({
            id: stableId,
            nombre: rawName,
            equipo: mappedTeam,
            posicion: pos,
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
    }
  } catch (err) {
    console.warn('[PLANETAGRANDT_FETCH_NOTICE] Google Sheet CSV fetch notice:', (err as Error).message);
  }

  // Detect round
  const roundMatch = postTitle.match(/Fecha\s+(\d+)/i);
  if (roundMatch && roundMatch[1]) {
    roundTitle = `Fecha ${roundMatch[1]} (Oficial Planeta Gran DT)`;
  } else {
    roundTitle = 'Fecha 5 (Oficial Planeta Gran DT)';
  }

  const isLive = parsedPlayers.length >= 200;
  const finalPlayers = isLive ? parsedPlayers : (defaultPlayersSnapshot as unknown as any[]);

  const result: PlanetaGranDTCache = {
    sheetUrl: csvUrl,
    roundTitle: isLive ? roundTitle : 'Última Fecha Guardada (Planeta Gran DT)',
    postTitle,
    players: finalPlayers,
    playersCount: finalPlayers.length,
    lastFetched: now,
  };

  if (!customUrl && isLive) {
    cachedPlanetaData = result;
  }

  return result;
}

// Fetch and build Promiedos full Clausura 2026 data (Standings, Scorers, Clean Sheets)
async function fetchPromiedosLeagueDetails(): Promise<PromiedosLeagueData> {
  const now = Date.now();
  if (cachedLeagueData && now - cachedLeagueData.lastFetched < CACHE_TTL_MS) {
    return cachedLeagueData;
  }

  const teamIdMap: Record<string, string> = {};
  const standingsZoneA: any[] = [];
  const standingsZoneB: any[] = [];
  let topScorers: any[] = [];

  try {
    const res = await fetch('https://www.promiedos.com.ar/league/liga-profesional/hc', {
      headers: PROMIEDOS_HEADERS,
      signal: safeTimeoutSignal(3500),
    });

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      const nextData = JSON.parse($('#__NEXT_DATA__').html() || '{}');
      const data = nextData.props?.pageProps?.data || {};

      // 1. Parse tables_groups -> Clausura 2026
      const clausura =
        data.tables_groups?.find((tg: any) => tg.name?.toLowerCase().includes('clausura')) ||
        data.tables_groups?.[0];

      if (clausura && Array.isArray(clausura.tables)) {
        clausura.tables.forEach((t: any) => {
          const isZoneA = t.name?.toLowerCase().includes('a') || t.name?.toLowerCase().includes('grupo a');
          const targetList = isZoneA ? standingsZoneA : standingsZoneB;
          const zoneName = isZoneA ? 'Zona A' : 'Zona B';

          if (t.table && Array.isArray(t.table.rows)) {
            t.table.rows.forEach((r: any) => {
              const rawTeam = r.entity?.object?.name || '';
              const normTeam = normalizeTeamName(rawTeam);
              if (r.entity?.object?.id) {
                teamIdMap[r.entity.object.id] = normTeam;
              }

              const findVal = (k: string) => r.values?.find((v: any) => v.key === k)?.value;
              const goalsStr = findVal('Goals') || '0:0';
              const [gf, ga] = goalsStr.split(':').map((x: string) => parseInt(x, 10) || 0);

              targetList.push({
                positionZone: r.num,
                teamName: normTeam,
                rawTeamName: rawTeam,
                zone: zoneName,
                points: parseInt(findVal('Points') || '0', 10),
                played: parseInt(findVal('GamePlayed') || '0', 10),
                won: parseInt(findVal('GamesWon') || '0', 10),
                drawn: parseInt(findVal('GamesEven') || '0', 10),
                lost: parseInt(findVal('GamesLost') || '0', 10),
                goalsFor: gf,
                goalsAgainst: ga,
                goalDiff: parseInt(findVal('Ratio') || '0', 10),
                trend: findVal('{trend}') || [],
              });
            });
          }
        });
      }

      // 2. Parse players_statistics -> Goles (Top Scorers)
      const scorersTable = data.players_statistics?.tables?.find((t: any) => t.name === 'Goles');
      if (scorersTable && Array.isArray(scorersTable.rows)) {
        topScorers = scorersTable.rows.map((r: any) => {
          const pName = r.entity?.object?.name || '';
          const teamId = r.entity?.object?.team_id || '';
          const teamName = teamIdMap[teamId] || normalizeTeamName(r.entity?.object?.team_name || '');
          const goals = parseInt(r.values?.find((v: any) => v.key === 'Goals')?.value || '0', 10);
          return {
            rank: r.num,
            playerName: pName,
            team: teamName,
            position: r.entity?.object?.position || 'Delanteros',
            goals,
            promiedosPlayerId: r.entity?.object?.id,
          };
        });
      }
    } else {
      console.warn(`[PROMIEDOS_LEAGUE_NOTICE] HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn('[PROMIEDOS_LEAGUE_NOTICE] League details fetch notice:', (err as Error).message);
  }

  // 3. Fallback to default standings and scorers if empty
  const defaultStandings = getDefaultStandings();
  const hasLiveStandings = standingsZoneA.length >= 10 && standingsZoneB.length >= 10;
  const finalZoneA = hasLiveStandings ? standingsZoneA : defaultStandings.zoneA;
  const finalZoneB = hasLiveStandings ? standingsZoneB : defaultStandings.zoneB;
  const finalScorers = topScorers.length > 0 ? topScorers : getDefaultScorers();

  // Build General Table (all 30 clubs ordered by Points desc, GoalDiff desc, GoalsFor desc)
  const combined = [...finalZoneA, ...finalZoneB].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });

  const standingsGeneral = hasLiveStandings
    ? combined.map((team, idx) => ({ ...team, positionGeneral: idx + 1 }))
    : defaultStandings.general;

  // Match positionGeneral back into Zone tables
  finalZoneA.forEach(t => {
    const gen = standingsGeneral.find(g => g.teamName === t.teamName);
    if (gen) t.positionGeneral = gen.positionGeneral;
  });
  finalZoneB.forEach(t => {
    const gen = standingsGeneral.find(g => g.teamName === t.teamName);
    if (gen) t.positionGeneral = gen.positionGeneral;
  });

  // 4. Compute Clean Sheets for Clubs from finished Promiedos matches or fallback
  const cleanSheetsClubs: any[] = [];
  const clubCleanSheetsMap: Record<string, { cleanSheets: number; matches: number; ga: number }> = {};

  standingsGeneral.forEach(t => {
    clubCleanSheetsMap[t.teamName] = { cleanSheets: 0, matches: t.played || 0, ga: t.goalsAgainst || 0 };
  });

  if (cachedData?.allRounds) {
    Object.values(cachedData.allRounds).forEach(roundMatches => {
      roundMatches.forEach(m => {
        if (m.status === 'FINISHED' && typeof m.homeScore === 'number' && typeof m.awayScore === 'number') {
          if (m.awayScore === 0 && clubCleanSheetsMap[m.homeTeam]) {
            clubCleanSheetsMap[m.homeTeam].cleanSheets += 1;
          }
          if (m.homeScore === 0 && clubCleanSheetsMap[m.awayTeam]) {
            clubCleanSheetsMap[m.awayTeam].cleanSheets += 1;
          }
        }
      });
    });
  }

  standingsGeneral.forEach(t => {
    const stat = clubCleanSheetsMap[t.teamName] || { cleanSheets: 0, matches: t.played || 0, ga: t.goalsAgainst || 0 };
    const rate = stat.matches > 0 ? Math.round((stat.cleanSheets / stat.matches) * 100) : 0;
    cleanSheetsClubs.push({
      teamName: t.teamName,
      zone: t.zone,
      cleanSheets: stat.cleanSheets,
      played: stat.matches,
      cleanSheetRate: rate,
      goalsAgainst: stat.ga,
      points: t.points,
    });
  });

  cleanSheetsClubs.sort((a, b) => {
    if (b.cleanSheets !== a.cleanSheets) return b.cleanSheets - a.cleanSheets;
    return a.goalsAgainst - b.goalsAgainst;
  });

  const finalCleanSheets = cleanSheetsClubs.some(c => c.cleanSheets > 0) ? cleanSheetsClubs : getDefaultCleanSheets();

  cachedLeagueData = {
    standingsZoneA: finalZoneA,
    standingsZoneB: finalZoneB,
    standingsGeneral,
    topScorers: finalScorers,
    cleanSheetsClubs: finalCleanSheets,
    teamIdMap,
    lastFetched: now,
  };

  return cachedLeagueData;
}

function getDefaultStandings() {
  const dynamic = getDynamicStandings();
  const all = Object.values(dynamic);
  const zoneA = all.filter(t => t.zone === 'Zona A').sort((a, b) => a.positionZone - b.positionZone);
  const zoneB = all.filter(t => t.zone === 'Zona B').sort((a, b) => a.positionZone - b.positionZone);
  const general = [...all].sort((a, b) => a.positionGeneral - b.positionGeneral);
  return { zoneA, zoneB, general };
}

function getDefaultScorers() {
  const scorers = getDynamicTopScorers();
  return scorers.map((s, idx) => ({
    rank: idx + 1,
    playerName: s.playerName,
    team: s.team,
    position: s.posicion,
    goals: s.totalGoals,
  }));
}

function getDefaultCleanSheets() {
  const clubs = getDynamicClubDefenseStats();
  return clubs.map(c => ({
    teamName: c.teamName,
    zone: c.zone,
    cleanSheets: c.cleanSheetsTotal,
    played: c.played,
    cleanSheetRate: c.cleanSheetRate,
    goalsAgainst: c.goalsAgainst,
    points: c.points,
  }));
}

// Global CORS and Anti-Cache Headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Dedicated Router for API endpoints (serves both /api/* and /* for full Vercel compatibility)
const apiRouter = express.Router();

apiRouter.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vercel Cron Job / Scheduled Webhook Endpoint
apiRouter.all('/cron/refresh', async (req, res) => {
  try {
    cachedData = null;
    cachedLeagueData = null;
    cachedPlanetaData = null;
    const [promiedosData, leagueData, planetaData] = await Promise.all([
      fetchPromiedosLiveData().catch(() => null),
      fetchPromiedosLeagueDetails().catch(() => null),
      fetchPlanetaGranDTStats().catch(() => null),
    ]);

    res.json({
      success: true,
      message: 'Caché de datos actualizada correctamente',
      timestamp: Date.now(),
      promiedos: {
        currentRound: promiedosData?.currentRound || 7,
        matchesCount: promiedosData?.matches?.length || 0,
        standingsCount: leagueData?.standingsGeneral?.length || 0,
        scorersCount: leagueData?.topScorers?.length || 0,
      },
      planetaGranDT: {
        roundTitle: planetaData?.roundTitle || 'Última Fecha',
        playersCount: planetaData?.playersCount || 0,
        sheetUrl: planetaData?.sheetUrl || '',
      },
    });
  } catch (error) {
    res.json({
      success: true,
      isFallback: true,
      message: 'Actualización completada con datos de respaldo',
      timestamp: Date.now(),
    });
  }
});

// Planeta Gran DT Latest Sheet Endpoint (Cotizaciones, Jugadores, Puntajes Gran DT)
apiRouter.get('/planetagrandt/latest-sheet', async (req, res) => {
  try {
    const customUrl = req.query.customUrl as string | undefined;
    const data = await fetchPlanetaGranDTStats(customUrl);
    const isLive = data.players && data.players.length >= 200;
    res.json({
      success: true,
      isLive,
      isFallback: !isLive,
      source: isLive ? 'planetagrandt.com.ar' : 'local-snapshot',
      label: 'Estadísticas',
      sheetUrl: data.sheetUrl,
      roundTitle: data.roundTitle,
      postTitle: data.postTitle,
      playersCount: data.playersCount,
      players: data.players,
      timestamp: data.lastFetched,
    });
  } catch (error) {
    console.warn('[PLANETAGRANDT_API_NOTICE] Serving fallback snapshot due to:', (error as Error).message);
    const fallbackPlayers = defaultPlayersSnapshot as unknown as any[];
    res.json({
      success: true,
      isLive: false,
      isFallback: true,
      source: 'local-snapshot',
      label: 'Estadísticas',
      sheetUrl: '',
      roundTitle: 'Última Fecha Guardada (Planeta Gran DT)',
      postTitle: 'Estadísticas Gran DT Clausura 2026',
      playersCount: fallbackPlayers.length,
      players: fallbackPlayers,
      timestamp: Date.now(),
    });
  }
});

// Promiedos Official Standings (Torneo Clausura 2026)
apiRouter.get('/promiedos/standings', async (req, res) => {
  try {
    const data = await fetchPromiedosLeagueDetails();
    res.json({
      success: true,
      isLive: true,
      isFallback: false,
      tournament: 'Torneo Clausura 2026',
      source: 'promiedos.com.ar',
      timestamp: data.lastFetched,
      zoneA: data.standingsZoneA,
      zoneB: data.standingsZoneB,
      general: data.standingsGeneral,
    });
  } catch (error) {
    console.warn('[PROMIEDOS_STANDINGS_NOTICE] Serving fallback standings due to:', (error as Error).message);
    const defaults = getDefaultStandings();
    res.json({
      success: true,
      isLive: false,
      isFallback: true,
      tournament: 'Torneo Clausura 2026',
      source: 'local-fallback',
      timestamp: Date.now(),
      zoneA: defaults.zoneA,
      zoneB: defaults.zoneB,
      general: defaults.general,
    });
  }
});

// Promiedos Official Top Scorers (Torneo Clausura 2026)
apiRouter.get('/promiedos/scorers', async (req, res) => {
  try {
    const data = await fetchPromiedosLeagueDetails();
    res.json({
      success: true,
      isLive: true,
      isFallback: false,
      tournament: 'Torneo Clausura 2026',
      source: 'promiedos.com.ar',
      timestamp: data.lastFetched,
      scorers: data.topScorers,
    });
  } catch (error) {
    console.warn('[PROMIEDOS_SCORERS_NOTICE] Serving fallback scorers due to:', (error as Error).message);
    res.json({
      success: true,
      isLive: false,
      isFallback: true,
      tournament: 'Torneo Clausura 2026',
      source: 'local-fallback',
      timestamp: Date.now(),
      scorers: getDefaultScorers(),
    });
  }
});

// Promiedos Clean Sheets / Vallas Invictas (Torneo Clausura 2026)
apiRouter.get('/promiedos/clean-sheets', async (req, res) => {
  try {
    const data = await fetchPromiedosLeagueDetails();
    res.json({
      success: true,
      isLive: true,
      isFallback: false,
      tournament: 'Torneo Clausura 2026',
      source: 'promiedos.com.ar',
      timestamp: data.lastFetched,
      cleanSheets: data.cleanSheetsClubs,
    });
  } catch (error) {
    console.warn('[PROMIEDOS_CLEAN_SHEETS_NOTICE] Serving fallback clean-sheets due to:', (error as Error).message);
    res.json({
      success: true,
      isLive: false,
      isFallback: true,
      tournament: 'Torneo Clausura 2026',
      source: 'local-fallback',
      timestamp: Date.now(),
      cleanSheets: getDefaultCleanSheets(),
    });
  }
});

// Promiedos Live Fixture endpoint (Queried every 30s-45s by client)
apiRouter.get('/promiedos/fixture', async (req, res) => {
  try {
    const roundQuery = req.query.round ? parseInt(req.query.round as string, 10) : undefined;
    const data = await fetchPromiedosLiveData(roundQuery);

    let matchesToSend = data.matches;
    if (roundQuery && data.allRounds[roundQuery]) {
      matchesToSend = data.allRounds[roundQuery];
    } else if (roundQuery) {
      matchesToSend = FIXTURES_DATA.filter(f => f.fecha === roundQuery).map((f, idx) => ({
        id: f.id || `fix-${roundQuery}-${idx + 1}`,
        fecha: roundQuery,
        homeTeam: f.homeTeam,
        awayTeam: f.awayTeam,
        homeScore: f.homeScore,
        awayScore: f.awayScore,
        status: f.status || 'SCHEDULED',
        liveMinute: f.liveMinute || '',
        displayTime: f.displayTime,
        dateStr: f.dateStr,
        kickoff: f.kickoff,
        stadium: f.stadium,
        events: f.events || [],
      }));
    }

    const isLive = data.source === 'promiedos' && matchesToSend.length > 0;

    res.json({
      success: true,
      isLive,
      isFallback: !isLive,
      tournament: 'Torneo Clausura 2026',
      lastUpdated: new Date(data.lastFetched).toISOString(),
      timestamp: data.lastFetched,
      currentRound: data.currentRound,
      round: roundQuery || data.currentRound,
      matches: matchesToSend,
      allRoundsCount: Object.keys(data.allRounds).length,
      source: data.source,
      ttl: 45,
    });
  } catch (error) {
    console.warn('[PROMIEDOS_FIXTURE_NOTICE] Serving fallback fixture due to:', (error as Error).message);
    const currentRoundNum = getTournamentRoundStatus().roundNumber;
    const roundNum = req.query.round ? parseInt(req.query.round as string, 10) : currentRoundNum;
    const staticMatches = FIXTURES_DATA.filter(f => f.fecha === roundNum).map((f, idx) => ({
      id: f.id || `fix-${roundNum}-${idx + 1}`,
      fecha: roundNum,
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      homeScore: f.homeScore,
      awayScore: f.awayScore,
      status: f.status || 'SCHEDULED',
      liveMinute: f.liveMinute || '',
      displayTime: f.displayTime,
      dateStr: f.dateStr,
      kickoff: f.kickoff,
      stadium: f.stadium,
      events: f.events || [],
    }));

    res.json({
      success: true,
      isLive: false,
      isFallback: true,
      tournament: 'Torneo Clausura 2026',
      lastUpdated: new Date().toISOString(),
      timestamp: Date.now(),
      currentRound: currentRoundNum,
      round: roundNum,
      matches: staticMatches,
      allRoundsCount: 16,
      source: 'local-fallback',
      ttl: 45,
    });
  }
});

// Force refresh endpoint
apiRouter.post('/promiedos/refresh', async (req, res) => {
  cachedData = null;
  cachedLeagueData = null;
  cachedPlanetaData = null;
  try {
    const data = await fetchPromiedosLiveData().catch(() => null);
    const leagueData = await fetchPromiedosLeagueDetails().catch(() => null);
    res.json({
      success: true,
      refreshed: true,
      timestamp: Date.now(),
      matchesCount: data?.matches?.length || 0,
      standingsCount: leagueData?.standingsGeneral?.length || 0,
      scorersCount: leagueData?.topScorers?.length || 0,
      source: data?.source || 'promiedos',
    });
  } catch (error) {
    res.json({ success: true, refreshed: true, isFallback: true, timestamp: Date.now() });
  }
});

// Mount API routes strictly under /api prefix
app.use('/api', apiRouter);

// Start Server with Vite Middleware in Development or standalone container
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`El Gran Asistente server running on http://0.0.0.0:${PORT}`);
  });

  // Background proactive sync every 45s to ensure cache is always warm
  setInterval(async () => {
    try {
      await fetchPromiedosLiveData();
      await fetchPromiedosLeagueDetails();
    } catch (e) {
      console.warn('Background Promiedos refresh error:', (e as Error).message);
    }
    try {
      await fetchPlanetaGranDTStats();
    } catch (e) {
      console.warn('Background Planeta Gran DT refresh error:', (e as Error).message);
    }
  }, 45 * 1000);
}

// Only start standalone HTTP server if not running as a Vercel Serverless Function
if (!process.env.VERCEL) {
  startServer();
}

export { apiRouter };
export default app;
