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
  startIso?: string;
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

interface PromiedosCache {
  lastFetched: number;
  currentRound: number;
  matches: PromiedosLiveMatch[];
  allRounds: Record<number, PromiedosLiveMatch[]>;
  source: 'promiedos' | 'fallback';
}

let cachedData: PromiedosCache | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30s in-memory server cache for instant response

// Canonical Gran DT team name dictionary
const TEAM_NAME_MAP: Record<string, string> = {
  // Gimnasia
  'gimnasia y esgrima de mendoza': 'Gimnasia y Esgrima de Mendoza',
  'gimnasia y esgrima (mendoza)': 'Gimnasia y Esgrima de Mendoza',
  'gimnasia y esgrima (m)': 'Gimnasia y Esgrima de Mendoza',
  'gimnasia y esgrima mza': 'Gimnasia y Esgrima de Mendoza',
  'gimnasia mendoza': 'Gimnasia y Esgrima de Mendoza',
  'gimnasia de mendoza': 'Gimnasia y Esgrima de Mendoza',
  'gimnasia mza': 'Gimnasia y Esgrima de Mendoza',
  'gimnasia (m)': 'Gimnasia y Esgrima de Mendoza',
  'gimnasia m': 'Gimnasia y Esgrima de Mendoza',
  'gimnasia y esgrima la plata': 'Gimnasia y Esgrima La Plata',
  'gimnasia y esgrima lp': 'Gimnasia y Esgrima La Plata',
  'gimnasia la plata': 'Gimnasia y Esgrima La Plata',
  'gimnasia (lp)': 'Gimnasia y Esgrima La Plata',
  'gimnasia lp': 'Gimnasia y Esgrima La Plata',
  'gimnasia': 'Gimnasia y Esgrima La Plata',

  // Estudiantes
  'estudiantes de rio cuarto': 'Estudiantes de Río Cuarto',
  'estudiantes de río cuarto': 'Estudiantes de Río Cuarto',
  'estudiantes rio cuarto': 'Estudiantes de Río Cuarto',
  'estudiantes río cuarto': 'Estudiantes de Río Cuarto',
  'estudiantes (rc)': 'Estudiantes de Río Cuarto',
  'estudiantes rc': 'Estudiantes de Río Cuarto',
  'estudiantes de la plata': 'Estudiantes de La Plata',
  'estudiantes la plata': 'Estudiantes de La Plata',
  'estudiantes (lp)': 'Estudiantes de La Plata',
  'estudiantes lp': 'Estudiantes de La Plata',
  'estudiantes': 'Estudiantes de La Plata',

  // Independiente
  'independiente rivadavia': 'Independiente Rivadavia',
  'independiente riv': 'Independiente Rivadavia',
  'ind. rivadavia': 'Independiente Rivadavia',
  'ind rivadavia': 'Independiente Rivadavia',
  'ind riv': 'Independiente Rivadavia',
  'independiente': 'Independiente',

  // Central
  'central cordoba de sde': 'Central Córdoba de SDE',
  'central córdoba de sde': 'Central Córdoba de SDE',
  'central cordoba (sde)': 'Central Córdoba de SDE',
  'central córdoba (sde)': 'Central Córdoba de SDE',
  'central cordoba (se)': 'Central Córdoba de SDE',
  'central córdoba (se)': 'Central Córdoba de SDE',
  'central cba (sde)': 'Central Córdoba de SDE',
  'central cba': 'Central Córdoba de SDE',
  'central cordoba': 'Central Córdoba de SDE',
  'central córdoba': 'Central Córdoba de SDE',
  'rosario central': 'Rosario Central',
  'r. central': 'Rosario Central',

  // San Martín
  'san martin de san juan': 'San Martín de San Juan',
  'san martín de san juan': 'San Martín de San Juan',
  'san martin (sj)': 'San Martín de San Juan',
  'san martín (sj)': 'San Martín de San Juan',
  'san martin sj': 'San Martín de San Juan',
  'san martín sj': 'San Martín de San Juan',
  'san martin de tucuman': 'San Martín de Tucumán',
  'san martín de tucumán': 'San Martín de Tucumán',
  'san martin (t)': 'San Martín de Tucumán',
  'san martín (t)': 'San Martín de Tucumán',
  'san martin t': 'San Martín de Tucumán',
  'san martín t': 'San Martín de Tucumán',

  // Sarmiento
  'sarmiento de junin': 'Sarmiento de Junín',
  'sarmiento de junín': 'Sarmiento de Junín',
  'sarmiento (j)': 'Sarmiento de Junín',
  'sarmiento junin': 'Sarmiento de Junín',
  'sarmiento junín': 'Sarmiento de Junín',
  'sarmiento': 'Sarmiento de Junín',

  // Talleres
  'talleres de cordoba': 'Talleres de Córdoba',
  'talleres de córdoba': 'Talleres de Córdoba',
  'talleres (c)': 'Talleres de Córdoba',
  'talleres cordoba': 'Talleres de Córdoba',
  'talleres': 'Talleres de Córdoba',

  // Unión
  'union de santa fe': 'Unión de Santa Fe',
  'unión de santa fe': 'Unión de Santa Fe',
  'union santa fe': 'Unión de Santa Fe',
  'unión santa fe': 'Unión de Santa Fe',
  'union': 'Unión de Santa Fe',
  'unión': 'Unión de Santa Fe',

  // Others
  'aldosivi': 'Aldosivi',
  'argentinos': 'Argentinos Juniors',
  'argentinos juniors': 'Argentinos Juniors',
  'argentinos jrs': 'Argentinos Juniors',
  'atletico tucuman': 'Atlético Tucumán',
  'atlético tucumán': 'Atlético Tucumán',
  'atl tucuman': 'Atlético Tucumán',
  'atl. tucuman': 'Atlético Tucumán',
  'banfield': 'Banfield',
  'barracas central': 'Barracas Central',
  'barracas': 'Barracas Central',
  'belgrano de cordoba': 'Belgrano de Córdoba',
  'belgrano de córdoba': 'Belgrano de Córdoba',
  'belgrano (c)': 'Belgrano de Córdoba',
  'belgrano': 'Belgrano de Córdoba',
  'boca juniors': 'Boca Juniors',
  'boca': 'Boca Juniors',
  'defensa y justicia': 'Defensa y Justicia',
  'def y justicia': 'Defensa y Justicia',
  'defensa': 'Defensa y Justicia',
  'deportivo riestra': 'Deportivo Riestra',
  'dep riestra': 'Deportivo Riestra',
  'riestra': 'Deportivo Riestra',
  'huracan': 'Huracán',
  'huracán': 'Huracán',
  'instituto de cordoba': 'Instituto de Córdoba',
  'instituto de córdoba': 'Instituto de Córdoba',
  'instituto (c)': 'Instituto de Córdoba',
  'instituto': 'Instituto de Córdoba',
  'lanus': 'Lanús',
  'lanús': 'Lanús',
  "newell's old boys": "Newell's Old Boys",
  'newells old boys': "Newell's Old Boys",
  "newell's": "Newell's Old Boys",
  'newells': "Newell's Old Boys",
  'nob': "Newell's Old Boys",
  'platense': 'Platense',
  'racing club': 'Racing Club',
  'racing': 'Racing Club',
  'river plate': 'River Plate',
  'river': 'River Plate',
  'san lorenzo de almagro': 'San Lorenzo de Almagro',
  'san lorenzo': 'San Lorenzo de Almagro',
  'tigre': 'Tigre',
  'velez sarsfield': 'Vélez Sarsfield',
  'vélez sarsfield': 'Vélez Sarsfield',
  'velez': 'Vélez Sarsfield',
  'vélez': 'Vélez Sarsfield',
};

// Sort entries by key length descending so longer, more specific names match first
const SORTED_TEAM_ENTRIES = Object.entries(TEAM_NAME_MAP).sort((a, b) => b[0].length - a[0].length);

function normalizeTeamName(rawName: string): string {
  if (!rawName) return '';
  const clean = rawName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics for clean key search
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');

  const rawClean = rawName.trim().toLowerCase().replace(/[^\w\sáéíóúñ]/g, '').replace(/\s+/g, ' ');

  if (TEAM_NAME_MAP[rawClean]) {
    return TEAM_NAME_MAP[rawClean];
  }
  if (TEAM_NAME_MAP[clean]) {
    return TEAM_NAME_MAP[clean];
  }

  for (const [key, val] of SORTED_TEAM_ENTRIES) {
    const keyClean = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (clean === keyClean || clean.startsWith(`${keyClean} `) || clean.endsWith(` ${keyClean}`) || clean.includes(` ${keyClean} `)) {
      return val;
    }
  }

  for (const [key, val] of SORTED_TEAM_ENTRIES) {
    const keyClean = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (clean.includes(keyClean)) {
      return val;
    }
  }

  return rawName.trim();
}

async function fetchPromiedosLiveData(): Promise<PromiedosCache> {
  const now = Date.now();
  if (cachedData && now - cachedData.lastFetched < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const urls = [
      'https://www.promiedos.com.ar/league/liga-profesional/hc',
      'https://www.promiedos.com.ar'
    ];

    let propsData: any = null;

    for (const targetUrl of urls) {
      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          },
          signal: AbortSignal.timeout(6000),
        });

        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          const nextDataText = $('#__NEXT_DATA__').html();
          if (nextDataText) {
            const parsed = JSON.parse(nextDataText);
            if (parsed.props?.pageProps?.data) {
              propsData = parsed.props.pageProps.data;
              break;
            }
          }
        }
      } catch (err) {
        console.warn(`Error fetching ${targetUrl}:`, (err as Error).message);
      }
    }

    if (!propsData) {
      throw new Error('No Promiedos structured data found in HTML');
    }

    const allRounds: Record<number, PromiedosLiveMatch[]> = {};
    let activeRoundNumber = 6;
    const currentMatches: PromiedosLiveMatch[] = [];

    // Parse league games filters
    const filters = propsData.games?.filters || [];
    for (const filter of filters) {
      const matchFecha = filter.name?.match(/Fecha\s+(\d+)/i);
      const fechaNum = matchFecha ? parseInt(matchFecha[1], 10) : 0;
      if (fechaNum > 0 && Array.isArray(filter.games)) {
        if (filter.selected) {
          activeRoundNumber = fechaNum;
        }

        const roundMatches: PromiedosLiveMatch[] = [];
        filter.games.forEach((g: any, idx: number) => {
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
          } else if (statusEnum === 2 || liveMinute.includes('PT') || liveMinute.includes('ST') || liveMinute.includes('Entre')) {
            status = 'LIVE';
          } else {
            status = 'SCHEDULED';
          }

          let homeScore: number | undefined = undefined;
          let awayScore: number | undefined = undefined;

          if (Array.isArray(g.scores) && g.scores.length >= 2) {
            homeScore = typeof g.scores[0] === 'number' ? g.scores[0] : undefined;
            awayScore = typeof g.scores[1] === 'number' ? g.scores[1] : undefined;
          } else if (g.teams?.[0]?.score !== undefined && g.teams?.[1]?.score !== undefined) {
            homeScore = parseInt(g.teams[0].score, 10);
            awayScore = parseInt(g.teams[1].score, 10);
          }

          // Extract events
          const events: PromiedosLiveMatch['events'] = [];
          
          // Home events
          (g.teams?.[0]?.goals || []).forEach((goal: any, gIdx: number) => {
            events.push({
              id: `ev-prom-${g.id || idx}-h-${gIdx}`,
              minute: goal.time || 0,
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
              minute: goal.time || 0,
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

          const tvList = (g.tv_networks || []).map((t: any) => t.name).filter(Boolean);

          const matchObj: PromiedosLiveMatch = {
            id: `prom-${g.id || `${fechaNum}-${idx + 1}`}`,
            promiedosId: g.id,
            fecha: fechaNum,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
            status,
            liveMinute,
            displayTime: g.start_time || '',
            tvNetworks: tvList,
            events,
          };

          roundMatches.push(matchObj);
          if (fechaNum === activeRoundNumber) {
            currentMatches.push(matchObj);
          }
        });

        allRounds[fechaNum] = roundMatches;
      }
    }

    // Also check homepage leagues for any real-time today live games
    if (Array.isArray(propsData.leagues)) {
      const argLeague = propsData.leagues.find(
        (l: any) => l.name === 'Liga Profesional Argentina' || l.url_name === 'liga-profesional'
      );
      if (argLeague && Array.isArray(argLeague.games)) {
        argLeague.games.forEach((g: any) => {
          const homeRaw = g.teams?.[0]?.name || '';
          const awayRaw = g.teams?.[1]?.name || '';
          const homeTeam = normalizeTeamName(homeRaw);
          const awayTeam = normalizeTeamName(awayRaw);

          const targetMatch = currentMatches.find(
            m => (m.homeTeam === homeTeam && m.awayTeam === awayTeam) || (m.homeTeam.includes(homeTeam) && m.awayTeam.includes(awayTeam))
          );

          if (targetMatch) {
            if (Array.isArray(g.scores) && g.scores.length >= 2) {
              targetMatch.homeScore = g.scores[0];
              targetMatch.awayScore = g.scores[1];
            }
            if (g.status?.enum === 3) {
              targetMatch.status = 'FINISHED';
              targetMatch.liveMinute = 'Finalizado';
            } else if (g.status?.enum === 2) {
              targetMatch.status = 'LIVE';
              targetMatch.liveMinute = g.game_time_status_to_display || 'En Vivo';
            }
          }
        });
      }
    }

    cachedData = {
      lastFetched: now,
      currentRound: activeRoundNumber,
      matches: currentMatches,
      allRounds,
      source: 'promiedos',
    };

    return cachedData;
  } catch (error) {
    console.error('Error in fetchPromiedosLiveData:', error);
    // Return cached if available, or empty fallback
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

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Promiedos Live Fixture endpoint (Queried every 45s by client)
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
  try {
    const data = await fetchPromiedosLiveData();
    res.json({
      success: true,
      refreshed: true,
      timestamp: data.lastFetched,
      matchesCount: data.matches.length,
      source: data.source,
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
}

startServer();
