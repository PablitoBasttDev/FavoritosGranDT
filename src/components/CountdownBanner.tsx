import React, { useState, useEffect } from 'react';
import { FIXTURES_DATA, getNextUpcomingMatch, MatchFixture } from '../data/fixture';
import { TeamBadge } from './TeamBadge';
import { Calendar, Clock, ChevronDown, ChevronUp, Trophy, ArrowRight, Shield } from 'lucide-react';

interface CountdownBannerProps {
  onSelectClub?: (clubName: string) => void;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({ onSelectClub }) => {
  const [now, setNow] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { match: nextMatch, timeRemainingMs } = getNextUpcomingMatch(now);

  // Calculate days, hours, minutes, seconds
  const totalSeconds = Math.max(0, Math.floor(timeRemainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="w-full">
      {/* 1. Official Gran DT Blue Header Banner */}
      <div className="w-full bg-gradient-to-r from-[#07245c] via-[#0e3f9a] to-[#082b6c] dark:from-[#051636] dark:via-[#0a2760] dark:to-[#05183d] text-white rounded-xl shadow-sm px-3 sm:px-5 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 border border-blue-900/50 dark:border-blue-800/40 transition">
        {/* Left: Dynamic Match Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center sm:justify-start text-center sm:text-left">
          <div className="flex items-center gap-1.5 bg-blue-950/80 dark:bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
              FECHA {nextMatch.fecha}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-100 font-extrabold uppercase tracking-tight">
              FALTA PARA EL PRIMER PARTIDO:
            </span>
          </div>

          {/* Dynamic Live Ticking Clock Display (Days:Hours:Minutes:Seconds) */}
          <div className="flex items-center gap-1 font-mono font-black text-sm sm:text-base text-cyan-300 bg-blue-950/90 dark:bg-slate-950/90 px-2 py-0.5 rounded-lg border border-cyan-400/50 shadow-inner">
            <div className="flex flex-col items-center">
              <span>{pad(days)}</span>
              <span className="text-[8px] font-sans font-bold text-blue-200 leading-none">DÍAS</span>
            </div>
            <span className="text-cyan-400 font-bold mb-1">:</span>
            <div className="flex flex-col items-center">
              <span>{pad(hours)}</span>
              <span className="text-[8px] font-sans font-bold text-blue-200 leading-none">HS</span>
            </div>
            <span className="text-cyan-400 font-bold mb-1">:</span>
            <div className="flex flex-col items-center">
              <span>{pad(minutes)}</span>
              <span className="text-[8px] font-sans font-bold text-blue-200 leading-none">MIN</span>
            </div>
            <span className="text-cyan-400 font-bold mb-1">:</span>
            <div className="flex flex-col items-center">
              <span className="text-amber-300">{pad(seconds)}</span>
              <span className="text-[8px] font-sans font-bold text-amber-200 leading-none">SEG</span>
            </div>
          </div>
        </div>

        {/* Right: Next Match Title & Fixture Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          <div className="flex items-center gap-2 bg-blue-900/60 dark:bg-slate-900/80 hover:bg-blue-900/80 dark:hover:bg-slate-900 px-2.5 py-1 rounded-lg border border-blue-700/50 dark:border-slate-700 text-xs">
            <TeamBadge teamName={nextMatch.homeTeam} size="xs" />
            <span className="font-bold text-white text-[11px]">{nextMatch.homeTeam}</span>
            <span className="text-cyan-300 font-black text-[10px]">vs</span>
            <span className="font-bold text-white text-[11px]">{nextMatch.awayTeam}</span>
            <TeamBadge teamName={nextMatch.awayTeam} size="xs" />
            <span className="text-[10px] text-blue-200 font-medium ml-1 hidden lg:inline">
              ({nextMatch.displayTime})
            </span>
          </div>

          <button
            onClick={() => setShowScheduleModal(!showScheduleModal)}
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#0d3b8c] dark:text-cyan-300 font-black text-xs px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1 whitespace-nowrap border border-transparent dark:border-slate-700 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Ver Fixture Completo</span>
            {showScheduleModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Fixture Accordion / Dropdown */}
      {showScheduleModal && (
        <div className="mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-3 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1b55e2] dark:text-cyan-400" />
              <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                Fixture Oficial Torneo Clausura 2026 (AFA)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Horarios de Argentina (UTC-3)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
            {FIXTURES_DATA.map(f => {
              const isTargetNext = f.id === nextMatch.id;
              return (
                <div
                  key={f.id}
                  className={`p-2.5 rounded-xl border transition flex flex-col justify-between gap-1.5 ${
                    isTargetNext
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#1b55e2] dark:border-cyan-500 ring-1 ring-[#1b55e2] dark:ring-cyan-500'
                      : 'bg-[#f8fafc] dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-black uppercase px-1.5 py-0.5 rounded ${
                      isTargetNext
                        ? 'bg-[#1b55e2] dark:bg-cyan-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}>
                      Fecha {f.fecha} {f.isInterzonal ? '• Interzonal' : ''}
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{f.displayTime}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 my-1">
                    <div
                      onClick={() => onSelectClub && onSelectClub(f.homeTeam)}
                      className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:opacity-80 transition"
                    >
                      <TeamBadge teamName={f.homeTeam} size="sm" />
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                        {f.homeTeam}
                      </span>
                    </div>

                    <span className="font-black text-slate-400 dark:text-slate-500 text-xs shrink-0">vs</span>

                    <div
                      onClick={() => onSelectClub && onSelectClub(f.awayTeam)}
                      className="flex items-center gap-1.5 min-w-0 justify-end cursor-pointer hover:opacity-80 transition"
                    >
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate text-right">
                        {f.awayTeam}
                      </span>
                      <TeamBadge teamName={f.awayTeam} size="sm" />
                    </div>
                  </div>

                  {f.stadium && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                      📍 {f.stadium}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
