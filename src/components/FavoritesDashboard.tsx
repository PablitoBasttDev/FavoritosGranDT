import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FavoritePlayer, Player } from '../types';
import { ALL_PLAYERS } from '../data/players';
import { TEAMS_DATA, getTeamData, getTeamFallbackBadge } from '../data/teams';
import { getTeamStanding, getTeamMatchInfo, STANDINGS_DATA } from '../data/standings';
import { normalizeText, playerMatchesQuery } from '../utils/textUtils';
import { TeamBadge } from './TeamBadge';
import { PositionBadge } from './PositionBadge';
import { CountdownBanner } from './CountdownBanner';
import {
  Search,
  Plus,
  Trash2,
  Share2,
  Star,
  Shield,
  X,
  Check,
  Edit3,
  Filter,
  LayoutGrid,
  Calendar,
  Sparkles,
  Trophy,
  ArrowRight,
  TrendingUp,
  ArrowUpDown,
  Home,
  Plane,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface FavoritesDashboardProps {
  favorites: FavoritePlayer[];
  onAddFavorite: (player: Player, notes?: string) => void;
  onRemoveFavorite: (playerId: number) => void;
  onUpdateNotes: (playerId: number, notes: string) => void;
  onToggleStar: (playerId: number) => void;
  onClearAll: () => void;
  onNavigateToDatabase: (clubName?: string) => void;
}

export const FavoritesDashboard: React.FC<FavoritesDashboardProps> = ({
  favorites,
  onAddFavorite,
  onRemoveFavorite,
  onUpdateNotes,
  onToggleStar,
  onClearAll,
  onNavigateToDatabase,
}) => {
  // Search & Selector State
  const [selectorSearch, setSelectorSearch] = useState('');
  const [selectorTeam, setSelectorTeam] = useState<string>('ALL');
  const [selectorPos, setSelectorPos] = useState<string>('ALL');
  const [candidateNote, setCandidateNote] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosFilter, setDropdownPosFilter] = useState<string>('ALL');

  // View mode: 'all_30_clubs' by default if no favorites, otherwise 'with_favorites'
  const [viewMode, setViewMode] = useState<'all_30_clubs' | 'with_favorites'>(() =>
    favorites.length === 0 ? 'all_30_clubs' : 'with_favorites'
  );

  // Filters & Sorting for Club Cards
  const [cardRoleFilter, setCardRoleFilter] = useState<'ALL' | 'LOCAL' | 'VISITANTE'>('ALL');
  const [cardDayFilter, setCardDayFilter] = useState<'ALL' | 'Viernes' | 'Sábado' | 'Domingo' | 'Lunes'>('ALL');
  const [cardZoneFilter, setCardZoneFilter] = useState<'ALL' | 'Zona A' | 'Zona B'>('ALL');
  const [cardSortBy, setCardSortBy] = useState<'table-pos' | 'name-asc' | 'name-desc' | 'points-desc'>('table-pos');

  // Reference to track favorite additions for automatic switching
  const prevFavCountRef = useRef(favorites.length);

  useEffect(() => {
    // When transitioning from 0 to 1+ favorites, switch to 'with_favorites' ("Solo mis clubes")
    if (prevFavCountRef.current === 0 && favorites.length > 0) {
      setViewMode('with_favorites');
    } else if (favorites.length === 0) {
      // If list was cleared and is now 0, show all 30 clubs
      setViewMode('all_30_clubs');
    }
    prevFavCountRef.current = favorites.length;
  }, [favorites.length]);

  // Modal / Quick picker for adding a player directly to a specific club
  const [clubPickerModal, setClubPickerModal] = useState<string | null>(null);
  const [clubPickerSearch, setClubPickerSearch] = useState('');
  const [clubPickerPos, setClubPickerPos] = useState<string>('ALL');

  // Copy notification
  const [copied, setCopied] = useState(false);

  // Note editing modal / popup state
  const [editingPlayer, setEditingPlayer] = useState<FavoritePlayer | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Warning confirmation modal for clearing the favorites list
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const favoriteIds = useMemo(() => new Set(favorites.map(f => f.id)), [favorites]);

  // Full candidate match list from 991 players without artificial slicing limits
  const allCandidateMatches = useMemo(() => {
    if (!selectorSearch.trim() && selectorTeam === 'ALL' && selectorPos === 'ALL') {
      return [];
    }

    return ALL_PLAYERS.filter(player => {
      if (selectorSearch.trim() && !playerMatchesQuery(player, selectorSearch)) {
        return false;
      }

      if (selectorTeam !== 'ALL' && player.equipo !== selectorTeam) {
        return false;
      }

      if (selectorPos !== 'ALL' && player.posicion !== selectorPos) {
        return false;
      }

      return true;
    });
  }, [selectorSearch, selectorTeam, selectorPos]);

  // Breakdown counts by position for search results
  const candidateCounts = useMemo(() => {
    return {
      ALL: allCandidateMatches.length,
      ARQ: allCandidateMatches.filter(p => p.posicion === 'ARQ').length,
      DEF: allCandidateMatches.filter(p => p.posicion === 'DEF').length,
      VOL: allCandidateMatches.filter(p => p.posicion === 'VOL').length,
      DEL: allCandidateMatches.filter(p => p.posicion === 'DEL').length,
    };
  }, [allCandidateMatches]);

  // Filter candidate results according to dropdown position chips
  const candidateResults = useMemo(() => {
    if (dropdownPosFilter === 'ALL') {
      return allCandidateMatches;
    }
    return allCandidateMatches.filter(p => p.posicion === dropdownPosFilter);
  }, [allCandidateMatches, dropdownPosFilter]);

  // Format currency in Argentine Pesos
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Group favorites by team dynamically
  const groupedFavorites = useMemo(() => {
    const groups: Record<string, FavoritePlayer[]> = {};

    favorites.forEach(player => {
      if (!groups[player.equipo]) {
        groups[player.equipo] = [];
      }
      groups[player.equipo].push(player);
    });

    return groups;
  }, [favorites]);

  // Filtered & Sorted List of clubs to display
  const clubsToDisplay = useMemo(() => {
    let list = Object.keys(TEAMS_DATA);

    // 1. Filter by viewMode (All vs with favorites)
    if (viewMode === 'with_favorites') {
      list = list.filter(teamName => (groupedFavorites[teamName] || []).length > 0);
    }

    // 2. Filter by Local / Visitante
    if (cardRoleFilter !== 'ALL') {
      list = list.filter(teamName => {
        const matchInfo = getTeamMatchInfo(teamName);
        if (!matchInfo) return false;
        return matchInfo.role === cardRoleFilter;
      });
    }

    // 3. Filter by Match Day of the week
    if (cardDayFilter !== 'ALL') {
      list = list.filter(teamName => {
        const matchInfo = getTeamMatchInfo(teamName);
        if (!matchInfo) return false;
        return matchInfo.dayOfWeek === cardDayFilter;
      });
    }

    // 4. Filter by Zone
    if (cardZoneFilter !== 'ALL') {
      list = list.filter(teamName => {
        const standing = getTeamStanding(teamName);
        return standing?.zone === cardZoneFilter;
      });
    }

    // 5. Sorting
    return list.sort((a, b) => {
      const standingA = getTeamStanding(a);
      const standingB = getTeamStanding(b);

      if (cardSortBy === 'table-pos') {
        const posA = standingA?.positionGeneral ?? 99;
        const posB = standingB?.positionGeneral ?? 99;
        return posA - posB;
      }
      if (cardSortBy === 'points-desc') {
        const ptsA = standingA?.points ?? 0;
        const ptsB = standingB?.points ?? 0;
        if (ptsB !== ptsA) return ptsB - ptsA;
        return (standingA?.positionGeneral ?? 99) - (standingB?.positionGeneral ?? 99);
      }
      if (cardSortBy === 'name-asc') {
        return a.localeCompare(b);
      }
      if (cardSortBy === 'name-desc') {
        return b.localeCompare(a);
      }
      return a.localeCompare(b);
    });
  }, [viewMode, groupedFavorites, cardRoleFilter, cardDayFilter, cardZoneFilter, cardSortBy]);

  const hasActiveCardFilters = cardRoleFilter !== 'ALL' || cardDayFilter !== 'ALL' || cardZoneFilter !== 'ALL' || cardSortBy !== 'table-pos';

  const resetCardFilters = () => {
    setCardRoleFilter('ALL');
    setCardDayFilter('ALL');
    setCardZoneFilter('ALL');
    setCardSortBy('table-pos');
  };

  // Copy structured list to clipboard
  const handleCopyList = () => {
    if (favorites.length === 0) return;

    let text = `📋 MIS FAVORITOS - GRAN DT CLAUSURA 2026\n`;
    text += `Total: ${favorites.length} jugadores seleccionados (${uniqueClubsCount} clubes)\n\n`;

    const sortedTeams = Object.keys(groupedFavorites).sort();
    sortedTeams.forEach(team => {
      const players = groupedFavorites[team];
      text += `⚽ ${team.toUpperCase()} (${players.length}):\n`;
      players.forEach(p => {
        text += `  • [${p.posicion}] ${p.nombre} - ${p.precio}${
          p.notes ? ` (${p.notes})` : ''
        }\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Quick Add handler from input
  const handleQuickAdd = (player: Player) => {
    onAddFavorite(player, candidateNote);
    setCandidateNote('');
    setSelectorSearch('');
    setIsDropdownOpen(false);
  };

  // Filter players for specific club in quick picker modal
  const clubModalPlayers = useMemo(() => {
    if (!clubPickerModal) return [];
    return ALL_PLAYERS.filter(p => {
      if (p.equipo !== clubPickerModal) return false;
      if (clubPickerPos !== 'ALL' && p.posicion !== clubPickerPos) return false;
      if (clubPickerSearch.trim()) {
        if (!playerMatchesQuery(p, clubPickerSearch)) return false;
      }
      return true;
    });
  }, [clubPickerModal, clubPickerPos, clubPickerSearch]);

  const totalFavoritesCount = favorites.length;
  const uniqueClubsCount = new Set(favorites.map(p => p.equipo)).size;

  const posCounts = {
    ARQ: favorites.filter(p => p.posicion === 'ARQ').length,
    DEF: favorites.filter(p => p.posicion === 'DEF').length,
    VOL: favorites.filter(p => p.posicion === 'VOL').length,
    DEL: favorites.filter(p => p.posicion === 'DEL').length,
  };

  return (
    <div className="w-full space-y-2.5 pb-6">
      {/* 1. DYNAMIC OFFICIAL COUNTDOWN BANNER */}
      <CountdownBanner onSelectClub={onNavigateToDatabase} />

      {/* 2. PURE WHITE SEARCH & CONTROL PANEL (Clean Gran DT Aesthetic) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-2.5 sm:p-3 transition">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Autocomplete Input */}
          <div className="relative flex-1" ref={dropdownRef}>
            <div className="flex items-center gap-2 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1b55e2] focus-within:border-transparent transition">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={selectorSearch}
                onChange={e => {
                  setSelectorSearch(e.target.value);
                  setIsDropdownOpen(true);
                  setDropdownPosFilter('ALL');
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Buscar jugador o club (ej. Sarmiento, Di María, Paredes, River)..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none font-medium"
              />

              {/* Club selector shortcut */}
              <select
                value={selectorTeam}
                onChange={e => {
                  setSelectorTeam(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="hidden sm:block text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="ALL">Todos los Clubes</option>
                {Object.keys(TEAMS_DATA)
                  .sort()
                  .map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>

              {/* Position selector shortcut */}
              <select
                value={selectorPos}
                onChange={e => {
                  setSelectorPos(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="hidden sm:block text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 outline-none cursor-pointer"
              >
                <option value="ALL">Posición</option>
                <option value="ARQ">ARQ</option>
                <option value="DEF">DEF</option>
                <option value="VOL">VOL</option>
                <option value="DEL">DEL</option>
              </select>

              {selectorSearch && (
                <button
                  onClick={() => {
                    setSelectorSearch('');
                    setDropdownPosFilter('ALL');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Results Box - Complete and with Position Filtering */}
            {isDropdownOpen && allCandidateMatches.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-96 flex flex-col overflow-hidden">
                {/* Header with Position Chips */}
                <div className="p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                  <span className="font-extrabold text-slate-700 dark:text-slate-200 text-[11px]">
                    {allCandidateMatches.length} futbolistas encontrados
                  </span>

                  {/* Position Filter Chips inside dropdown */}
                  <div className="flex items-center gap-1">
                    {(['ALL', 'ARQ', 'DEF', 'VOL', 'DEL'] as const).map(p => {
                      const count = candidateCounts[p];
                      if (count === 0 && p !== 'ALL') return null;
                      const isSelected = dropdownPosFilter === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setDropdownPosFilter(p)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black transition ${
                            isSelected
                              ? 'bg-[#1b55e2] text-white shadow-xs'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {p === 'ALL' ? 'Todos' : p} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable Results List */}
                <div className="overflow-y-auto max-h-80 divide-y divide-slate-100 dark:divide-slate-800 p-1">
                  {candidateResults.map(p => {
                    const isAlreadyFav = favoriteIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        className="p-2 hover:bg-blue-50/70 dark:hover:bg-slate-800/80 rounded-lg transition flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <PositionBadge position={p.posicion} size="sm" />
                          <TeamBadge teamName={p.equipo} size="sm" showName={false} />
                          <div className="truncate">
                            <span className="font-extrabold text-slate-900 dark:text-slate-100 block truncate">
                              {p.nombre}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {p.equipo}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            {p.precio}
                          </span>

                          <button
                            onClick={() => handleQuickAdd(p)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition shadow-xs ${
                              isAlreadyFav
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-[#1b55e2] hover:bg-[#1444b8] text-white'
                            }`}
                          >
                            {isAlreadyFav ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>En lista</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>+ Sumar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics & View Mode Switchers */}
          <div className="flex items-center flex-wrap gap-2 justify-between lg:justify-end shrink-0">
            {/* View Mode Toggle: All 30 vs Only with favorites */}
            <div className="flex items-center bg-[#f1f5f9] dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setViewMode('all_30_clubs')}
                id="tab-view-all-clubs"
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 text-[11px] ${
                  viewMode === 'all_30_clubs'
                    ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Ver todas las 30 tarjetas de clubes en pantalla"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Ver los 30 Clubes</span>
              </button>

              <button
                onClick={() => setViewMode('with_favorites')}
                id="tab-view-my-clubs"
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 text-[11px] ${
                  viewMode === 'with_favorites'
                    ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Mostrar solo clubes donde guardaste jugadores"
              >
                <Filter className="w-3 h-3" />
                <span>Solo mis clubes ({uniqueClubsCount})</span>
              </button>
            </div>

            {/* Copy & Clear Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyList}
                disabled={favorites.length === 0}
                className="px-3 py-1.5 rounded-lg bg-[#1b55e2] hover:bg-[#1444b8] disabled:opacity-40 text-white font-black text-xs flex items-center gap-1.5 transition shadow-xs"
                title="Copiar lista estructurada al portapapeles"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Copiar Lista'}</span>
              </button>

              <button
                onClick={() => setShowClearConfirmModal(true)}
                disabled={favorites.length === 0}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 text-slate-500 disabled:opacity-40 transition cursor-pointer"
                title="Limpiar todos los favoritos"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <span>
              <strong>{totalFavoritesCount}</strong> futbolistas seleccionados
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>
              <strong>{uniqueClubsCount}</strong> de 30 clubes con favoritos
            </span>
          </div>

          {/* Position counter badges */}
          <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
            <span className="px-1.5 py-0.5 rounded bg-[#facc15] text-[#713f12]">
              ARQ: {posCounts.ARQ}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#2563eb] text-white">
              DEF: {posCounts.DEF}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#16a34a] text-white">
              VOL: {posCounts.VOL}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#dc2626] text-white">
              DEL: {posCounts.DEL}
            </span>
          </div>
        </div>
      </div>

      {/* 2.5 CARD FILTERS & SORTING TOOLBAR (Local/Visitante, Día, Posición en Tabla, Nombre) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Filter Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Local vs Visitante filter pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCardRoleFilter('ALL')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                cardRoleFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({clubsToDisplay.length})
            </button>
            <button
              onClick={() => setCardRoleFilter('LOCAL')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                cardRoleFilter === 'LOCAL'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Equipos que juegan de local en la fecha"
            >
              <span>🏠</span>
              <span>Locales</span>
            </button>
            <button
              onClick={() => setCardRoleFilter('VISITANTE')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                cardRoleFilter === 'VISITANTE'
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Equipos que juegan de visitante en la fecha"
            >
              <span>✈️</span>
              <span>Visitantes</span>
            </button>
          </div>

          {/* Day of Week Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Día:</span>
            <select
              value={cardDayFilter}
              onChange={e => setCardDayFilter(e.target.value as any)}
              className="text-[11px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-blue-400 transition"
            >
              <option value="ALL">📅 Todos los días</option>
              <option value="Viernes">Viernes (4 clubes)</option>
              <option value="Sábado">Sábado (10 clubes)</option>
              <option value="Domingo">Domingo (10 clubes)</option>
              <option value="Lunes">Lunes (6 clubes)</option>
            </select>
          </div>

          {/* Zone Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500 hidden md:inline">Zona:</span>
            <select
              value={cardZoneFilter}
              onChange={e => setCardZoneFilter(e.target.value as any)}
              className="text-[11px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-blue-400 transition"
            >
              <option value="ALL">Todas las Zonas</option>
              <option value="Zona A">Zona A (15 clubes)</option>
              <option value="Zona B">Zona B (15 clubes)</option>
            </select>
          </div>
        </div>

        {/* Right: Sorting & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Ordenar:</span>
            <select
              value={cardSortBy}
              onChange={e => setCardSortBy(e.target.value as any)}
              className="text-[11px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-blue-400 transition"
            >
              <option value="table-pos">🏆 Posición en la Tabla (1º - 30º)</option>
              <option value="name-asc">🔤 Nombre (A - Z)</option>
              <option value="name-desc">🔤 Nombre (Z - A)</option>
              <option value="points-desc">📈 Puntos (Mayor a menor)</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveCardFilters && (
            <button
              onClick={resetCardFilters}
              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1 transition"
              title="Restablecer todos los filtros de tarjetas"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State Banner when in 'with_favorites' mode and 0 favorites */}
      {viewMode === 'with_favorites' && clubsToDisplay.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1b55e2] dark:text-cyan-400 mx-auto flex items-center justify-center">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Tu lista de scouting está vacía
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Podés buscar jugadores por nombre o club en el buscador superior, o explorar los 30 clubes de Primera División.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => setViewMode('all_30_clubs')}
              className="px-4 py-2 rounded-xl bg-[#1b55e2] hover:bg-[#1444b8] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Ver los 30 Clubes</span>
            </button>
            <button
              onClick={() => onNavigateToDatabase()}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              Explorar 991 Jugadores
            </button>
          </div>
        </div>
      )}

      {/* Empty State when filters yield 0 results */}
      {clubsToDisplay.length === 0 && (viewMode === 'all_30_clubs' || (viewMode === 'with_favorites' && favorites.length > 0)) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            Ningún club coincide con los filtros aplicados
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Probá cambiando la condición de localía, el día del partido o la zona seleccionada.
          </p>
          <div className="pt-1 flex justify-center">
            <button
              onClick={resetCardFilters}
              className="px-3.5 py-1.5 rounded-xl bg-[#1b55e2] hover:bg-[#1444b8] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Filtros</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. DENSE RESPONSIVE CLUB GRID WITH DYNAMIC ROW & COL SPANNING (Auto-Flow Dense) */}
      {clubsToDisplay.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 auto-rows-[240px] [grid-auto-flow:dense] gap-2 sm:gap-2.5">
          {clubsToDisplay.map(teamName => {
            const teamPlayers = groupedFavorites[teamName] || [];
            const count = teamPlayers.length;
            const teamMeta = getTeamData(teamName);
            const teamBadgeSrc = teamMeta?.escudoUrl || getTeamFallbackBadge(teamName);
            const primaryColor = teamMeta?.primaryColor || '#1b55e2';
            const shortName = teamMeta?.shortName || teamName.slice(0, 3).toUpperCase();
            const standing = getTeamStanding(teamName);
            const matchInfo = getTeamMatchInfo(teamName);

            // Dynamic card dimensions and watermark scaling according to player count:
            // 0-4 players: 1 col, 1 row (fixed 240px initial height)
            // 5-7 players: 1 col, 2 rows (vertical expansion without stretching neighboring cards)
            // 8+ players: 2 cols, 2 rows (prevents overly tall vertical towers, splits into 2 clean columns)
            let spanClass = 'col-span-1 row-span-1';
            let listClass = 'space-y-1';
            let watermarkSizeClass = 'w-36 h-36 sm:w-40 sm:h-40 -bottom-4 -right-4';

            if (count >= 5 && count <= 7) {
              spanClass = 'col-span-1 row-span-2';
              listClass = 'space-y-1';
              watermarkSizeClass = 'w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 -bottom-6 -right-6';
            } else if (count >= 8) {
              spanClass = 'col-span-1 sm:col-span-2 row-span-2';
              listClass = 'grid grid-cols-1 sm:grid-cols-2 gap-1 content-start';
              watermarkSizeClass = 'w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 -bottom-8 -right-8';
            }

            return (
              <div
                key={teamName}
                id={`team-card-${teamName.replace(/\s+/g, '-').toLowerCase()}`}
                className={`relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group h-full ${spanClass}`}
              >
                {/* Top Club Color Accent Bar */}
                <div
                  className="h-1.5 w-full relative z-10 shrink-0"
                  style={{ backgroundColor: primaryColor }}
                />

                {/* Dynamic Watermark Shield in Background (tilted 12deg, bottom-right corner, 50% opacity, scales with card size) */}
                <div
                  className={`absolute ${watermarkSizeClass} pointer-events-none select-none z-0 overflow-hidden flex items-end justify-end transition-all duration-300`}
                  aria-hidden="true"
                >
                  <img
                    src={teamBadgeSrc}
                    alt=""
                    className="w-full h-full object-contain transform rotate-12 origin-bottom-right"
                    style={{ opacity: 0.5 }}
                    loading="lazy"
                  />
                </div>

                {/* Team Card Header: Shield, Name, Standings (Posición, Puntos, Zona), +Sumar */}
                <div className="relative z-10 p-2 bg-slate-50/95 dark:bg-slate-800/90 backdrop-blur-xs border-b border-slate-100 dark:border-slate-800 shrink-0 space-y-1.5">
                  {/* Row 1: Badge, Name, Count, +Sumar */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TeamBadge teamName={teamName} size="sm" showName={false} />
                      <div className="min-w-0">
                        <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 truncate leading-tight">
                          {teamName}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block leading-none mt-0.5">
                          {teamPlayers.length > 0
                            ? `${teamPlayers.length} ${teamPlayers.length === 1 ? 'jugador guardado' : 'jugadores guardados'}`
                            : '0 guardados'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Add Player to this Club Button */}
                    <button
                      onClick={() => {
                        setClubPickerModal(teamName);
                        setClubPickerSearch('');
                        setClubPickerPos('ALL');
                      }}
                      className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-[#1b55e2] dark:text-cyan-300 text-[10px] font-black flex items-center gap-0.5 transition shrink-0 border border-blue-200/60 dark:border-blue-800/60 active:scale-95"
                      title={`Agregar futbolistas de ${teamName}`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Sumar</span>
                    </button>
                  </div>

                  {/* Row 2: Standings Info (Posición, Puntos, Zona) & Fixture Info */}
                  <div className="flex items-center justify-between gap-1 text-[10px] pt-1 border-t border-slate-200/70 dark:border-slate-700/70 flex-wrap">
                    <div className="flex items-center gap-1">
                      {/* Zone Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                          standing?.zone === 'Zona A'
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/60'
                            : 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-200/60 dark:border-indigo-800/60'
                        }`}
                      >
                        {standing?.zone || 'AFA'}
                      </span>

                      {/* Position in Table */}
                      <span
                        className="px-1.5 py-0.5 rounded font-black text-[9px] bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-slate-600"
                        title={`Posición general en la tabla del Clausura 2026: ${standing?.positionGeneral}º (${standing?.positionZone}º en ${standing?.zone})`}
                      >
                        #{standing?.positionGeneral || '-'}º
                      </span>

                      {/* Points */}
                      <span
                        className="px-1.5 py-0.5 rounded font-black text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-mono"
                        title={`${standing?.points || 0} puntos acumulados en 5 fechas disputadas`}
                      >
                        {standing?.points ?? '-'} pts
                      </span>
                    </div>

                    {/* Match Fixture Badge (Local/Visitante + Rival 3-letter Abbr + Día) */}
                    {matchInfo && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                          matchInfo.isHome
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200/70 dark:border-amber-800/70'
                            : 'bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 border border-purple-200/70 dark:border-purple-800/70'
                        }`}
                        title={`Fecha 6: ${matchInfo.role} vs ${matchInfo.rival} (${matchInfo.displayTime})`}
                      >
                        <span>{matchInfo.isHome ? '🏠' : '✈️'}</span>
                        <span className="font-semibold">{matchInfo.dayOfWeek.slice(0, 3)}</span>
                        <span className="font-mono font-black uppercase tracking-tight">vs {matchInfo.rivalShort}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Players List (High Density with dynamic list layout) */}
                <div className={`relative z-10 p-1.5 flex-1 ${listClass} min-h-[90px] overflow-y-auto`}>
                  {teamPlayers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-4 text-center">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        Sin jugadores guardados
                      </span>
                    </div>
                  ) : (
                    teamPlayers.map(player => (
                      <div
                        key={player.id}
                        className="group/item flex items-center justify-between gap-1 p-1 rounded-md bg-[#f8fafc]/85 dark:bg-slate-800/85 backdrop-blur-[1px] hover:bg-blue-50/90 dark:hover:bg-slate-800 transition text-xs border border-slate-100/90 dark:border-slate-800/90 shadow-2xs"
                      >
                        {/* Position Pill & Player Name */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <PositionBadge position={player.posicion} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <span
                                className={`font-bold text-[11px] truncate leading-tight ${
                                  player.star ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-slate-100'
                                }`}
                              >
                                {player.nombre}
                              </span>
                              {player.star && (
                                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block leading-none">
                              {player.precio}
                            </span>
                          </div>
                        </div>

                        {/* Actions: Notes, Star, Remove */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          {/* Note icon / edit */}
                          <button
                            onClick={() => {
                              setEditingPlayer(player);
                              setEditingNoteText(player.notes || '');
                            }}
                            className={`p-0.5 rounded text-[10px] ${
                              player.notes
                                ? 'text-[#1b55e2] dark:text-cyan-400 bg-blue-50 dark:bg-blue-950 font-bold'
                                : 'text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                            title={player.notes || 'Agregar nota táctica'}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          {/* Star toggle */}
                          <button
                            onClick={() => onToggleStar(player.id)}
                            className={`p-0.5 rounded text-[10px] ${
                              player.star
                                ? 'text-amber-500'
                                : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                            }`}
                            title="Marcar como prioridad"
                          >
                            <Star
                              className={`w-3 h-3 ${
                                player.star ? 'fill-amber-400 text-amber-500' : ''
                              }`}
                            />
                          </button>

                          {/* Remove button */}
                          <button
                            onClick={() => onRemoveFavorite(player.id)}
                            className="p-0.5 rounded text-slate-300 dark:text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                            title="Quitar de favoritos"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL: QUICK ROSTER PICKER FOR SPECIFIC CLUB */}
      {clubPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setClubPickerModal(null)}
          />

          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col z-10 overflow-hidden">
            {/* Modal Header with Club Identity */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TeamBadge teamName={clubPickerModal} size="md" showName={false} />
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                    Plantel de {clubPickerModal}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Seleccioná los futbolistas para tu lista
                  </p>
                </div>
              </div>

              <button
                onClick={() => setClubPickerModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Inside Modal */}
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1.5 bg-[#f1f5f9] dark:bg-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={clubPickerSearch}
                  onChange={e => setClubPickerSearch(e.target.value)}
                  placeholder={`Buscar en ${clubPickerModal}...`}
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center gap-1">
                {['ALL', 'ARQ', 'DEF', 'VOL', 'DEL'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => setClubPickerPos(pos)}
                    className={`px-2 py-1 rounded-md text-[10px] font-black transition ${
                      clubPickerPos === pos
                        ? 'bg-[#1b55e2] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Player list of this Club */}
            <div className="flex-1 overflow-y-auto p-2.5 divide-y divide-slate-100 dark:divide-slate-800 space-y-0.5">
              {clubModalPlayers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No se encontraron futbolistas con ese filtro.
                </div>
              ) : (
                clubModalPlayers.map(p => {
                  const isFav = favoriteIds.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className="py-1.5 px-2 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 rounded-lg flex items-center justify-between gap-3 text-xs transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <PositionBadge position={p.posicion} size="sm" />
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 truncate">
                          {p.nombre}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {p.precio}
                        </span>

                        <button
                          onClick={() => {
                            if (isFav) {
                              onRemoveFavorite(p.id);
                            } else {
                              onAddFavorite(p);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                            isFav
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                              : 'bg-[#1b55e2] hover:bg-[#1444b8] text-white shadow-xs'
                          }`}
                        >
                          {isFav ? (
                            <>
                              <X className="w-3 h-3" />
                              <span>Quitar</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Sumar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">
                {clubModalPlayers.length} jugadores en este club
              </span>
              <button
                onClick={() => setClubPickerModal(null)}
                className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg font-bold"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: EDIT SCOUTING NOTE */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setEditingPlayer(null)}
          />

          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md p-4 z-10 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <PositionBadge position={editingPlayer.posicion} size="sm" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Nota táctica: {editingPlayer.nombre}
                </h3>
              </div>
              <button
                onClick={() => setEditingPlayer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anotá si patea penales, tiros libres, promedios o información clave de Gran DT:
            </p>

            <textarea
              rows={3}
              value={editingNoteText}
              onChange={e => setEditingNoteText(e.target.value)}
              placeholder="Ej. Patea penales, gran pegada de tiro libre, titular indiscutido..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#1b55e2]"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setEditingPlayer(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onUpdateNotes(editingPlayer.id, editingNoteText);
                  setEditingPlayer(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-black bg-[#1b55e2] hover:bg-[#1444b8] text-white transition shadow-sm"
              >
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: CONFIRMATION WARNING FOR CLEARING FAVORITES LIST */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs"
            onClick={() => setShowClearConfirmModal(false)}
          />

          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-rose-200/80 dark:border-rose-900/80 shadow-2xl w-full max-w-md p-5 z-10 space-y-4">
            {/* Header with Alert Icon */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100 leading-tight">
                  ¿Vaciar toda tu lista de favoritos?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Estás a punto de borrar los <strong className="text-rose-600 dark:text-rose-400 font-bold">{favorites.length} futbolistas</strong> que guardaste en tus <strong className="text-slate-700 dark:text-slate-300 font-bold">{uniqueClubsCount} clubes</strong>. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            {/* Position Summary Pill Row */}
            <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50 space-y-1.5">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">
                Jugadores que se eliminarán:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded bg-[#facc15] text-[#713f12]">
                  ARQ: {posCounts.ARQ}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#2563eb] text-white">
                  DEF: {posCounts.DEF}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#16a34a] text-white">
                  VOL: {posCounts.VOL}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#dc2626] text-white">
                  DEL: {posCounts.DEL}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 active:scale-95 text-white transition shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, vaciar lista</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
