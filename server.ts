import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as cheerio from 'cheerio';

const app = express();
const PORT = 3000;

app.use(express.json());

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
    type: 'goal' | 'penalty_goal' | 'red_card' | 'second_yellow';
    team: 'home' | 'away';
    playerName: string;
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

const PROMIEDOS_HEADERS = {
  'X-VER': '1.11.7.3',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Referer': 'https://www.promiedos.com.ar/',
};

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

async function fetchPromiedosLiveData(): Promise<PromiedosCache> {
  const now = Date.now();
  if (cachedData && now - cachedData.lastFetched < CACHE_TTL_MS) {
    return cachedData;
  }

  const allRounds: Record<number, PromiedosLiveMatch[]> = {};
  let activeRoundNumber = 7;
  const currentMatches: PromiedosLiveMatch[] = [];

  try {
    // 1. Fetch the main league structure to discover all round filters
    let filterList: Array<{ name: string; key: string; selected?: boolean }> = [];

    try {
      const leagueRes = await fetch('https://www.promiedos.com.ar/league/liga-profesional/hc', {
        headers: PROMIEDOS_HEADERS,
        signal: AbortSignal.timeout(5000),
      });
      if (leagueRes.ok) {
        const html = await leagueRes.text();
        const $ = cheerio.load(html);
        const nextData = JSON.parse($('#__NEXT_DATA__').html() || '{}');
        filterList = nextData.props?.pageProps?.data?.games?.filters || [];
      }
    } catch (err) {
      console.warn('League structure discovery warning:', (err as Error).message);
    }

    // Isolate ONLY Torneo Clausura 2026 filters (stage 8: key starting with 72_228_8_)
    const clausuraFilters = filterList.filter(
      f => f.key?.startsWith('72_228_8_') || f.key?.includes('_8_')
    );
    const effectiveFilters = clausuraFilters.length > 0 ? clausuraFilters : filterList;

    // 2. Fetch official round data for each Clausura round (prioritizing recent and upcoming rounds)
    for (const filter of effectiveFilters) {
      const matchFecha = filter.name?.match(/Fecha\s+(\d+)/i);
      const fechaNum = matchFecha ? parseInt(matchFecha[1], 10) : 0;
      if (fechaNum > 0 && filter.key) {
        try {
          const res = await fetch(`https://api.promiedos.com.ar/league/games/hc/${filter.key}`, {
            headers: PROMIEDOS_HEADERS,
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.games && Array.isArray(data.games)) {
              const parsed = data.games.map((g: any, idx: number) =>
                parsePromiedosGame(g, fechaNum, idx)
              );
              allRounds[fechaNum] = parsed;
            }
          }
        } catch (err) {
          console.warn(`Round ${fechaNum} fetch warning:`, (err as Error).message);
        }
      }
    }

    // 3. If no rounds were fetched from filters, try latest endpoint as fallback
    if (Object.keys(allRounds).length === 0) {
      try {
        const latestRes = await fetch('https://api.promiedos.com.ar/league/games/hc/latest', {
          headers: PROMIEDOS_HEADERS,
          signal: AbortSignal.timeout(6000),
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
        console.warn('Latest round fallback warning:', (err as Error).message);
      }
    }

    // 4. Determine the active round in dispute:
    // It is the first round in Torneo Clausura that has unplayed (SCHEDULED) or in-progress (LIVE) matches.
    // If all matches in a round are FINISHED, the active round moves automatically to the next round.
    let resolvedActiveRound = 1;
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
        signal: AbortSignal.timeout(4000),
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
      console.warn('Today live homepage fetch warning:', (err as Error).message);
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
    console.error('Error in fetchPromiedosLiveData:', error);
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
async function fetchPlanetaGranDTStats(): Promise<PlanetaGranDTCache> {
  const now = Date.now();
  if (cachedPlanetaData && now - cachedPlanetaData.lastFetched < 45 * 1000) {
    return cachedPlanetaData;
  }

  let sheetUrl = '';
  let postTitle = 'Estadísticas Gran DT Clausura 2026';
  let roundTitle = 'Última Fecha Oficial (Planeta Gran DT)';

  try {
    const targetUrl = 'https://www.planetagrandt.com.ar/search/label/Estad%C3%ADsticas';
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
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
    }
  } catch (err) {
    console.warn('Error scraping Planeta Gran DT Estadísticas web page:', (err as Error).message);
  }

  // Backup via JSON feed if not found
  if (!sheetUrl) {
    try {
      const feedResp = await fetch(
        'https://www.planetagrandt.com.ar/feeds/posts/default/-/Estad%C3%ADsticas?alt=json',
        {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(6000),
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
      console.warn('Error fetching Planeta Gran DT feed:', (err as Error).message);
    }
  }

  // Fallback to known stable published sheet if still empty
  if (!sheetUrl) {
    sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSCtCdSe6xW7FVnObApbhqwfLF6sOhNkVxG4yr_k3ry8Jn6yUBOisyM_mVNakwPePQFU2pUuyza4Zn/pubhtml';
  }

  // Convert to CSV published URL
  let csvUrl = sheetUrl.trim();
  if (csvUrl.includes('/pubhtml')) {
    csvUrl = csvUrl.replace(/\/pubhtml(\?.*)?$/, '/pub?output=csv');
  } else if (csvUrl.includes('/d/e/') && !csvUrl.includes('output=csv')) {
    const docMatch = csvUrl.match(/\/d\/e\/([a-zA-Z0-9_-]+)/);
    if (docMatch && docMatch[1]) {
      csvUrl = `https://docs.google.com/spreadsheets/d/e/${docMatch[1]}/pub?output=csv`;
    }
  } else if (csvUrl.includes('/d/') && !csvUrl.includes('export?format=csv')) {
    const docMatch = csvUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch && docMatch[1]) {
      csvUrl = `https://docs.google.com/spreadsheets/d/${docMatch[1]}/export?format=csv`;
    }
  }

  const parsedPlayers: any[] = [];
  try {
    const csvResp = await fetch(csvUrl, {
      headers: { 'Accept': 'text/csv, text/plain, */*' },
      signal: AbortSignal.timeout(8000),
    });

    if (csvResp.ok) {
      const csvText = await csvResp.text();
      const rows = parseServerCsv(csvText);
      let header: string[] | null = null;
      let idCounter = 1;

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
    console.warn('Error downloading/parsing Google Sheet CSV:', (err as Error).message);
  }

  // Detect round
  const roundMatch = postTitle.match(/Fecha\s+(\d+)/i);
  if (roundMatch && roundMatch[1]) {
    roundTitle = `Fecha ${roundMatch[1]} (Oficial Planeta Gran DT)`;
  } else {
    roundTitle = 'Fecha 5 (Oficial Planeta Gran DT)';
  }

  cachedPlanetaData = {
    sheetUrl: csvUrl,
    roundTitle,
    postTitle,
    players: parsedPlayers,
    playersCount: parsedPlayers.length,
    lastFetched: now,
  };

  return cachedPlanetaData;
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
      signal: AbortSignal.timeout(6000),
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
    }
  } catch (err) {
    console.warn('Error fetching Promiedos league details:', (err as Error).message);
  }

  // 3. Build General Table (all 30 clubs ordered by Points desc, GoalDiff desc, GoalsFor desc)
  const combined = [...standingsZoneA, ...standingsZoneB].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });

  const standingsGeneral = combined.map((team, idx) => ({
    ...team,
    positionGeneral: idx + 1,
  }));

  // Match positionGeneral back into Zone tables
  standingsZoneA.forEach(t => {
    const gen = standingsGeneral.find(g => g.teamName === t.teamName);
    if (gen) t.positionGeneral = gen.positionGeneral;
  });
  standingsZoneB.forEach(t => {
    const gen = standingsGeneral.find(g => g.teamName === t.teamName);
    if (gen) t.positionGeneral = gen.positionGeneral;
  });

  // 4. Compute Clean Sheets for Clubs from finished Promiedos matches
  const cleanSheetsClubs: any[] = [];
  const clubCleanSheetsMap: Record<string, { cleanSheets: number; matches: number; ga: number }> = {};

  // Initialize all teams
  standingsGeneral.forEach(t => {
    clubCleanSheetsMap[t.teamName] = { cleanSheets: 0, matches: t.played || 0, ga: t.goalsAgainst || 0 };
  });

  // Count clean sheets from matches
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

  cachedLeagueData = {
    standingsZoneA,
    standingsZoneB,
    standingsGeneral,
    topScorers,
    cleanSheetsClubs,
    teamIdMap,
    lastFetched: now,
  };

  return cachedLeagueData;
}

// API Routes
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Planeta Gran DT Latest Sheet Endpoint (Cotizaciones, Jugadores, Puntajes Gran DT)
app.get('/api/planetagrandt/latest-sheet', async (req, res) => {
  try {
    const data = await fetchPlanetaGranDTStats();
    res.json({
      success: true,
      source: 'planetagrandt.com.ar',
      label: 'Estadísticas',
      sheetUrl: data.sheetUrl,
      roundTitle: data.roundTitle,
      postTitle: data.postTitle,
      playersCount: data.playersCount,
      players: data.players,
      timestamp: data.lastFetched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      source: 'fallback',
    });
  }
});

// Promiedos Official Standings (Torneo Clausura 2026)
app.get('/api/promiedos/standings', async (req, res) => {
  try {
    // Ensure fixture data is updated
    await fetchPromiedosLiveData();
    const data = await fetchPromiedosLeagueDetails();
    res.json({
      success: true,
      tournament: 'Torneo Clausura 2026',
      source: 'promiedos.com.ar',
      timestamp: data.lastFetched,
      zoneA: data.standingsZoneA,
      zoneB: data.standingsZoneB,
      general: data.standingsGeneral,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      source: 'fallback',
    });
  }
});

// Promiedos Official Top Scorers (Torneo Clausura 2026)
app.get('/api/promiedos/scorers', async (req, res) => {
  try {
    const data = await fetchPromiedosLeagueDetails();
    res.json({
      success: true,
      tournament: 'Torneo Clausura 2026',
      source: 'promiedos.com.ar',
      timestamp: data.lastFetched,
      scorers: data.topScorers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      source: 'fallback',
    });
  }
});

// Promiedos Clean Sheets / Vallas Invictas (Torneo Clausura 2026)
app.get('/api/promiedos/clean-sheets', async (req, res) => {
  try {
    await fetchPromiedosLiveData();
    const data = await fetchPromiedosLeagueDetails();
    res.json({
      success: true,
      tournament: 'Torneo Clausura 2026',
      source: 'promiedos.com.ar',
      timestamp: data.lastFetched,
      cleanSheets: data.cleanSheetsClubs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      source: 'fallback',
    });
  }
});

// Promiedos Live Fixture endpoint (Queried every 30s by client)
app.get('/api/promiedos/fixture', async (req, res) => {
  try {
    const data = await fetchPromiedosLiveData();
    const roundQuery = req.query.round ? parseInt(req.query.round as string, 10) : undefined;

    let matchesToSend = data.matches;
    if (roundQuery && data.allRounds[roundQuery]) {
      matchesToSend = data.allRounds[roundQuery];
    }

    res.json({
      success: true,
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
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      source: 'fallback',
    });
  }
});

// Force refresh endpoint
app.post('/api/promiedos/refresh', async (req, res) => {
  cachedData = null;
  cachedLeagueData = null;
  cachedPlanetaData = null;
  try {
    const data = await fetchPromiedosLiveData();
    const leagueData = await fetchPromiedosLeagueDetails();
    res.json({
      success: true,
      refreshed: true,
      timestamp: data.lastFetched,
      matchesCount: data.matches.length,
      standingsCount: leagueData.standingsGeneral.length,
      scorersCount: leagueData.topScorers.length,
      source: 'promiedos',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Start Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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

startServer();
