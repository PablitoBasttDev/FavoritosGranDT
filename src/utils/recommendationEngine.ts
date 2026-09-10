import { FavoritePlayer, Position } from '../types.js';
import { FIXTURES_DATA } from '../data/fixture.js';
import { getTeamMatchInfo } from '../data/standings.js';
import { ALL_PLAYERS } from '../data/players.js';
import { getPlayerTraits } from './playerTraits.js';

// ============================================================================
// MOTOR DE RECOMENDACIÓN: "Once Ideal de tus Favoritos" para la próxima fecha
// ============================================================================
// Combina, para cada favorito, su nivel general, sus rasgos/racha, y el
// contexto puntual del partido que le toca jugar (rival, local/visitante,
// forma reciente propia y del rival) para estimar qué tan probable es que
// sume puntos en la fecha que se avecina.

export interface FormSummary {
  wins: number;
  draws: number;
  losses: number;
  sampleSize: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  cleanSheetRate: number; // 0..1
  pointsPerGame: number; // 0..3
  label: string; // "3V 1E 1D"
}

export interface TeamRoundContext {
  teamName: string;
  isHome: boolean;
  rival: string;
  rivalShort?: string;
  dayOfWeek: string;
  displayTime: string;
  stadium?: string;
  overallForm: FormSummary; // últimos partidos del equipo, cualquier condición
  splitForm: FormSummary; // últimos partidos específicamente de local (si juega de local) o de visitante (si juega de visitante)
  rivalForm: FormSummary; // últimos partidos del rival, cualquier condición
}

function emptyForm(): FormSummary {
  return {
    wins: 0,
    draws: 0,
    losses: 0,
    sampleSize: 0,
    avgGoalsFor: 0,
    avgGoalsAgainst: 0,
    cleanSheetRate: 0,
    pointsPerGame: 0,
    label: 'Sin datos',
  };
}

function summarizeForm(results: Array<{ gf: number; ga: number }>): FormSummary {
  if (results.length === 0) return emptyForm();

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let cleanSheets = 0;
  let totalGf = 0;
  let totalGa = 0;

  results.forEach(({ gf, ga }) => {
    totalGf += gf;
    totalGa += ga;
    if (gf > ga) wins++;
    else if (gf === ga) draws++;
    else losses++;
    if (ga === 0) cleanSheets++;
  });

  const n = results.length;
  return {
    wins,
    draws,
    losses,
    sampleSize: n,
    avgGoalsFor: totalGf / n,
    avgGoalsAgainst: totalGa / n,
    cleanSheetRate: cleanSheets / n,
    pointsPerGame: (wins * 3 + draws) / n,
    label: `${wins}V ${draws}E ${losses}D`,
  };
}

/**
 * Últimos `lastN` partidos FINALIZADOS de un equipo anteriores a `beforeRound`, con el
 * resultado desde la perspectiva de ese equipo (gf = a favor, ga = en contra).
 * `homeOnly`/`awayOnly` restringen a su historial de local o de visitante específicamente.
 */
function getRecentResults(
  teamName: string,
  beforeRound: number,
  lastN: number,
  filter: 'home' | 'away' | 'all'
): Array<{ gf: number; ga: number }> {
  const matches = FIXTURES_DATA.filter(m => {
    if (m.fecha >= beforeRound || m.status !== 'FINISHED') return false;
    if (filter === 'home') return m.homeTeam === teamName;
    if (filter === 'away') return m.awayTeam === teamName;
    return m.homeTeam === teamName || m.awayTeam === teamName;
  }).sort((a, b) => a.fecha - b.fecha);

  return matches.slice(-lastN).map(m => {
    const isHome = m.homeTeam === teamName;
    return {
      gf: (isHome ? m.homeScore : m.awayScore) ?? 0,
      ga: (isHome ? m.awayScore : m.homeScore) ?? 0,
    };
  });
}

const contextCache = new Map<string, TeamRoundContext | null>();

/**
 * Contexto completo del próximo partido de un equipo: rival, local/visitante, y forma
 * reciente propia (general y específica de local/visitante) y del rival.
 */
export function getTeamRoundContext(teamName: string, currentDate: Date = new Date()): TeamRoundContext | null {
  const cacheKey = `${teamName}__${currentDate.toDateString()}`;
  if (contextCache.has(cacheKey)) return contextCache.get(cacheKey)!;

  const matchInfo = getTeamMatchInfo(teamName, currentDate);
  if (!matchInfo) {
    contextCache.set(cacheKey, null);
    return null;
  }

  const round = matchInfo.match.fecha;
  const overallForm = summarizeForm(getRecentResults(teamName, round, 5, 'all'));
  const splitForm = summarizeForm(getRecentResults(teamName, round, 5, matchInfo.isHome ? 'home' : 'away'));
  const rivalForm = summarizeForm(getRecentResults(matchInfo.rival, round, 5, 'all'));

  const context: TeamRoundContext = {
    teamName,
    isHome: matchInfo.isHome,
    rival: matchInfo.rival,
    rivalShort: matchInfo.rivalShort,
    dayOfWeek: matchInfo.dayOfWeek,
    displayTime: matchInfo.displayTime,
    stadium: matchInfo.stadium,
    overallForm,
    splitForm,
    rivalForm,
  };

  contextCache.set(cacheKey, context);
  return context;
}

export interface PlayerRecommendation {
  player: FavoritePlayer;
  score: number;
  reasons: string[];
  context: TeamRoundContext;
}

/** Percentil (0-100) del promedio Gran DT de un jugador contra el resto de su misma posición. */
function averagePercentileWithinPosition(player: FavoritePlayer): number {
  const own = player.promedioGranDT ?? player.promedio ?? 0;
  const pool = ALL_PLAYERS.filter(p => p.posicion === player.posicion).map(
    p => p.promedioGranDT ?? p.promedio ?? 0
  );
  if (pool.length === 0) return 50;
  const below = pool.filter(v => v <= own).length;
  return (below / pool.length) * 100;
}

function scoreFavorite(player: FavoritePlayer, context: TeamRoundContext): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // 1. Nivel general del jugador dentro de su posición (0-35 pts)
  const percentile = averagePercentileWithinPosition(player);
  score += (percentile / 100) * 35;
  if (percentile >= 80) reasons.push('Entre los de mejor promedio Gran DT de su posición');

  // 2. Confiabilidad: penaliza a quien juega poco (evita que una muestra chica infle el promedio)
  const played = player.partidosJugados || 0;
  const reliability = played >= 6 ? 1 : played >= 3 ? 0.85 : played >= 1 ? 0.6 : 0.35;
  score *= reliability;
  if (played > 0 && played < 3) reasons.push('Poca cantidad de partidos jugados, a confirmar titularidad');

  // 3. Rasgos y racha
  const traits = getPlayerTraits(player);
  const traitIds = new Set(traits.map(t => t.id));
  if (traitIds.has('en_racha')) {
    score += 15;
    reasons.push('En racha de buenos rendimientos');
  }
  if (traitIds.has('figura')) {
    score += 8;
    reasons.push('Suele ser figura del partido');
  }
  if (traitIds.has('patea_penales') && (player.posicion === 'DEL' || player.posicion === 'VOL')) {
    score += 6;
    reasons.push('Pateador de penales del equipo');
  }
  if (traitIds.has('recibe_pocos_goles') && (player.posicion === 'ARQ' || player.posicion === 'DEF')) {
    score += 10;
    reasons.push('Buen porcentaje de vallas invictas');
  }
  if (traitIds.has('penalero') && player.posicion === 'ARQ') {
    score += 8;
    reasons.push('Atajó penales esta temporada');
  }
  if (traitIds.has('tarjetero')) {
    score -= 6;
    reasons.push('Riesgo de tarjeta (acumula amarillas/rojas seguido)');
  }
  if (traitIds.has('recibe_muchos_goles') && (player.posicion === 'ARQ' || player.posicion === 'DEF')) {
    score -= 10;
    reasons.push('Su equipo recibe muchos goles últimamente');
  }

  // 4. Forma reciente del equipo (general y específica de local/visitante) - 0-15 pts cada una
  score += context.overallForm.pointsPerGame * 5;
  if (context.overallForm.sampleSize >= 3 && context.overallForm.pointsPerGame >= 2) {
    reasons.push(`Buen presente general del equipo (${context.overallForm.label} en los últimos ${context.overallForm.sampleSize})`);
  }

  score += context.splitForm.pointsPerGame * 5;
  if (context.splitForm.sampleSize >= 2 && context.splitForm.pointsPerGame >= 2) {
    reasons.push(
      `Buen rendimiento como ${context.isHome ? 'local' : 'visitante'} (${context.splitForm.label} en sus últimos ${context.splitForm.sampleSize} de ${context.isHome ? 'local' : 'visitante'})`
    );
  } else if (context.splitForm.sampleSize >= 2 && context.splitForm.pointsPerGame <= 0.7) {
    reasons.push(`Le cuesta como ${context.isHome ? 'local' : 'visitante'} (${context.splitForm.label} en sus últimos ${context.splitForm.sampleSize})`);
  }

  // 5. Fortaleza del rival, leída según el rol táctico del jugador (0-20 pts)
  const isAttacker = player.posicion === 'DEL' || player.posicion === 'VOL';
  const isBackLine = player.posicion === 'ARQ' || player.posicion === 'DEF';

  if (isAttacker && context.rivalForm.sampleSize > 0) {
    // Rival que recibe muchos goles = más chances de convertir/asistir
    const bonus = Math.max(0, Math.min(20, context.rivalForm.avgGoalsAgainst * 10));
    score += bonus;
    if (context.rivalForm.avgGoalsAgainst >= 1.4) {
      reasons.push(`${context.rival} viene recibiendo muchos goles (${context.rivalForm.avgGoalsAgainst.toFixed(1)} por partido)`);
    }
  }

  if (isBackLine && context.rivalForm.sampleSize > 0) {
    // Rival que convierte pocos goles = más chances de valla invicta
    const bonus = Math.max(0, Math.min(20, (1.6 - context.rivalForm.avgGoalsFor) * 13));
    score += bonus;
    if (context.rivalForm.avgGoalsFor <= 0.8) {
      reasons.push(`${context.rival} viene convirtiendo poco (${context.rivalForm.avgGoalsFor.toFixed(1)} goles por partido)`);
    }
  }

  // 6. Ventaja de localía (leve, aplica a todas las posiciones)
  if (context.isHome) {
    score += 5;
    reasons.push(`Juega de local ante ${context.rival}`);
  } else {
    score += 1;
    reasons.push(`Juega de visitante ante ${context.rival}`);
  }

  return { score: Math.round(score * 10) / 10, reasons };
}

export interface RecommendedLineup {
  roundNumber: number | null;
  arqueros: PlayerRecommendation[];
  defensores: PlayerRecommendation[];
  mediocampistas: PlayerRecommendation[];
  delanteros: PlayerRecommendation[];
}

const QUOTAS: Record<Position, number> = { ARQ: 3, DEF: 6, VOL: 6, DEL: 6 };

/**
 * Arma el "once ideal" de la próxima fecha usando exclusivamente jugadores de la lista de
 * favoritos del usuario, respetando cupos por posición (3 ARQ, 6 DEF, 6 VOL, 6 DEL). Si hay
 * menos favoritos disponibles que el cupo en alguna posición, devuelve los que haya.
 */
export function getRecommendedLineup(
  favorites: FavoritePlayer[],
  currentDate: Date = new Date()
): RecommendedLineup {
  contextCache.clear();

  const byPosition: Record<Position, PlayerRecommendation[]> = { ARQ: [], DEF: [], VOL: [], DEL: [] };
  let roundNumber: number | null = null;

  favorites.forEach(player => {
    // Se excluyen jugadores suspendidos o lesionados: tienen ~0 chances reales de sumar puntos.
    if (player.statusInfo && (player.statusInfo.status === 'SUSPENDED' || player.statusInfo.status === 'INJURED')) {
      return;
    }

    // Sin partidos jugados no hay ninguna evidencia de que vaya a sumar puntos esta fecha
    // (podría ni estar en la rotación) - por más que su equipo tenga un contexto favorable.
    if (!player.partidosJugados || player.partidosJugados === 0) {
      return;
    }

    const context = getTeamRoundContext(player.equipo, currentDate);
    if (!context) return;

    const { score, reasons } = scoreFavorite(player, context);
    byPosition[player.posicion]?.push({ player, score, reasons, context });
  });

  // Resolver el número de fecha real a partir de cualquier contexto encontrado
  const anyContext = [...byPosition.ARQ, ...byPosition.DEF, ...byPosition.VOL, ...byPosition.DEL][0];
  if (anyContext) {
    const match = FIXTURES_DATA.find(
      f =>
        (f.homeTeam === anyContext.context.teamName || f.awayTeam === anyContext.context.teamName) &&
        (f.homeTeam === anyContext.context.rival || f.awayTeam === anyContext.context.rival)
    );
    roundNumber = match?.fecha ?? null;
  }

  (Object.keys(byPosition) as Position[]).forEach(pos => {
    byPosition[pos].sort((a, b) => b.score - a.score);
  });

  return {
    roundNumber,
    arqueros: byPosition.ARQ.slice(0, QUOTAS.ARQ),
    defensores: byPosition.DEF.slice(0, QUOTAS.DEF),
    mediocampistas: byPosition.VOL.slice(0, QUOTAS.VOL),
    delanteros: byPosition.DEL.slice(0, QUOTAS.DEL),
  };
}
