import React, { useState, useEffect, useMemo } from 'react';
import {
  FIXTURES_DATA,
  getTournamentRoundStatus,
  getFixturesGroupedByRound,
  getAllAvailableFechas,
  getDynamicMatchState,
  MatchFixture,
  MatchEvent,
} from '../data/fixture.js';
import {
  usePromiedosLiveFixture,
  mergeWithPromiedosMatches,
} from '../services/promiedosService.js';
import { TeamBadge } from './TeamBadge.js';
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Trophy,
  Activity,
  Flame,
  Search,
  CheckCircle2,
  RefreshCw,
  Radio,
  Zap,
} from 'lucide-react';

interface CountdownBannerProps {
  onSelectClub?: (clubName: string) => void;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({ onSelectClub }) => {
  const [now, setNow] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const roundStatus = getTournamentRoundStatus(now);
  const [selectedFechaTab, setSelectedFechaTab] = useState<number>(() => getTournamentRoundStatus().roundNumber);
  const [fixtureStatusFilter, setFixtureStatusFilter] = useState<'ALL' | 'LIVE' | 'FINISHED' | 'SCHEDULED'>('ALL');
  const [fixtureSearchQuery, setFixtureSearchQuery] = useState('');

  // Hook de sincronización en tiempo real con Promiedos cada 45 segundos en segundo plano
  const { promiedosMatches } = usePromiedosLiveFixture(selectedFechaTab);

  // Actualización en tiempo real segundo a segundo del reloj
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const availableFechas = getAllAvailableFechas();

  // Sincronizar automáticamente la pestaña seleccionada con la fecha en juego o próxima
  useEffect(() => {
    if (roundStatus.roundNumber && availableFechas.includes(roundStatus.roundNumber)) {
      setSelectedFechaTab(roundStatus.roundNumber);
    }
  }, [roundStatus.roundNumber]);

  // Cálculo de tiempo restante (Días, Horas, Minutos, Segundos)
  const totalSeconds = Math.max(0, Math.floor(roundStatus.timeRemainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Obtener partidos de la fecha seleccionada y fusionar con datos en vivo de Promiedos
  const currentRoundFixturesWithState = useMemo(() => {
    const baseFixtures = FIXTURES_DATA.filter(f => f.fecha === selectedFechaTab);
    const mergedFixtures = mergeWithPromiedosMatches(baseFixtures, promiedosMatches);
    const sorted = [...mergedFixtures].sort((a, b) => {
      const aT = a.kickoff ? new Date(a.kickoff).getTime() : 0;
      const bT = b.kickoff ? new Date(b.kickoff).getTime() : 0;
      return aT - bT;
    });
    return sorted.map(f => ({
      fixture: f,
      dynamic: getDynamicMatchState(f, now),
    }));
  }, [selectedFechaTab, promiedosMatches, now]);

  // Filtrado de partidos
  const filteredFixtures = useMemo(() => {
    return currentRoundFixturesWithState.filter(({ fixture: f, dynamic }) => {
      // Filtro de estado
      if (fixtureStatusFilter === 'LIVE' && !dynamic.isLive) return false;
      if (fixtureStatusFilter === 'FINISHED' && !dynamic.isFinished) return false;
      if (fixtureStatusFilter === 'SCHEDULED' && !dynamic.isScheduled) return false;

      // Filtro de búsqueda
      if (fixtureSearchQuery.trim()) {
        const q = fixtureSearchQuery.trim().toLowerCase();
        const homeMatch = f.homeTeam.toLowerCase().includes(q);
        const awayMatch = f.awayTeam.toLowerCase().includes(q);
        const stadiumMatch = f.stadium ? f.stadium.toLowerCase().includes(q) : false;
        const playerMatch = dynamic.visibleEvents?.some(ev => ev.playerName.toLowerCase().includes(q));
        if (!homeMatch && !awayMatch && !stadiumMatch && !playerMatch) return false;
      }

      return true;
    });
  }, [currentRoundFixturesWithState, fixtureStatusFilter, fixtureSearchQuery]);

  // Estadísticas rápidas de la fecha
  const roundSummaryStats = useMemo(() => {
    let totalGoals = 0;
    let totalReds = 0;
    let finishedCount = 0;
    let liveCount = 0;

    currentRoundFixturesWithState.forEach(({ dynamic }) => {
      if (dynamic.isFinished) finishedCount++;
      if (dynamic.isLive) liveCount++;
      dynamic.visibleEvents?.forEach(e => {
        if (e.type === 'goal' || e.type === 'penalty_goal') totalGoals++;
        if (e.type === 'red_card' || e.type === 'second_yellow') totalReds++;
      });
    });

    return {
      totalGoals,
      totalReds,
      finishedCount,
      liveCount,
      totalMatches: currentRoundFixturesWithState.length,
    };
  }, [currentRoundFixturesWithState]);

  return (
    <div className="w-full">
      {/* 1. BANNER PRINCIPAL GRAN DT / LPF */}
      <div
        className={`w-full text-white rounded-lg sm:rounded-xl shadow-xs px-2.5 sm:px-5 py-1.5 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-3 border transition ${
          roundStatus.isRoundInPlay
            ? 'bg-gradient-to-r from-[#061b47] via-[#0b337c] to-[#082255] border-cyan-500/40 shadow-cyan-950/20'
            : 'bg-gradient-to-r from-[#07245c] via-[#0e3f9a] to-[#082b6c] border-blue-900/50'
        }`}
      >
        {/* Lado Izquierdo: Estado de Fecha / Cuenta Regresiva Automática */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-center sm:justify-start text-center sm:text-left w-full sm:w-auto">
          {/* Badge de Número de Fecha */}
          <div className="flex items-center gap-1 bg-blue-950/90 dark:bg-slate-950/90 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-cyan-500/40 shadow-xs">
            <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-cyan-300">
              FECHA {roundStatus.roundNumber}
            </span>
          </div>

          {/* ESTADO PRINCIPAL: "FECHA EN JUEGO" O CRONÓMETRO AL 1ER PARTIDO */}
          {roundStatus.isRoundInPlay ? (
            /* ================= ESTADO A: FECHA EN JUEGO ================= */
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-start">
              {/* Badge Pulsante En Vivo */}
              <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-400/40 animate-pulse">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 inline-block shadow-xs shadow-emerald-400" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-300">
                  EN JUEGO
                </span>
              </div>

              {/* Contadores dinámicos de partidos */}
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-blue-100 bg-blue-950/70 px-2 sm:px-2.5 py-0.5 rounded-md border border-blue-800/70 flex-wrap justify-center">
                {roundStatus.liveMatchesCount > 0 && (
                  <>
                    <span className="text-amber-400 font-black animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                      <span>{roundStatus.liveMatchesCount} en vivo</span>
                    </span>
                    <span className="text-blue-400">•</span>
                  </>
                )}
                <span className="text-emerald-300 font-black">
                  {roundStatus.finishedMatchesCount} jugados
                </span>
                <span className="text-blue-400">•</span>
                <span className="text-cyan-300 font-black">
                  {roundStatus.scheduledMatchesCount} por jugar
                </span>
              </div>
            </div>
          ) : (
            /* ================= ESTADO B: CUENTA REGRESIVA AL 1ER PARTIDO ================= */
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-start">
              <span className="text-[10px] sm:text-xs text-blue-100 font-extrabold uppercase tracking-tight hidden xs:inline">
                FALTA:
              </span>

              {/* Reloj Digital con Segundero en Vivo */}
              <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-base text-cyan-300 bg-blue-950/90 dark:bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-400/50 shadow-inner">
                <div className="flex flex-col items-center">
                  <span>{pad(days)}</span>
                  <span className="text-[7px] sm:text-[8px] font-sans font-bold text-blue-200 leading-none">D</span>
                </div>
                <span className="text-cyan-400 font-bold">:</span>
                <div className="flex flex-col items-center">
                  <span>{pad(hours)}</span>
                  <span className="text-[7px] sm:text-[8px] font-sans font-bold text-blue-200 leading-none">H</span>
                </div>
                <span className="text-cyan-400 font-bold">:</span>
                <div className="flex flex-col items-center">
                  <span>{pad(minutes)}</span>
                  <span className="text-[7px] sm:text-[8px] font-sans font-bold text-blue-200 leading-none">M</span>
                </div>
                <span className="text-cyan-400 font-bold">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-amber-300">{pad(seconds)}</span>
                  <span className="text-[7px] sm:text-[8px] font-sans font-bold text-amber-200 leading-none">S</span>
                </div>
              </div>

              {/* Conteo de partidos por jugar */}
              <span className="text-[9.5px] sm:text-[10.5px] text-blue-200 font-bold bg-blue-950/60 px-1.5 sm:px-2 py-0.5 rounded border border-blue-800/60 hidden sm:inline">
                {roundStatus.scheduledMatchesCount} partidos por jugar
              </span>
            </div>
          )}
        </div>

        {/* Lado Derecho: Próximo Partido y Botón de Apertura del Fixture */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-center w-full sm:w-auto">
          {roundStatus.nextUpcomingMatch && (
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 bg-blue-900/60 dark:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-blue-700/50 text-xs">
              <span className="text-[10px] text-cyan-300 font-bold uppercase hidden md:inline">
                {roundStatus.isRoundInPlay ? 'Próximo:' : 'Abre:'}
              </span>
              <TeamBadge teamName={roundStatus.nextUpcomingMatch.homeTeam} size="xs" />
              <span className="font-bold text-white text-[10px] sm:text-[11px] truncate max-w-[80px] sm:max-w-[120px]">
                {roundStatus.nextUpcomingMatch.homeTeam}
              </span>
              <span className="text-cyan-300 font-black text-[9px]">vs</span>
              <span className="font-bold text-white text-[10px] sm:text-[11px] truncate max-w-[80px] sm:max-w-[120px]">
                {roundStatus.nextUpcomingMatch.awayTeam}
              </span>
              <TeamBadge teamName={roundStatus.nextUpcomingMatch.awayTeam} size="xs" />
            </div>
          )}

          {/* Botón Desplegable del Fixture */}
          <button
            onClick={() => setShowScheduleModal(!showScheduleModal)}
            id="btn-toggle-fixture-modal"
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#0d3b8c] dark:text-cyan-300 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-md sm:rounded-lg shadow-xs transition active:scale-95 flex items-center gap-1 whitespace-nowrap border border-transparent dark:border-slate-700 cursor-pointer"
          >
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Resultados & Fixture</span>
            {showScheduleModal ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. PANEL DESPLEGABLE DE FIXTURE, RESULTADOS EN VIVO Y EVENTOS */}
      {showScheduleModal && (
        <div className="mt-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-300 dark:border-slate-800 p-3.5 sm:p-4.5 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
          {/* Barra Superior con Selector de Fechas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[#1b55e2] dark:text-cyan-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-xs sm:text-sm text-slate-950 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>Fixture Oficial y Resultados Gran DT</span>
                  {selectedFechaTab === roundStatus.roundNumber && roundStatus.isRoundInPlay && (
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.2 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      En Disputa
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Resultados automáticos, minutos en tiempo real, goles y tarjetas rojas
                </p>
              </div>
            </div>

            {/* Selector de Fechas (Fecha 1 a 16 con scroll horizontal suave) */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full py-1">
              {availableFechas.map(fNum => {
                const isSelected = selectedFechaTab === fNum;
                const isCurrentActive = fNum === roundStatus.roundNumber;
                return (
                  <button
                    key={fNum}
                    onClick={() => setSelectedFechaTab(fNum)}
                    className={`px-2.5 py-1 rounded-md text-xs font-black transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Fecha {fNum}</span>
                    {isCurrentActive && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          roundStatus.isRoundInPlay ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                        }`}
                        title={roundStatus.isRoundInPlay ? 'Fecha en juego' : 'Fecha actual'}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtros de Partidos y Resumen */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
            {/* Buscador */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={fixtureSearchQuery}
                onChange={e => setFixtureSearchQuery(e.target.value)}
                placeholder="Buscar club, futbolista o estadio..."
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
              {fixtureSearchQuery && (
                <button
                  onClick={() => setFixtureSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Chips de Estado */}
            <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                <button
                  onClick={() => setFixtureStatusFilter('ALL')}
                  className={`px-2 py-0.5 rounded transition ${
                    fixtureStatusFilter === 'ALL'
                      ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-cyan-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Todos ({currentRoundFixturesWithState.length})
                </button>

                {roundSummaryStats.liveCount > 0 && (
                  <button
                    onClick={() => setFixtureStatusFilter('LIVE')}
                    className={`px-2 py-0.5 rounded transition flex items-center gap-1 ${
                      fixtureStatusFilter === 'LIVE'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                        : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                    <span>En Vivo ({roundSummaryStats.liveCount})</span>
                  </button>
                )}

                <button
                  onClick={() => setFixtureStatusFilter('FINISHED')}
                  className={`px-2 py-0.5 rounded transition ${
                    fixtureStatusFilter === 'FINISHED'
                      ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Jugados ({roundSummaryStats.finishedCount})
                </button>
                <button
                  onClick={() => setFixtureStatusFilter('SCHEDULED')}
                  className={`px-2 py-0.5 rounded transition ${
                    fixtureStatusFilter === 'SCHEDULED'
                      ? 'bg-white dark:bg-slate-700 text-blue-800 dark:text-blue-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Por Jugar ({currentRoundFixturesWithState.length - roundSummaryStats.finishedCount - roundSummaryStats.liveCount})
                </button>
              </div>

              {/* Conteo de Goles y Rojas */}
              {roundSummaryStats.totalGoals > 0 && (
                <div className="flex items-center gap-1.5 font-bold text-[11px] bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-800 dark:text-slate-200">⚽ {roundSummaryStats.totalGoals} goles</span>
                  {roundSummaryStats.totalReds > 0 && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-rose-600 dark:text-rose-400">🟥 {roundSummaryStats.totalReds} rojas</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Grilla de Tarjetas de Partidos Optimizada para que quepa Toda la Información */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredFixtures.map(({ fixture: f, dynamic }, mIdx) => {
              const isTargetNext = f.id === roundStatus.nextUpcomingMatch?.id;
              const hasVisibleEvents = dynamic.visibleEvents && dynamic.visibleEvents.length > 0;
              const homeEvents = (dynamic.visibleEvents || []).filter(e => e.team === 'home');
              const awayEvents = (dynamic.visibleEvents || []).filter(e => e.team === 'away');

              return (
                <div
                  key={`match-card-${f.id}-${mIdx}`}
                  id={`match-card-${f.id}`}
                  className={`p-2.5 rounded-xl border transition flex flex-col justify-between gap-2 ${
                    dynamic.isLive
                      ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-400/80 dark:border-amber-500/60 ring-1 ring-amber-400/50 shadow-xs'
                      : dynamic.isFinished
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                      : isTargetNext
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-[#1b55e2] dark:border-cyan-500/80 ring-1 ring-[#1b55e2]/60'
                      : 'bg-[#f8fafc] dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                  }`}
                >
                  {/* Encabezado: Estado, Minuto en Vivo y Horario */}
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1">
                      {dynamic.isLive ? (
                        <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-2xs animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 inline-block" />
                          EN VIVO • {dynamic.liveMinute}
                        </span>
                      ) : dynamic.isFinished ? (
                        <span className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-black px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider border border-emerald-300/60 dark:border-emerald-800/60">
                          FINALIZADO
                        </span>
                      ) : (
                        <span
                          className={`font-black uppercase px-1.5 py-0.2 rounded text-[9px] ${
                            isTargetNext
                              ? 'bg-[#1b55e2] text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isTargetNext ? 'PRÓXIMO' : `FECHA ${f.fecha}`}
                        </span>
                      )}

                      {f.isInterzonal && (
                        <span className="bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1 py-0.2 rounded text-[8px] font-black uppercase">
                          Interzonal
                        </span>
                      )}
                    </div>

                    <span className="font-mono font-bold text-slate-500 dark:text-slate-400 text-[10px]">
                      {f.displayTime}
                    </span>
                  </div>

                  {/* Marcador Central del Partido */}
                  <div className="bg-slate-100/90 dark:bg-slate-800/90 px-2 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-1.5">
                    {/* Club Local */}
                    <div
                      onClick={() => onSelectClub?.(f.homeTeam)}
                      className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition"
                      title={`Ver futbolistas de ${f.homeTeam}`}
                    >
                      <TeamBadge teamName={f.homeTeam} size="xs" showName={false} />
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                        {f.homeTeam}
                      </span>
                    </div>

                    {/* Caja de Marcador / VS */}
                    <div className="px-2 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 shrink-0 text-center min-w-[44px]">
                      {dynamic.isFinished || dynamic.isLive ? (
                        <div className="flex items-center justify-center gap-1 font-mono font-black text-sm text-slate-950 dark:text-white">
                          <span
                            className={
                              dynamic.homeScore! > dynamic.awayScore!
                                ? 'text-[#1b55e2] dark:text-cyan-400 font-extrabold'
                                : ''
                            }
                          >
                            {dynamic.homeScore}
                          </span>
                          <span className="text-slate-400 text-xs">-</span>
                          <span
                            className={
                              dynamic.awayScore! > dynamic.homeScore!
                                ? 'text-[#1b55e2] dark:text-cyan-400 font-extrabold'
                                : ''
                            }
                          >
                            {dynamic.awayScore}
                          </span>
                        </div>
                      ) : (
                        <span className="font-black text-slate-400 dark:text-slate-500 text-xs">vs</span>
                      )}
                    </div>

                    {/* Club Visitante */}
                    <div
                      onClick={() => onSelectClub?.(f.awayTeam)}
                      className="flex items-center gap-1.5 min-w-0 flex-1 justify-end cursor-pointer hover:opacity-80 transition"
                      title={`Ver futbolistas de ${f.awayTeam}`}
                    >
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate text-right">
                        {f.awayTeam}
                      </span>
                      <TeamBadge teamName={f.awayTeam} size="xs" showName={false} />
                    </div>
                  </div>

                  {/* EVENTOS COMPLETOS Y ELEGANTES: Todos los goles y rojas visibles sin cortes */}
                  {hasVisibleEvents && (
                    <div className="px-2 py-1.5 rounded-lg bg-slate-50/90 dark:bg-slate-950/80 text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 space-y-1">
                      {homeEvents.length > 0 && (
                        <div className="flex items-center flex-wrap gap-1 leading-tight">
                          <span className="font-black text-slate-900 dark:text-slate-100 text-[10px] shrink-0">
                            {f.homeTeam}:
                          </span>
                          {homeEvents.map((e, idx) => {
                            const isRed = e.type === 'red_card' || e.type === 'second_yellow';
                            return (
                              <span
                                key={`home-event-${f.id}-${e.id || idx}-${idx}`}
                                className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9.5px] font-semibold ${
                                  isRed
                                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900'
                                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800'
                                }`}
                              >
                                <span>{isRed ? '🟥' : '⚽'}</span>
                                <span className="font-mono">{e.minute}'</span>
                                <span>{e.playerName.split(' ').pop()}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {awayEvents.length > 0 && (
                        <div className="flex items-center flex-wrap gap-1 leading-tight">
                          <span className="font-black text-slate-900 dark:text-slate-100 text-[10px] shrink-0">
                            {f.awayTeam}:
                          </span>
                          {awayEvents.map((e, idx) => {
                            const isRed = e.type === 'red_card' || e.type === 'second_yellow';
                            return (
                              <span
                                key={`away-event-${f.id}-${e.id || idx}-${idx}`}
                                className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9.5px] font-semibold ${
                                  isRed
                                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900'
                                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800'
                                }`}
                              >
                                <span>{isRed ? '🟥' : '⚽'}</span>
                                <span className="font-mono">{e.minute}'</span>
                                <span>{e.playerName.split(' ').pop()}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pie de Estadio */}
                  {f.stadium && (
                    <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="truncate">📍 {f.stadium}</span>
                      {dynamic.isScheduled && (
                        <span className="font-bold text-blue-600 dark:text-cyan-400 shrink-0">Por jugarse</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredFixtures.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No se encontraron partidos con los filtros seleccionados.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
