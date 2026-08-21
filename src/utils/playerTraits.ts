import { Player } from '../types';

export interface PlayerTrait {
  id: string;
  label: string;
  emoji: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  description: string;
}

/**
 * Evaluates the performance stats of a player to calculate dynamic traits and badges.
 */
export function getPlayerTraits(player: Player): PlayerTrait[] {
  const traits: PlayerTrait[] = [];
  const partidos = player.partidosJugados || 0;
  const vi = player.vallaInvicta || 0;
  const pos = player.posicion;

  // 1. Arqueros y Defensores: Vallas invictas
  if ((pos === 'ARQ' || pos === 'DEF') && partidos >= 2) {
    const viRatio = vi / partidos;
    if (viRatio >= 0.6) {
      traits.push({
        id: 'recibe_pocos_goles',
        label: 'Recibe pocos goles',
        emoji: '🧤',
        colorClass: 'text-emerald-800 dark:text-emerald-300',
        bgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
        borderClass: 'border-emerald-200 dark:border-emerald-800/80',
        description: `${vi} vallas invictas en ${partidos} partidos jugados (${Math.round(viRatio * 100)}%)`,
      });
    } else if (viRatio < 0.3) {
      traits.push({
        id: 'recibe_muchos_goles',
        label: 'Recibe muchos goles',
        emoji: '⚠️',
        colorClass: 'text-rose-800 dark:text-rose-300',
        bgClass: 'bg-rose-50 dark:bg-rose-950/60',
        borderClass: 'border-rose-200 dark:border-rose-800/80',
        description: `Solo ${vi} valla${vi !== 1 ? 's' : ''} invicta${vi !== 1 ? 's' : ''} en ${partidos} partidos jugados (${Math.round(viRatio * 100)}%)`,
      });
    }
  }

  // 2. Cualquier jugador: En racha
  // Condición: Haber marcado al menos 1 gol en los últimos 2 partidos, o bien haber obtenido más de 15 puntos en cada uno de los últimos 2 partidos consecutivos (>15 pts en F_n y >15 pts en F_n-1)
  const scoresObj = player.fechasPuntajes || {};
  const playedFixtures = Object.entries(scoresObj)
    .filter(([_, val]) => val !== '' && val !== 's/c' && !isNaN(Number(val)))
    .map(([key, val]) => ({ fecha: parseInt(key.replace('F', ''), 10), pts: Number(val) }))
    .sort((a, b) => a.fecha - b.fecha);

  const last2 = playedFixtures.slice(-2);

  // Condición A: 2 fechas consecutivas con más de 15 puntos en cada una
  const hasHighPointsConsecutive =
    last2.length === 2 && last2[0].pts > 15 && last2[1].pts > 15;

  // Condición B: Marcó al menos 1 gol en los últimos 2 partidos
  // En Gran DT, un gol suma +4 (DEL), +5 (VOL) o +6 (DEF), alcanzando habitualmente puntajes >= 8 en esa fecha
  const hasScoredInLast2 =
    (player.goles || 0) >= 1 &&
    last2.length > 0 &&
    (last2.some(f => f.pts >= 8) || (player.partidosJugados || 0) <= 2);

  if (hasHighPointsConsecutive || hasScoredInLast2) {
    let streakDesc = '';
    if (hasHighPointsConsecutive && hasScoredInLast2) {
      streakDesc = `Gol en fechas recientes y 2 fechas consecutivas con más de 15 pts (${last2[0].pts} y ${last2[1].pts} pts)`;
    } else if (hasHighPointsConsecutive) {
      streakDesc = `2 fechas consecutivas con más de 15 puntos (${last2[0].pts} pts y ${last2[1].pts} pts)`;
    } else {
      streakDesc = `Gol convertido en los últimos 2 partidos del torneo`;
    }

    traits.push({
      id: 'en_racha',
      label: 'En racha',
      emoji: '🔥',
      colorClass: 'text-amber-800 dark:text-amber-300',
      bgClass: 'bg-amber-50 dark:bg-amber-950/60',
      borderClass: 'border-amber-200 dark:border-amber-800/80',
      description: streakDesc,
    });
  }

  // 3. Cualquier jugador: Tarjetero (tarjetas en más del 50% de los partidos)
  const totalTarjetas = (player.amarillas || 0) + (player.rojas || 0);
  if (partidos >= 2 && totalTarjetas / partidos > 0.5) {
    traits.push({
      id: 'tarjetero',
      label: 'Tarjetero',
      emoji: '🟨',
      colorClass: 'text-yellow-800 dark:text-yellow-300',
      bgClass: 'bg-yellow-50 dark:bg-yellow-950/60',
      borderClass: 'border-yellow-200 dark:border-yellow-800/80',
      description: `${player.amarillas || 0} amarillas y ${player.rojas || 0} rojas en ${partidos} partidos jugados`,
    });
  }

  // 4. Cualquier jugador: Patea penales (goles de penal GP > 0 o penales ejecutados)
  if ((player.golesPenal && player.golesPenal > 0) || (player.penalesErrados && player.penalesErrados > 0)) {
    traits.push({
      id: 'patea_penales',
      label: 'Patea penales',
      emoji: '⚽',
      colorClass: 'text-blue-800 dark:text-cyan-300',
      bgClass: 'bg-blue-50 dark:bg-blue-950/60',
      borderClass: 'border-blue-200 dark:border-blue-800/80',
      description: `${player.golesPenal || 0} gol${(player.golesPenal || 0) !== 1 ? 'es' : ''} convertidos de penal`,
    });
  }

  // 5. Cualquier jugador: Figura (figura en más de un partido VF > 1)
  if (player.figura && player.figura > 1) {
    traits.push({
      id: 'figura',
      label: 'Figura',
      emoji: '⭐',
      colorClass: 'text-purple-800 dark:text-purple-300',
      bgClass: 'bg-purple-50 dark:bg-purple-950/60',
      borderClass: 'border-purple-200 dark:border-purple-800/80',
      description: `Elegido figura del partido en ${player.figura} fechas`,
    });
  }

  // 6. Arqueros: Penalero (atajó penales PA > 0)
  if (pos === 'ARQ' && player.penalesAtajados && player.penalesAtajados > 0) {
    traits.push({
      id: 'penalero',
      label: 'Penalero',
      emoji: '🧤',
      colorClass: 'text-teal-800 dark:text-teal-300',
      bgClass: 'bg-teal-50 dark:bg-teal-950/60',
      borderClass: 'border-teal-200 dark:border-teal-800/80',
      description: `${player.penalesAtajados} penal${player.penalesAtajados > 1 ? 'es' : ''} atajado${player.penalesAtajados > 1 ? 's' : ''}`,
    });
  }

  return traits;
}
