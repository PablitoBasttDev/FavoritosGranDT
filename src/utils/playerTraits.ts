import { Player } from '../types';
import { RAW_STANDINGS_DATA } from '../data/standings';
import { SHEET_TEAM_MAP } from '../services/sheetsService';

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

  // 0. Posible Titular (jugó 80% o más de los partidos disputados por su equipo/torneo)
  const mappedTeam = SHEET_TEAM_MAP[player.equipo] || player.equipo;
  const teamStanding = RAW_STANDINGS_DATA[mappedTeam] || RAW_STANDINGS_DATA[player.equipo];
  const teamMatchesPlayed = teamStanding?.played || 5;

  if (teamMatchesPlayed > 0 && partidos / teamMatchesPlayed >= 0.8) {
    const pct = Math.round((partidos / teamMatchesPlayed) * 100);
    traits.push({
      id: 'posible_titular',
      label: 'Posible Titular',
      emoji: '🟢',
      colorClass: 'text-emerald-800 dark:text-emerald-300',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
      borderClass: 'border-emerald-200 dark:border-emerald-800/80',
      description: `Disputó el ${pct}% de los partidos del torneo (${partidos}/${teamMatchesPlayed} partidos)`,
    });
  }

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
  // Condición:
  // - Al menos 1 gol en 2 de los últimos 3 partidos del torneo
  // - O BIEN al menos 15 puntos en cada uno de los 2 últimos partidos (>= 15 pts en F_n y >= 15 pts en F_n-1)
  const scoresObj = player.fechasPuntajes || {};
  const playedFixtures = Object.entries(scoresObj)
    .filter(([_, val]) => val !== '' && val !== 's/c' && !isNaN(Number(val)))
    .map(([key, val]) => ({ fecha: parseInt(key.replace('F', ''), 10), pts: Number(val) }))
    .sort((a, b) => a.fecha - b.fecha);

  const last2 = playedFixtures.slice(-2);
  const last3 = playedFixtures.slice(-3);

  // Condición A: 15 puntos o más en cada uno de los 2 últimos partidos
  const has15PtsInLast2 =
    last2.length === 2 && last2[0].pts >= 15 && last2[1].pts >= 15;

  // Condición B: Al menos 1 gol en 2 de los últimos 3 partidos
  // Requiere al menos 2 goles en el torneo y que al menos 2 de los últimos 3 partidos tengan puntaje con gol (>= 8 pts)
  const matchesWithGoalInLast3 = last3.filter(f => f.pts >= 8).length;
  const hasGoalIn2OfLast3 =
    (player.goles || 0) >= 2 &&
    last3.length >= 2 &&
    matchesWithGoalInLast3 >= 2;

  if (has15PtsInLast2 || hasGoalIn2OfLast3) {
    let streakDesc = '';
    if (has15PtsInLast2 && hasGoalIn2OfLast3) {
      streakDesc = `Gol en 2 de los últimos 3 partidos y 15+ pts en los últimos 2 (${last2[0].pts} y ${last2[1].pts} pts)`;
    } else if (has15PtsInLast2) {
      streakDesc = `15 o más puntos en cada uno de los 2 últimos partidos (${last2[0].pts} pts y ${last2[1].pts} pts)`;
    } else {
      streakDesc = `Gol en 2 de los últimos 3 partidos disputados (${matchesWithGoalInLast3} partidos con gol)`;
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
