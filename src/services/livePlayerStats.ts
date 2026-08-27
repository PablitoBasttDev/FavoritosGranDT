import { Player, Position } from '../types.js';
import { FIXTURES_DATA, MatchFixture, MatchEvent, getDynamicMatchState } from '../data/fixture.js';
import { findPlayerByNameOrTeam } from '../data/tournamentStats.js';

/**
 * Calcula los puntos de Gran DT para un jugador en un partido específico en vivo o finalizado
 */
export function calculatePlayerRoundGranDTPoints(
  player: Player,
  match: MatchFixture,
  currentDate: Date = new Date()
): {
  played: boolean;
  roundPoints: number;
  goals: number;
  penalties: number;
  redCards: number;
  cleanSheet: boolean;
  isFigure: boolean;
} {
  const dynamic = getDynamicMatchState(match, currentDate);
  if (dynamic.status !== 'FINISHED' && dynamic.status !== 'LIVE') {
    return {
      played: false,
      roundPoints: 0,
      goals: 0,
      penalties: 0,
      redCards: 0,
      cleanSheet: false,
      isFigure: false,
    };
  }

  const isHome = match.homeTeam.toLowerCase() === player.equipo.toLowerCase() ||
                 match.homeTeam.toLowerCase().includes(player.equipo.toLowerCase()) ||
                 player.equipo.toLowerCase().includes(match.homeTeam.toLowerCase());
  
  const isAway = match.awayTeam.toLowerCase() === player.equipo.toLowerCase() ||
                 match.awayTeam.toLowerCase().includes(player.equipo.toLowerCase()) ||
                 player.equipo.toLowerCase().includes(match.awayTeam.toLowerCase());

  if (!isHome && !isAway) {
    return {
      played: false,
      roundPoints: 0,
      goals: 0,
      penalties: 0,
      redCards: 0,
      cleanSheet: false,
      isFigure: false,
    };
  }

  const teamSide = isHome ? 'home' : 'away';
  const teamGoalsConceded = isHome ? (dynamic.awayScore ?? 0) : (dynamic.homeScore ?? 0);
  const teamGoalsScored = isHome ? (dynamic.homeScore ?? 0) : (dynamic.awayScore ?? 0);
  const teamWon = teamGoalsScored > teamGoalsConceded;
  const teamDrew = teamGoalsScored === teamGoalsConceded;

  // Base rating Clarín / Gran DT (5.0 a 6.0 estándar según resultado del club)
  let points = teamWon ? 6 : teamDrew ? 5 : 4.5;

  // Buscar eventos del jugador en el partido
  const events = dynamic.visibleEvents || [];
  let goals = 0;
  let penalties = 0;
  let redCards = 0;

  events.forEach(ev => {
    if (ev.team === teamSide) {
      const matched = findPlayerByNameOrTeam(ev.playerName, player.equipo);
      const isThisPlayer = (matched && matched.id === player.id) ||
                           ev.playerName.toLowerCase().includes(player.nombre.toLowerCase()) ||
                           player.nombre.toLowerCase().includes(ev.playerName.toLowerCase());

      if (isThisPlayer) {
        if (ev.type === 'goal' || ev.type === 'penalty_goal') {
          goals += 1;
          if (ev.type === 'penalty_goal') penalties += 1;

          // Puntos por gol según posición oficial Gran DT
          switch (player.posicion) {
            case 'ARQ':
              points += 12;
              break;
            case 'DEF':
              points += 9;
              break;
            case 'VOL':
              points += 6;
              break;
            case 'DEL':
              points += 4;
              break;
          }
        }

        if (ev.type === 'red_card' || ev.type === 'second_yellow') {
          redCards += 1;
          points -= 2; // Penalización Gran DT por expulsión
        }
      }
    }
  });

  // Valla Invicta Gran DT para Arqueros (+3 pts) y Defensores (+2 pts)
  const cleanSheet = teamGoalsConceded === 0;
  if (cleanSheet) {
    if (player.posicion === 'ARQ') {
      points += 3;
    } else if (player.posicion === 'DEF') {
      points += 2;
    }
  } else if (teamGoalsConceded >= 2) {
    // Penalización por goles recibidos (-1 pt cada 2 goles a partir de 2 goles recibidos)
    if (player.posicion === 'ARQ' || player.posicion === 'DEF') {
      points -= Math.floor(teamGoalsConceded / 2);
    }
  }

  // Figura de la cancha (+4 pts si metió 2 o más goles o tuvo un desempeño extraordinario)
  const isFigure = goals >= 2 || (goals >= 1 && teamWon && player.posicion !== 'DEL');
  if (isFigure) {
    points += 4;
  }

  // Los puntos no pueden ser negativos en Gran DT (mínimo 1)
  const finalRoundPoints = Math.max(1, Math.round(points * 10) / 10);

  return {
    played: true,
    roundPoints: finalRoundPoints,
    goals,
    penalties,
    redCards,
    cleanSheet,
    isFigure,
  };
}

/**
 * Enriquece la lista base de jugadores con los eventos y puntos reales de los partidos en vivo o finalizados
 */
export function enrichPlayersWithLiveMatchStats(
  basePlayers: Player[],
  fixtures: MatchFixture[] = FIXTURES_DATA,
  currentRound: number = 6,
  currentDate: Date = new Date()
): Player[] {
  if (!basePlayers || basePlayers.length === 0) return [];

  // Obtener partidos de la fecha en juego
  const roundFixtures = fixtures.filter(f => f.fecha === currentRound);

  return basePlayers.map(player => {
    // Buscar si el equipo del jugador juega en esta fecha
    const match = roundFixtures.find(
      m => m.homeTeam.toLowerCase() === player.equipo.toLowerCase() ||
           m.awayTeam.toLowerCase() === player.equipo.toLowerCase() ||
           m.homeTeam.toLowerCase().includes(player.equipo.toLowerCase()) ||
           player.equipo.toLowerCase().includes(m.homeTeam.toLowerCase()) ||
           m.awayTeam.toLowerCase().includes(player.equipo.toLowerCase()) ||
           player.equipo.toLowerCase().includes(m.awayTeam.toLowerCase())
    );

    if (!match) return player;

    const roundCalc = calculatePlayerRoundGranDTPoints(player, match, currentDate);
    if (!roundCalc.played) return player;

    const basePJ = player.partidosJugados || 0;
    const basePts = player.puntosTotales || 0;
    const baseGoles = player.goles || 0;
    const basePenales = player.golesPenal || 0;
    const baseRojas = player.rojas || 0;
    const baseValla = player.vallaInvicta || 0;
    const baseFigura = player.figura || 0;

    const newPJ = basePJ + (roundCalc.played ? 1 : 0);
    const newPts = basePts + roundCalc.roundPoints;
    const newGoles = baseGoles + roundCalc.goals;
    const newPenales = basePenales + roundCalc.penalties;
    const newRojas = baseRojas + roundCalc.redCards;
    const newValla = baseValla + (roundCalc.cleanSheet && (player.posicion === 'ARQ' || player.posicion === 'DEF') ? 1 : 0);
    const newFigura = baseFigura + (roundCalc.isFigure ? 1 : 0);

    const newPromedio = newPJ > 0 ? Math.round((newPts / newPJ) * 10) / 10 : player.promedio;

    const updatedFechasPuntajes = {
      ...(player.fechasPuntajes || {}),
      [`F${currentRound}`]: roundCalc.roundPoints,
    };

    return {
      ...player,
      puntosTotales: newPts,
      partidosJugados: newPJ,
      promedio: newPromedio,
      goles: newGoles,
      golesPenal: newPenales,
      rojas: newRojas,
      vallaInvicta: newValla,
      figura: newFigura,
      fechasPuntajes: updatedFechasPuntajes,
    };
  });
}
