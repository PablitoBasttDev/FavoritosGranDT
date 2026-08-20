import React, { useState } from 'react';
import { ALL_PLAYERS } from '../data/players';
import { TEAMS_DATA } from '../data/teams';
import { RAW_STANDINGS_DATA, STANDINGS_DATA, TeamStanding } from '../data/standings';
import { TeamBadge } from './TeamBadge';
import { PositionBadge } from './PositionBadge';
import { Trophy, Sparkles, PieChart, BarChart3, TrendingUp, Award, ArrowUpRight, Table } from 'lucide-react';
import { Player } from '../types';

interface StatsDashboardProps {
  onSelectPlayer?: (player: Player) => void;
  onSelectClub?: (club: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onSelectClub }) => {
  const [standingsZone, setStandingsZone] = useState<'Zona A' | 'Zona B' | 'GENERAL'>('Zona A');
  // Top 10 most expensive players
  const top10Valuable = [...ALL_PLAYERS]
    .sort((a, b) => b.precioNum - a.precioNum)
    .slice(0, 10);

  // Bargains under $800.000
  const topBargains = [...ALL_PLAYERS]
    .filter(p => p.precioNum <= 800000 && p.precioNum >= 400000)
    .slice(0, 8);

  // Position breakdown
  const positionStats = {
    ARQ: ALL_PLAYERS.filter(p => p.posicion === 'ARQ'),
    DEF: ALL_PLAYERS.filter(p => p.posicion === 'DEF'),
    VOL: ALL_PLAYERS.filter(p => p.posicion === 'VOL'),
    DEL: ALL_PLAYERS.filter(p => p.posicion === 'DEL'),
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Official Gran DT Blue Header Banner */}
      <div className="bg-gradient-to-r from-[#07245c] via-[#0e3f9a] to-[#082b6c] text-white rounded-xl shadow-xs p-4 sm:p-5 border border-blue-900/50">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-cyan-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
            Inteligencia & Scouting
          </span>
          <span className="text-xs text-blue-200 font-bold uppercase tracking-wide">
            Métricas de Mercado
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
          Centro de Estadísticas y Cotizaciones
        </h2>
        <p className="text-blue-100/80 text-xs max-w-xl mt-0.5">
          Distribución de precios, valores de mercado del Torneo Clausura 2026 y joyas económicas para tu equipo.
        </p>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase block tracking-wider">
            Total Futbolistas
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-100 mt-0.5">
            {ALL_PLAYERS.length}
          </p>
          <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-extrabold">
            En los 30 clubes de Primera
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase block tracking-wider">
            Clubes Oficiales
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-100 mt-0.5">
            {Object.keys(TEAMS_DATA).length}
          </p>
          <span className="text-[11px] text-[#1b55e2] dark:text-cyan-400 font-extrabold">
            Con escudos vectoriales SVG
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase block tracking-wider">
            Cotización Máxima
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-100 mt-0.5 font-mono">
            $7.000.000
          </p>
          <span className="text-[11px] text-amber-800 dark:text-amber-400 font-extrabold">
            Di María & Almada
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-800 shadow-xs">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase block tracking-wider">
            Cotización Mínima
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-100 mt-0.5 font-mono">
            $300.000
          </p>
          <span className="text-[11px] text-cyan-800 dark:text-cyan-400 font-extrabold">
            Juveniles y alternativas
          </span>
        </div>
      </div>

      {/* Position Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-4">
        <h3 className="text-xs font-black uppercase text-slate-950 dark:text-slate-100 tracking-wider mb-3">
          Distribución de Jugadores por Posición
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(['ARQ', 'DEF', 'VOL', 'DEL'] as const).map(pos => {
            const list = positionStats[pos];
            const avg = list.reduce((a, b) => a + b.precioNum, 0) / (list.length || 1);

            return (
              <div
                key={pos}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <PositionBadge position={pos} size="md" />
                  <div>
                    <span className="font-black text-xs text-slate-950 dark:text-slate-100 block">
                      {pos === 'ARQ'
                        ? 'Arqueros'
                        : pos === 'DEF'
                        ? 'Defensores'
                        : pos === 'VOL'
                        ? 'Volantes'
                        : 'Delanteros'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                      Promedio: {formatMoney(avg)}
                    </span>
                  </div>
                </div>
                <span className="text-base font-black font-mono text-slate-900 dark:text-slate-200">
                  {list.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Top Expensive vs Top Value Bargains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Top 10 Most Expensive */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-3.5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Top 10 Jugadores Más Valiosos
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Clausura 2026</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-0.5">
            {top10Valuable.map((p, idx) => (
              <div
                key={p.id}
                className="py-1.5 px-2 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-slate-400 w-4 text-[11px]">
                    #{idx + 1}
                  </span>
                  <TeamBadge teamName={p.equipo} size="xs" showName={false} />
                  <div className="min-w-0 truncate">
                    <span className="font-black text-slate-900 dark:text-slate-100 block truncate">
                      {p.nombre}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">{p.equipo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PositionBadge position={p.posicion} size="sm" />
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs">
                    {p.precio}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Bargains */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-3.5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Joyas Económicas para Completar Plantel
              </h3>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">
              Hasta $800.000
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-0.5">
            {topBargains.map(p => (
              <div
                key={p.id}
                className="py-1.5 px-2 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <TeamBadge teamName={p.equipo} size="xs" showName={false} />
                  <div className="min-w-0 truncate">
                    <span className="font-black text-slate-900 dark:text-slate-100 block truncate">
                      {p.nombre}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">{p.equipo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PositionBadge position={p.posicion} size="sm" />
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs">
                    {p.precio}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Standings Table (Torneo Clausura 2026 - Fecha 5 disputada) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#1b55e2] dark:text-cyan-400" />
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-950 dark:text-slate-100">
              Tabla Oficial de Posiciones - Torneo Clausura 2026
            </h3>
          </div>

          {/* Zone Selector Pills */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setStandingsZone('Zona A')}
              className={`px-3 py-1 rounded-md text-[11px] font-black transition ${
                standingsZone === 'Zona A'
                  ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              Zona A (15)
            </button>
            <button
              onClick={() => setStandingsZone('Zona B')}
              className={`px-3 py-1 rounded-md text-[11px] font-black transition ${
                standingsZone === 'Zona B'
                  ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              Zona B (15)
            </button>
            <button
              onClick={() => setStandingsZone('GENERAL')}
              className={`px-3 py-1 rounded-md text-[11px] font-black transition ${
                standingsZone === 'GENERAL'
                  ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              General (30)
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-black bg-slate-100 dark:bg-slate-800/40">
                <th className="py-2 px-2 text-center w-8">#</th>
                <th className="py-2 px-2">Equipo</th>
                <th className="py-2 px-2 text-center font-black text-slate-900 dark:text-slate-200">PTS</th>
                <th className="py-2 px-2 text-center">PJ</th>
                <th className="py-2 px-2 text-center">G</th>
                <th className="py-2 px-2 text-center">E</th>
                <th className="py-2 px-2 text-center">P</th>
                <th className="py-2 px-2 text-center">GF</th>
                <th className="py-2 px-2 text-center">GC</th>
                <th className="py-2 px-2 text-center">DIF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.values(STANDINGS_DATA)
                .filter(t => (standingsZone === 'GENERAL' ? true : t.zone === standingsZone))
                .sort((a, b) => {
                  if (standingsZone === 'GENERAL') {
                    return a.positionGeneral - b.positionGeneral;
                  }
                  return a.positionZone - b.positionZone;
                })
                .map(team => {
                  const pos = standingsZone === 'GENERAL' ? team.positionGeneral : team.positionZone;
                  const isTop8 = pos <= 8;

                  return (
                    <tr
                      key={team.teamName}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer"
                      onClick={() => onSelectClub?.(team.teamName)}
                      title={`Ver plantel de ${team.teamName}`}
                    >
                      <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-500">
                        <span
                          className={`inline-block w-5 h-5 leading-5 rounded-full text-[10px] ${
                            pos <= 4
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black'
                              : isTop8
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {pos}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <TeamBadge teamName={team.teamName} size="xs" showName={false} />
                          <span className="truncate">{team.teamName}</span>
                          {standingsZone === 'GENERAL' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                              {team.zone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-black text-[#1b55e2] dark:text-cyan-400 bg-blue-50/40 dark:bg-blue-950/20">
                        {team.points}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono text-slate-600 dark:text-slate-400">{team.played}</td>
                      <td className="py-1.5 px-2 text-center font-mono text-slate-600 dark:text-slate-400">{team.won}</td>
                      <td className="py-1.5 px-2 text-center font-mono text-slate-600 dark:text-slate-400">{team.drawn}</td>
                      <td className="py-1.5 px-2 text-center font-mono text-slate-600 dark:text-slate-400">{team.lost}</td>
                      <td className="py-1.5 px-2 text-center font-mono text-slate-600 dark:text-slate-400">{team.goalsFor}</td>
                      <td className="py-1.5 px-2 text-center font-mono text-slate-600 dark:text-slate-400">{team.goalsAgainst}</td>
                      <td className={`py-1.5 px-2 text-center font-mono font-bold ${team.goalDiff > 0 ? 'text-emerald-600' : team.goalDiff < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                        {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-400 text-right">
          * Clasifican a Octavos de Final los primeros 8 de cada zona.
        </p>
      </div>
    </div>
  );
};
