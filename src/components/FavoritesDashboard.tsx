import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FavoritePlayer, Player } from '../types.js';
import { ALL_PLAYERS } from '../data/players.js';
import { TEAMS_DATA, getTeamData, getTeamFallbackBadge } from '../data/teams.js';
import { getTeamStanding, getTeamMatchInfo, STANDINGS_DATA, TeamStanding } from '../data/standings.js';
import { normalizeText, playerMatchesQuery } from '../utils/textUtils.js';
import { TeamBadge } from './TeamBadge.js';
import { PositionBadge } from './PositionBadge.js';
import { PlayerStatusBadge } from './PlayerStatusBadge.js';
import { SHEET_TEAM_MAP } from '../services/sheetsService.js';
import { isSamePlayer, generateDeterministicPlayerId } from '../utils/playerIdentity.js';
import { CountdownBanner } from './CountdownBanner.js';
import { PlayerTraitsDetail } from './PlayerTraitsDetail.js';
import { usePromiedosStandings } from '../services/promiedosService.js';
import {
  Search,
  Plus,
  Trash2,
  Share2,
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
  ChevronDown,
  ChevronUp,
  Cloud,
} from 'lucide-react';
import { UserProfile } from '../types';
import { CloudSyncModal } from './CloudSyncModal';

interface FavoritesDashboardProps {
  favorites: FavoritePlayer[];
  players?: Player[];
  onAddFavorite: (player: Player, notes?: string) => void;
  onRemoveFavorite: (playerOrId: number | Player, playerName?: string, playerTeam?: string) => void;
  onUpdateNotes: (playerId: number, notes: string, playerName?: string) => void;
  onClearAll: () => void;
  onNavigateToDatabase: (clubName?: string) => void;
  activeUser?: UserProfile | null;
  onFavoritesUpdated?: (newFavorites: FavoritePlayer[]) => void;
  showToast?: (msg: string) => void;
}

export const FavoritesDashboard: React.FC<FavoritesDashboardProps> = ({
  favorites,
  players,
  onAddFavorite,
  onRemoveFavorite,
  onUpdateNotes,
  onClearAll,
  onNavigateToDatabase,
  activeUser = null,
  onFavoritesUpdated,
  showToast = () => {},
}) => {
  const activePlayers = useMemo(() => {
    return players && players.length > 0 ? players : ALL_PLAYERS;
  }, [players]);

  // Search & Selector State
  const [selectorSearch, setSelectorSearch] = useState('');
  const [selectorTeam, setSelectorTeam] = useState<string>('ALL');
  const [selectorPos, setSelectorPos] = useState<string>('ALL');
  const [candidateNote, setCandidateNote] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosFilter, setDropdownPosFilter] = useState<string>('ALL');
  const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);

  // Live standings data directly from Promiedos API
  const { standings: liveStandingsData } = usePromiedosStandings();

  const liveStandingsMap = useMemo(() => {
    const map: Record<string, TeamStanding> = {};
    if (liveStandingsData?.general && liveStandingsData.general.length > 0) {
      liveStandingsData.general.forEach(t => {
        const canonical = SHEET_TEAM_MAP[t.teamName] || t.teamName;
        map[canonical] = t;
        map[t.teamName] = t;
      });
    }
    return map;
  }, [liveStandingsData]);

  const getLiveTeamStanding = (teamName: string): TeamStanding | undefined => {
    const canonical = SHEET_TEAM_MAP[teamName] || teamName;
    return liveStandingsMap[canonical] || liveStandingsMap[teamName] || getTeamStanding(teamName);
  };

  // View mode: 'all_30_clubs' by default so all club cards are visible immediately
  const [viewMode, setViewMode] = useState<'all_30_clubs' | 'with_favorites'>('all_30_clubs');

  // Filters & Sorting for Club Cards
  const [cardRoleFilter, setCardRoleFilter] = useState<'ALL' | 'LOCAL' | 'VISITANTE'>('ALL');
  const [cardDayFilter, setCardDayFilter] = useState<'ALL' | 'Viernes' | 'Sábado' | 'Domingo' | 'Lunes'>('ALL');
  const [cardZoneFilter, setCardZoneFilter] = useState<'ALL' | 'Zona A' | 'Zona B'>('ALL');
  const [cardSortBy, setCardSortBy] = useState<'table-pos' | 'name-asc' | 'name-desc' | 'points-desc'>('table-pos');

  // Modal / Quick picker for adding a player directly to a specific club
  const [clubPickerModal, setClubPickerModal] = useState<string | null>(null);
  const [clubPickerSearch, setClubPickerSearch] = useState('');
  const [clubPickerPos, setClubPickerPos] = useState<string>('ALL');

  // Unavailable / Suspended / Injured players inside user's favorites
  const unavailableFavorites = useMemo(() => {
    return favorites.filter(f => !!f.statusInfo);
  }, [favorites]);

  // Copy notification
  const [copied, setCopied] = useState(false);

  // Note editing modal / popup state
  const [editingPlayer, setEditingPlayer] = useState<FavoritePlayer | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Expand player traits & details accordion
  const [expandedPlayerId, setExpandedPlayerId] = useState<number | null>(null);

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

  const favoriteIds = useMemo(() => {
    const ids = new Set<number>();
    favorites.forEach(f => {
      if (f.id) ids.add(f.id);
      const detId = generateDeterministicPlayerId(f.nombre, f.equipo, f.posicion);
      ids.add(detId);
    });
    return ids;
  }, [favorites]);

  const isFavoritePlayer = (p: Player) => {
    return favoriteIds.has(p.id) || favorites.some(f => isSamePlayer(f, p));
  };

  // Full candidate match list from all players without artificial slicing limits
  const allCandidateMatches = useMemo(() => {
    if (!selectorSearch.trim() && selectorTeam === 'ALL' && selectorPos === 'ALL') {
      return [];
    }

    return activePlayers.filter(player => {
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
  }, [selectorSearch, selectorTeam, selectorPos, activePlayers]);

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
      const canonicalTeam = SHEET_TEAM_MAP[player.equipo] || player.equipo;
      if (!groups[canonicalTeam]) {
        groups[canonicalTeam] = [];
      }
      groups[canonicalTeam].push(player);
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
        const standing = getLiveTeamStanding(teamName);
        return standing?.zone === cardZoneFilter;
      });
    }

    // 5. Sorting (Prioritize teams with favorites at the top)
    return list.sort((a, b) => {
      const countA = (groupedFavorites[a] || []).length > 0 ? 1 : 0;
      const countB = (groupedFavorites[b] || []).length > 0 ? 1 : 0;
      if (countA !== countB) {
        return countB - countA; // Teams with favorites first
      }

      const standingA = getLiveTeamStanding(a);
      const standingB = getLiveTeamStanding(b);

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
  }, [viewMode, groupedFavorites, cardRoleFilter, cardDayFilter, cardZoneFilter, cardSortBy, liveStandingsMap]);

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
    return activePlayers.filter(p => {
      if (p.equipo !== clubPickerModal) return false;
      if (clubPickerPos !== 'ALL' && p.posicion !== clubPickerPos) return false;
      if (clubPickerSearch.trim()) {
        if (!playerMatchesQuery(p, clubPickerSearch)) return false;
      }
      return true;
    });
  }, [clubPickerModal, clubPickerPos, clubPickerSearch, activePlayers]);

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
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl shadow-xs border border-slate-300/90 dark:border-slate-800 p-1 sm:p-2.5 transition">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-1 sm:gap-2">
          {/* Autocomplete Input */}
          <div className="relative flex-1" ref={dropdownRef}>
            <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 sm:py-1 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-1 focus-within:ring-[#1b55e2] dark:focus-within:ring-cyan-500 focus-within:border-transparent transition">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="text"
                value={selectorSearch}
                onChange={e => {
                  setSelectorSearch(e.target.value);
                  setIsDropdownOpen(true);
                  setDropdownPosFilter('ALL');
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Buscar jugador o club (ej. Paredes, River)..."
                className="w-full bg-transparent text-[11px] sm:text-xs text-slate-950 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none font-medium"
              />

              {/* Club selector shortcut */}
              <select
                value={selectorTeam}
                onChange={e => {
                  setSelectorTeam(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="hidden sm:block text-[10px] sm:text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="ALL">Clubes</option>
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
                className="hidden sm:block text-[10px] sm:text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 outline-none cursor-pointer"
              >
                <option value="ALL">Pos</option>
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
                <div className="p-1.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-1 text-xs">
                  <span className="font-extrabold text-slate-700 dark:text-slate-200 text-[10px]">
                    {allCandidateMatches.length} futbolistas
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
                          className={`px-1.5 py-0.2 rounded text-[9.5px] font-black transition ${
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
                  {candidateResults.map((p, idx) => {
                    const isAlreadyFav = isFavoritePlayer(p);
                    return (
                      <div
                        key={`cand-player-${p.id}-${idx}`}
                        className="p-1.5 hover:bg-blue-50/70 dark:hover:bg-slate-800/80 rounded-lg transition flex items-center justify-between gap-1 sm:gap-2 text-xs"
                      >
                        {/* Player details - Maximized space for player name */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1">
                          <PositionBadge position={p.posicion} size="xs" />
                          <TeamBadge teamName={p.equipo} size="xs" showName={false} />
                          <div className="min-w-0 flex-1">
                            <span
                              className="font-black text-slate-950 dark:text-slate-100 block truncate text-xs sm:text-[13px] leading-tight"
                              title={p.nombre}
                            >
                              {p.nombre}
                            </span>
                            <span className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate block leading-none mt-0.5">
                              {p.equipo}
                            </span>
                          </div>
                        </div>

                        {/* Metrics and Action Button */}
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                          {typeof p.promedio === 'number' && p.promedio > 0 ? (
                            <span
                              title={`Promedio: ${p.promedio.toFixed(2)} pts`}
                              className="font-mono text-[9.5px] sm:text-[10px] font-black text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-1 sm:px-1.5 py-0.5 rounded leading-none whitespace-nowrap"
                            >
                              {p.promedio.toFixed(2)}
                            </span>
                          ) : null}

                          <span className="font-mono font-black text-emerald-800 dark:text-emerald-400 text-[10px] sm:text-[11px] whitespace-nowrap">
                            <span className="hidden sm:inline">{p.precio}</span>
                            <span className="sm:hidden">${(p.precioNum / 1000000).toFixed(1)}M</span>
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isAlreadyFav) {
                                onRemoveFavorite(p, p.nombre, p.equipo);
                              } else {
                                handleQuickAdd(p);
                              }
                            }}
                            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[9.5px] sm:text-[10.5px] font-black flex items-center gap-0.5 transition shadow-2xs shrink-0 active:scale-95 cursor-pointer ${
                              isAlreadyFav
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-[#1b55e2] hover:bg-[#1444b8] text-white'
                            }`}
                            title={isAlreadyFav ? 'Quitar de favoritos' : 'Sumar a favoritos'}
                          >
                            {isAlreadyFav ? (
                              <>
                                <X className="w-3 h-3 text-rose-600 dark:text-rose-400" />
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
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics & View Mode Switchers */}
          <div className="flex items-center flex-wrap gap-1 justify-between lg:justify-end shrink-0">
            {/* View Mode Toggle: All 30 vs Only with favorites */}
            <div className="flex items-center bg-[#f1f5f9] dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setViewMode('all_30_clubs')}
                id="tab-view-all-clubs"
                className={`px-2 py-0.5 rounded transition flex items-center gap-1 text-[10px] sm:text-[11px] ${
                  viewMode === 'all_30_clubs'
                    ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Ver todas las 30 tarjetas de clubes en pantalla"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>30 Clubes</span>
              </button>

              <button
                onClick={() => setViewMode('with_favorites')}
                id="tab-view-my-clubs"
                className={`px-2 py-0.5 rounded transition flex items-center gap-1 text-[10px] sm:text-[11px] ${
                  viewMode === 'with_favorites'
                    ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Mostrar solo clubes donde guardaste jugadores"
              >
                <Filter className="w-3 h-3" />
                <span>Mis clubes ({uniqueClubsCount})</span>
              </button>
            </div>

            {/* Copy, Cloud & Clear Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCloudSyncModal(true)}
                id="btn-cloud-sync-modal"
                className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#1b55e2] dark:text-cyan-300 font-bold text-[10px] sm:text-xs flex items-center gap-1 transition border border-blue-200/80 dark:border-blue-900/80 cursor-pointer"
                title="Sincronizar con Firestore"
              >
                <Cloud className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                <span className="hidden sm:inline">Nube</span>
              </button>

              <button
                onClick={handleCopyList}
                disabled={favorites.length === 0}
                className="px-2.5 py-0.5 rounded-lg bg-[#1b55e2] hover:bg-[#1444b8] disabled:opacity-40 text-white font-bold text-[10px] sm:text-xs flex items-center gap-1 transition shadow-xs cursor-pointer"
                title="Copiar lista estructurada"
              >
                {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                onClick={() => setShowClearConfirmModal(true)}
                disabled={favorites.length === 0}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-500 hover:text-rose-600 disabled:opacity-40 transition cursor-pointer"
                title="Limpiar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats strip - Compact */}
        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-1 text-[10px] sm:text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <span>
              <strong>{totalFavoritesCount}</strong> jugadores
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>
              <strong>{uniqueClubsCount}</strong>/30 clubes
            </span>
          </div>

          {/* Position counter badges */}
          <div className="flex items-center gap-1 font-mono text-[9.5px] sm:text-[10px] font-bold">
            <span className="px-1 py-0.2 rounded bg-[#facc15] text-[#713f12]">
              ARQ: {posCounts.ARQ}
            </span>
            <span className="px-1 py-0.2 rounded bg-[#2563eb] text-white">
              DEF: {posCounts.DEF}
            </span>
            <span className="px-1 py-0.2 rounded bg-[#16a34a] text-white">
              VOL: {posCounts.VOL}
            </span>
            <span className="px-1 py-0.2 rounded bg-[#dc2626] text-white">
              DEL: {posCounts.DEL}
            </span>
          </div>
        </div>

        {/* Unavailable Players Warning Banner for User's Favorites */}
        {unavailableFavorites.length > 0 && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800/80 flex items-center justify-between flex-wrap gap-2 text-xs shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-rose-950 dark:text-rose-200 min-w-0 flex-1">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <div className="min-w-0">
                <span className="font-black text-[11px] uppercase tracking-wider text-rose-700 dark:text-rose-300 mr-1.5">
                  ⚠️ {unavailableFavorites.length} {unavailableFavorites.length === 1 ? 'Baja' : 'Bajas'} en tus Favoritos:
                </span>
                <span className="font-medium text-[11px] text-rose-900 dark:text-rose-100">
                  {unavailableFavorites.map(f => `${f.nombre} (${f.equipo})`).join(', ')}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shrink-0">
              No juegan la Fecha 7
            </span>
          </div>
        )}

        {/* Cloud Recovery Suggestion Bar when 0 favorites */}
        {favorites.length === 0 && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-cyan-200">
              <Cloud className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
              <span>
                <strong>¿Ingresaste desde otro dispositivo?</strong> Si tenías un plantel guardado en la nube, podés inspeccionar y restaurar tus listas de Firestore.
              </span>
            </div>
            <button
              onClick={() => setShowCloudSyncModal(true)}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-[11px] transition shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Ver Listas en la Nube</span>
            </button>
          </div>
        )}
      </div>

      {/* 2.5 CARD FILTERS & SORTING TOOLBAR (Local/Visitante, Día, Posición en Tabla, Nombre) */}
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl border border-slate-300/90 dark:border-slate-800 p-1.5 sm:p-2 shadow-2xs flex flex-wrap items-center justify-between gap-1 sm:gap-2 text-xs">
        {/* Left: Filter Controls */}
        <div className="flex items-center flex-wrap gap-1 sm:gap-1.5">
          {/* Local vs Visitante filter pills */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setCardRoleFilter('ALL')}
              className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black transition ${
                cardRoleFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              Todos ({clubsToDisplay.length})
            </button>
            <button
              onClick={() => setCardRoleFilter('LOCAL')}
              className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black transition flex items-center gap-0.5 ${
                cardRoleFilter === 'LOCAL'
                  ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
              }`}
              title="Equipos que juegan de local en la fecha"
            >
              <span>Locales</span>
            </button>
            <button
              onClick={() => setCardRoleFilter('VISITANTE')}
              className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black transition flex items-center gap-0.5 ${
                cardRoleFilter === 'VISITANTE'
                  ? 'bg-white dark:bg-slate-700 text-purple-800 dark:text-purple-300 shadow-xs'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
              }`}
              title="Equipos que juegan de visitante en la fecha"
            >
              <span>Visitantes</span>
            </button>
          </div>

          {/* Day of Week Filter */}
          <select
            value={cardDayFilter}
            onChange={e => setCardDayFilter(e.target.value as any)}
            className="text-[10px] sm:text-[11px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 outline-none cursor-pointer"
          >
            <option value="ALL">📅 Todos días</option>
            <option value="Viernes">Viernes</option>
            <option value="Sábado">Sábado</option>
            <option value="Domingo">Domingo</option>
            <option value="Lunes">Lunes</option>
          </select>

          {/* Zone Filter */}
          <select
            value={cardZoneFilter}
            onChange={e => setCardZoneFilter(e.target.value as any)}
            className="text-[10px] sm:text-[11px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 outline-none cursor-pointer"
          >
            <option value="ALL">Zonas A y B</option>
            <option value="Zona A">Zona A</option>
            <option value="Zona B">Zona B</option>
          </select>
        </div>

        {/* Right: Sorting & Reset */}
        <div className="flex items-center gap-1 ml-auto">
          <select
            value={cardSortBy}
            onChange={e => setCardSortBy(e.target.value as any)}
            className="text-[10px] sm:text-[11px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 outline-none cursor-pointer"
          >
            <option value="table-pos">🏆 Posición</option>
            <option value="name-asc">🔤 Club A-Z</option>
            <option value="name-desc">🔤 Club Z-A</option>
            <option value="points-desc">📈 Puntos</option>
          </select>

          {/* Reset Filters button */}
          {hasActiveCardFilters && (
            <button
              onClick={resetCardFilters}
              className="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-[10px] font-bold flex items-center gap-0.5 transition cursor-pointer"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3 h-3" />
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
              Explorar los {activePlayers.length} Jugadores
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 auto-rows-[260px] [grid-auto-flow:dense] gap-2 sm:gap-2.5">
          {clubsToDisplay.map(teamName => {
            const teamPlayers = groupedFavorites[teamName] || [];
            const count = teamPlayers.length;
            const teamMeta = getTeamData(teamName);
            const teamBadgeSrc = teamMeta?.escudoUrl || getTeamFallbackBadge(teamName);
            const primaryColor = teamMeta?.primaryColor || '#1b55e2';
            const shortName = teamMeta?.shortName || teamName.slice(0, 3).toUpperCase();
            const standing = getLiveTeamStanding(teamName);
            const matchInfo = getTeamMatchInfo(teamName);

            // Dynamic card dimensions and watermark scaling according to player count:
            // 0-4 players: 1 col, 1 row (exact height to fit 4 players with 0 scrolling)
            // 5-10 players: 1 col, 2 rows (fits up to 10 players in single column with 0 scrolling)
            // 11+ players: 2 cols, 2 rows (2-column layout to fit 11-20+ players cleanly with 0 scrolling)
            let spanClass = 'col-span-1 row-span-1';
            let listClass = 'space-y-1';
            let watermarkSizeClass = 'w-36 h-36 sm:w-40 sm:h-40 -bottom-4 -right-4';

            if (count >= 5 && count <= 10) {
              spanClass = 'col-span-1 row-span-2';
              listClass = 'space-y-1';
              watermarkSizeClass = 'w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 -bottom-6 -right-6';
            } else if (count >= 11) {
              spanClass = 'col-span-1 sm:col-span-2 row-span-2';
              listClass = 'grid grid-cols-1 sm:grid-cols-2 gap-1 content-start';
              watermarkSizeClass = 'w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 -bottom-8 -right-8';
            }

            return (
              <div
                key={teamName}
                id={`team-card-${teamName.replace(/\s+/g, '-').toLowerCase()}`}
                className={`relative rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between overflow-hidden group h-full ${spanClass}`}
                style={{ backgroundColor: primaryColor ? `${primaryColor}2e` : undefined }}
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
                <div className="relative z-10 p-2 sm:p-2.5 bg-slate-100/95 dark:bg-slate-800/90 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 shrink-0 space-y-1 sm:space-y-1.5">
                  {/* Row 1: Badge, Name, Count, +Sumar */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TeamBadge teamName={teamName} size="sm" showName={false} />
                      <div className="min-w-0">
                        <h4 className="font-black text-xs text-slate-950 dark:text-slate-100 truncate leading-tight">
                          {teamName}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block leading-none mt-0.5">
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
                      className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-[#1b55e2] dark:text-cyan-300 text-[10px] font-black flex items-center gap-0.5 transition shrink-0 border border-blue-300/80 dark:border-blue-800/60 active:scale-95 shadow-2xs"
                      title={`Agregar futbolistas de ${teamName}`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Sumar</span>
                    </button>
                  </div>

                  {/* Row 2: Standings Info (Posición, Puntos, Zona) & Fixture Info */}
                  <div className="flex items-center justify-between gap-1 text-[10px] pt-1 sm:pt-1.5 border-t border-slate-200 dark:border-slate-700/70 flex-wrap">
                    <div className="flex items-center gap-1">
                      {/* Zone Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                          standing?.zone === 'Zona A'
                            ? 'bg-blue-100 text-blue-950 dark:bg-blue-950 dark:text-blue-200 border border-blue-300/80 dark:border-blue-800/60'
                            : 'bg-indigo-100 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300/80 dark:border-indigo-800/60'
                        }`}
                      >
                        {standing?.zone || 'AFA'}
                      </span>

                      {/* Position in Table */}
                      <span
                        className="px-1.5 py-0.5 rounded font-black text-[9px] bg-slate-200/90 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
                        title={`Posición general en la tabla del Clausura 2026: ${standing?.positionGeneral}º (${standing?.positionZone}º en ${standing?.zone})`}
                      >
                        #{standing?.positionGeneral || '-'}º
                      </span>

                      {/* Points */}
                      <span
                        className="px-1.5 py-0.5 rounded font-black text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/60 font-mono"
                        title={`${standing?.points ?? 0} puntos acumulados en ${standing?.played || 7} fechas disputadas`}
                      >
                        {standing?.points ?? '-'} pts
                      </span>
                    </div>

                    {/* Match Fixture Badge (Local/Visitante + Rival 3-letter Abbr + Día) */}
                    {matchInfo && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                          matchInfo.isHome
                            ? 'bg-amber-100/90 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800/70'
                            : 'bg-purple-100/90 dark:bg-purple-950/50 text-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-800/70'
                        }`}
                        title={`Fecha ${matchInfo.match.fecha}: ${matchInfo.role} vs ${matchInfo.rival} (${matchInfo.displayTime})`}
                      >
                        <span>{matchInfo.isHome ? '🏠' : '✈️'}</span>
                        <span>{matchInfo.dayOfWeek.slice(0, 3)}</span>
                        <span className="font-mono font-black uppercase tracking-tight">vs {matchInfo.rivalShort}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Players List (High Density with dynamic list layout) */}
                <div className={`relative p-1.5 flex-1 ${listClass} min-h-[90px] overflow-y-auto bg-slate-50/40 dark:bg-slate-950/20`}>
                  {/* Pinned top overlay when a player is selected - Constrained to 1 row height even on multi-row/multi-col cards */}
                  {(() => {
                    const expandedPlayerInCard = teamPlayers.find(p => p.id === expandedPlayerId);
                    if (!expandedPlayerInCard) return null;

                    const formattedProm =
                      typeof expandedPlayerInCard.promedio === 'number' && expandedPlayerInCard.promedio > 0
                        ? expandedPlayerInCard.promedio.toFixed(2)
                        : '-';

                    const overlayHeightClass = count >= 5 ? 'top-0 left-0 right-0 h-[168px] border-b border-b-blue-200 dark:border-b-blue-900' : 'inset-0';

                    return (
                      <div className={`absolute ${overlayHeightClass} z-30 bg-white dark:bg-slate-900 backdrop-blur-md p-1.5 flex flex-col rounded-b-xl border-t-2 border-[#1b55e2] overflow-hidden animate-in fade-in zoom-in-95 duration-150 shadow-md`}>
                        {/* Selected player pinned at top - Click to collapse/close */}
                        <div
                          onClick={() => setExpandedPlayerId(null)}
                          className="flex items-center justify-between gap-1 px-1.5 py-1 rounded-md bg-blue-50/95 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs mb-1.5 cursor-pointer hover:bg-blue-100/90 dark:hover:bg-blue-900/60 transition select-none group/pinned shrink-0"
                          title="Tocar para cerrar y volver a la vista normal"
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <PositionBadge position={expandedPlayerInCard.posicion} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className={`font-black text-[11px] truncate leading-tight block ${
                                  expandedPlayerInCard.statusInfo ? 'text-red-700 dark:text-red-400' : 'text-slate-950 dark:text-slate-100'
                                } group-hover/pinned:text-[#1b55e2] transition-colors`}>
                                  {expandedPlayerInCard.nombre}
                                </span>
                                {expandedPlayerInCard.statusInfo && (
                                  <PlayerStatusBadge statusInfo={expandedPlayerInCard.statusInfo} size="xs" />
                                )}
                                <ChevronUp className="w-3 h-3 text-[#1b55e2] shrink-0" />
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-emerald-800 dark:text-emerald-400 font-extrabold leading-none">
                                  {expandedPlayerInCard.precio}
                                </span>
                                <span
                                  className={`font-mono text-[9px] font-black px-1 py-0.2 rounded leading-none ${
                                    formattedProm !== '-'
                                      ? 'text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70'
                                      : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                                  }`}
                                >
                                  {formattedProm !== '-' ? `${formattedProm} pts` : '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setEditingPlayer(expandedPlayerInCard);
                                setEditingNoteText(expandedPlayerInCard.notes || '');
                              }}
                              className={`p-1 rounded text-[10px] transition ${
                                expandedPlayerInCard.notes
                                  ? 'text-[#1b55e2] dark:text-cyan-400 bg-blue-100 dark:bg-blue-950 font-bold border border-blue-200'
                                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={expandedPlayerInCard.notes || 'Agregar nota táctica'}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => setExpandedPlayerId(null)}
                              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                              title="Cerrar detalle"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Full width trait badges & fixture scores */}
                        <div className="w-full flex-1 overflow-hidden flex flex-col justify-start">
                          <PlayerTraitsDetail player={expandedPlayerInCard} />
                        </div>
                      </div>
                    );
                  })()}

                  {teamPlayers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-4 text-center">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 italic font-medium">
                        Sin jugadores guardados
                      </span>
                    </div>
                  ) : (
                    teamPlayers.map((player, idx) => {
                      const formattedPromedio =
                        typeof player.promedio === 'number' && player.promedio > 0
                          ? player.promedio.toFixed(2)
                          : '-';

                      const isPlayerUnavailable = !!player.statusInfo;
                      return (
                        <div key={`fav-team-player-${player.id}-${idx}`} className="flex flex-col mb-1 last:mb-0">
                          <div
                            onClick={() => setExpandedPlayerId(expandedPlayerId === player.id ? null : player.id)}
                            className={`group/item flex items-center justify-between gap-1 px-1.5 py-1 rounded-md transition text-xs border shadow-2xs cursor-pointer select-none ${
                              isPlayerUnavailable
                                ? 'bg-red-50/70 dark:bg-red-950/30 border-red-300/80 dark:border-red-800/80 hover:bg-red-100/80'
                                : 'bg-white dark:bg-slate-800/90 backdrop-blur-[1px] hover:bg-blue-50/80 dark:hover:bg-slate-700/80 border-slate-200/90 dark:border-slate-700/80 hover:border-blue-300'
                            }`}
                          >
                            {/* Position Pill & Player Name */}
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <PositionBadge position={player.posicion} size="sm" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className={`font-black text-[11px] truncate leading-tight block ${
                                    isPlayerUnavailable
                                      ? 'text-red-700 dark:text-red-400 font-black'
                                      : 'text-slate-950 dark:text-slate-100 group-hover/item:text-[#1b55e2]'
                                  } transition-colors`}>
                                    {player.nombre}
                                  </span>
                                  {isPlayerUnavailable && (
                                    <PlayerStatusBadge statusInfo={player.statusInfo} size="xs" />
                                  )}
                                  <ChevronDown className="w-3 h-3 text-slate-400 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-[10px] text-emerald-800 dark:text-emerald-400 font-extrabold leading-none">
                                    {player.precio}
                                  </span>
                                  <span
                                    className={`font-mono text-[9px] font-black px-1 py-0.2 rounded leading-none ${
                                      formattedPromedio !== '-'
                                        ? 'text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70'
                                        : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                                    }`}
                                  >
                                    {formattedPromedio !== '-' ? `${formattedPromedio} pts` : '-'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions: Notes, Remove */}
                            <div className="flex items-center gap-0.5 shrink-0">
                              {/* Note icon / edit */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPlayer(player);
                                  setEditingNoteText(player.notes || '');
                                }}
                                className={`p-1 rounded text-[10px] transition ${
                                  player.notes
                                    ? 'text-[#1b55e2] dark:text-cyan-400 bg-blue-100 dark:bg-blue-950 font-bold border border-blue-200'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                                title={player.notes || 'Agregar nota táctica'}
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>

                              {/* Remove button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveFavorite(player, player.nombre, player.equipo);
                                }}
                                className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                                title="Quitar de favoritos"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
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
            <div className="flex-1 overflow-y-auto p-2.5 divide-y divide-slate-100 dark:divide-slate-800 space-y-0.5 relative">
              {/* Sticky top view when a player in modal is expanded */}
              {(() => {
                const expandedModalPlayer = clubModalPlayers.find(p => p.id === expandedPlayerId);
                if (!expandedModalPlayer) return null;
                const isFav = isFavoritePlayer(expandedModalPlayer);
                const formattedPromedio =
                  typeof expandedModalPlayer.promedio === 'number' && expandedModalPlayer.promedio > 0
                    ? expandedModalPlayer.promedio.toFixed(2)
                    : '-';

                return (
                  <div className="sticky top-0 z-20 mb-2 p-2 bg-white dark:bg-slate-900 border-2 border-[#1b55e2] rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-150">
                    <div
                      onClick={() => setExpandedPlayerId(null)}
                      className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded p-1 transition select-none group/modalpinned"
                      title="Tocar para cerrar detalle y volver a la lista"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <PositionBadge position={expandedModalPlayer.posicion} size="sm" />
                        <span className="font-extrabold text-sm text-slate-950 dark:text-slate-100 truncate group-hover/modalpinned:text-[#1b55e2] transition-colors">
                          {expandedModalPlayer.nombre}
                        </span>
                        <ChevronUp className="w-3.5 h-3.5 text-[#1b55e2] shrink-0" />
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded ${
                            formattedPromedio !== '-'
                              ? 'text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70'
                              : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {formattedPromedio !== '-' ? `${formattedPromedio} pts` : '-'}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {expandedModalPlayer.precio}
                        </span>
                        <button
                          onClick={() => {
                            if (isFav) {
                              onRemoveFavorite(expandedModalPlayer, expandedModalPlayer.nombre, expandedModalPlayer.equipo);
                            } else {
                              onAddFavorite(expandedModalPlayer);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            isFav
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                              : 'bg-[#1b55e2] hover:bg-[#1444b8] text-white shadow-xs'
                          }`}
                        >
                          {isFav ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          <span>{isFav ? 'Quitar' : 'Sumar'}</span>
                        </button>
                        <button
                          onClick={() => setExpandedPlayerId(null)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Cerrar detalle"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <PlayerTraitsDetail player={expandedModalPlayer} />
                  </div>
                );
              })()}

              {clubModalPlayers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No se encontraron futbolistas con ese filtro.
                </div>
              ) : (
                clubModalPlayers.map((p, idx) => {
                  const isFav = isFavoritePlayer(p);
                  const formattedPromedio =
                    typeof p.promedio === 'number' && p.promedio > 0
                      ? p.promedio.toFixed(2)
                      : '-';

                  return (
                    <div key={`modal-club-player-${p.id}-${idx}`} className="flex flex-col">
                      <div
                        onClick={() => setExpandedPlayerId(expandedPlayerId === p.id ? null : p.id)}
                        className={`py-1.5 px-2 rounded-lg flex items-center justify-between gap-1.5 sm:gap-3 text-xs transition cursor-pointer select-none ${
                          p.statusInfo
                            ? 'bg-red-50/40 dark:bg-red-950/20 hover:bg-red-100/60'
                            : 'hover:bg-blue-50/60 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1">
                          <PositionBadge position={p.posicion} size="xs" />
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                            <span
                              className={`font-black text-xs sm:text-[13px] truncate ${
                                p.statusInfo ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                              }`}
                              title={p.nombre}
                            >
                              {p.nombre}
                            </span>
                            {p.statusInfo && (
                              <PlayerStatusBadge statusInfo={p.statusInfo} size="xs" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <span
                            className={`font-mono text-[9.5px] sm:text-[10px] font-black px-1 sm:px-1.5 py-0.5 rounded leading-none ${
                              formattedPromedio !== '-'
                                ? 'text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70'
                                : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                            }`}
                          >
                            {formattedPromedio !== '-' ? `${formattedPromedio} pts` : '-'}
                          </span>
                          <span className="font-mono font-black text-emerald-800 dark:text-emerald-400 text-[10.5px] sm:text-xs whitespace-nowrap">
                            <span className="hidden sm:inline">{p.precio}</span>
                            <span className="sm:hidden">${(p.precioNum / 1000000).toFixed(1)}M</span>
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isFav) {
                                onRemoveFavorite(p, p.nombre, p.equipo);
                              } else {
                                onAddFavorite(p);
                              }
                            }}
                            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-black flex items-center gap-0.5 transition shadow-2xs active:scale-95 shrink-0 cursor-pointer ${
                              isFav
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
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

      {/* 7. MODAL: CLOUD SYNC & BACKUP RESTORATION */}
      <CloudSyncModal
        isOpen={showCloudSyncModal}
        onClose={() => setShowCloudSyncModal(false)}
        favorites={favorites}
        activeUser={activeUser}
        onFavoritesUpdated={newFavs => {
          if (onFavoritesUpdated) {
            onFavoritesUpdated(newFavs);
          }
        }}
        showToast={showToast}
      />
    </div>
  );
};
