import React, { useState, useMemo } from 'react';
import { Player, Position } from '../types';
import { TEAMS_DATA } from '../data/teams';
import { playerMatchesQuery } from '../utils/textUtils';
import { ALL_TRAIT_DEFINITIONS, playerHasTrait } from '../utils/playerTraits';
import { PlayerCard } from './PlayerCard';
import { PlayerTable } from './PlayerTable';
import {
  Search,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BookmarkCheck,
  Sparkles,
  Filter,
} from 'lucide-react';

interface PlayerExplorerProps {
  players: Player[];
  favoriteIds: Set<number>;
  onToggleFavorite: (player: Player) => void;
  selectedClubFilter?: string;
  onClearClubFilter?: () => void;
  targetPositionFilter?: string;
  onClearTargetPositionFilter?: () => void;
  onNavigateToFavorites?: () => void;
}

export const PlayerExplorer: React.FC<PlayerExplorerProps> = ({
  players,
  favoriteIds,
  onToggleFavorite,
  selectedClubFilter = '',
  onClearClubFilter,
  targetPositionFilter = 'ALL',
  onClearTargetPositionFilter,
  onNavigateToFavorites,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>(selectedClubFilter || 'ALL');
  const [selectedPosition, setSelectedPosition] = useState<string>(targetPositionFilter || 'ALL');
  const [selectedTrait, setSelectedTrait] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(7500000);
  const [sortBy, setSortBy] = useState<'precio' | 'promedio' | 'nombre' | 'equipo' | 'posicion'>('promedio');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Sync prop changes if user clicked club from another tab
  React.useEffect(() => {
    if (selectedClubFilter) {
      setSelectedTeam(selectedClubFilter);
    }
  }, [selectedClubFilter]);

  React.useEffect(() => {
    if (targetPositionFilter && targetPositionFilter !== 'ALL') {
      setSelectedPosition(targetPositionFilter);
    }
  }, [targetPositionFilter]);

  // Positions list
  const positions: (Position | 'ALL')[] = ['ALL', 'ARQ', 'DEF', 'VOL', 'DEL'];

  // Count players per trait for quick filter pills
  const traitCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: players.length };
    ALL_TRAIT_DEFINITIONS.forEach(def => {
      counts[def.id] = 0;
    });
    players.forEach(p => {
      ALL_TRAIT_DEFINITIONS.forEach(def => {
        if (playerHasTrait(p, def.id)) {
          counts[def.id] = (counts[def.id] || 0) + 1;
        }
      });
    });
    return counts;
  }, [players]);

  // Filter and sort logic
  const filteredPlayers = useMemo(() => {
    return players
      .filter(player => {
        // Query search
        if (searchTerm.trim() !== '') {
          if (!playerMatchesQuery(player, searchTerm)) return false;
        }

        // Team filter
        if (selectedTeam !== 'ALL' && player.equipo !== selectedTeam) {
          return false;
        }

        // Position filter
        if (selectedPosition !== 'ALL' && player.posicion !== selectedPosition) {
          return false;
        }

        // Characteristic / Trait filter
        if (selectedTrait !== 'ALL') {
          if (!playerHasTrait(player, selectedTrait)) {
            return false;
          }
        }

        // Max price filter
        if (player.precioNum > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'promedio') {
          const promA = a.promedio || 0;
          const promB = b.promedio || 0;
          comparison = promA - promB;
        } else if (sortBy === 'precio') {
          comparison = a.precioNum - b.precioNum;
        } else if (sortBy === 'nombre') {
          comparison = a.nombre.localeCompare(b.nombre);
        } else if (sortBy === 'equipo') {
          comparison = a.equipo.localeCompare(b.equipo);
        } else if (sortBy === 'posicion') {
          comparison = a.posicion.localeCompare(b.posicion);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [players, searchTerm, selectedTeam, selectedPosition, selectedTrait, maxPrice, sortBy, sortOrder]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTeam, selectedPosition, selectedTrait, maxPrice, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage) || 1;
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSortChange = (field: 'precio' | 'promedio' | 'nombre' | 'equipo' | 'posicion') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTeam('ALL');
    setSelectedPosition('ALL');
    setSelectedTrait('ALL');
    setMaxPrice(7500000);
    setSortBy('promedio');
    setSortOrder('desc');
    onClearClubFilter?.();
    onClearTargetPositionFilter?.();
  };

  const isFiltering =
    searchTerm !== '' ||
    selectedTeam !== 'ALL' ||
    selectedPosition !== 'ALL' ||
    selectedTrait !== 'ALL' ||
    maxPrice < 7500000;

  return (
    <div className="space-y-3 pb-8">
      {/* Official Gran DT Blue Header Banner */}
      <div className="bg-gradient-to-r from-[#07245c] via-[#0e3f9a] to-[#082b6c] text-white rounded-xl shadow-xs p-4 sm:p-5 border border-blue-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-cyan-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                {players.length} Futbolistas
              </span>
              <span className="text-xs text-blue-200 font-bold uppercase tracking-wide flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                Base en Vivo de Google Sheet
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Base de Datos, Cotizaciones y Puntos Promedio AFA 2026
            </h2>
            <p className="text-blue-100/80 text-xs max-w-xl mt-0.5">
              Consultá el valor de mercado y el promedio de rendimiento de cada jugador actualizado fecha a fecha.
            </p>
          </div>

          {onNavigateToFavorites && (
            <button
              onClick={onNavigateToFavorites}
              className="px-4 py-2 rounded-lg text-xs font-black bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-sm transition flex items-center gap-1.5 self-start md:self-auto shrink-0"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Ver mis {favoriteIds.size} Jugadores</span>
            </button>
          )}
        </div>
      </div>

      {/* Crisp White Gran DT Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300/90 dark:border-slate-800 shadow-xs p-3 space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              id="player-search-input"
              type="text"
              placeholder="Buscar por nombre o club (ej: Paredes, River, Acosta)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-950 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#1b55e2] dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition outline-none font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Position Selector Tabs */}
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg gap-1 shrink-0 overflow-x-auto border border-slate-300 dark:border-slate-700">
            {positions.map(pos => (
              <button
                key={pos}
                id={`filter-pos-${pos.toLowerCase()}`}
                onClick={() => setSelectedPosition(pos)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition whitespace-nowrap ${
                  selectedPosition === pos
                    ? 'bg-[#1b55e2] text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
                }`}
              >
                {pos === 'ALL' ? 'Todas' : pos}
              </button>
            ))}
          </div>

          {/* View Switcher: Grid vs Table */}
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg gap-0.5 shrink-0 self-end md:self-auto border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-[#1b55e2] dark:text-cyan-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Club dropdown, Price Slider, Characteristics Dropdown & Sort selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          {/* Club Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-extrabold uppercase text-[10px]">Club:</span>
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-slate-200 outline-none cursor-pointer max-w-[180px] truncate hover:border-slate-400"
            >
              <option value="ALL">Todos los 30 clubes</option>
              {Object.keys(TEAMS_DATA)
                .sort()
                .map(team => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
            </select>
          </div>

          {/* Trait Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-extrabold uppercase text-[10px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Rasgo:</span>
            </span>
            <select
              id="trait-filter-dropdown"
              value={selectedTrait}
              onChange={e => setSelectedTrait(e.target.value)}
              className={`border rounded-lg px-2.5 py-1 text-xs font-bold outline-none cursor-pointer hover:border-slate-400 ${
                selectedTrait !== 'ALL'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 ring-1 ring-amber-400/40'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200'
              }`}
            >
              <option value="ALL">Todas las características ({players.length})</option>
              {ALL_TRAIT_DEFINITIONS.map(def => (
                <option key={def.id} value={def.id}>
                  {def.emoji} {def.label} ({traitCounts[def.id] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-extrabold uppercase text-[10px]">Ordenar por:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [f, o] = e.target.value.split('-') as [any, any];
                setSortBy(f);
                setSortOrder(o);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-slate-200 outline-none cursor-pointer hover:border-slate-400"
            >
              <option value="promedio-desc">⭐ Mayor Promedio Pts</option>
              <option value="promedio-asc">Menor Promedio Pts</option>
              <option value="precio-desc">💰 Mayor Cotización</option>
              <option value="precio-asc">💵 Menor Cotización</option>
              <option value="nombre-asc">🔤 Nombre A-Z</option>
              <option value="equipo-asc">🛡️ Club A-Z</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-extrabold uppercase text-[10px]">Precio máx:</span>
            <input
              type="range"
              min="300000"
              max="7500000"
              step="100000"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-24 sm:w-28 accent-[#1b55e2] cursor-pointer"
            />
            <span className="font-mono font-black text-emerald-800 dark:text-emerald-400">
              ${(maxPrice / 1000000).toFixed(1)}M
            </span>
          </div>

          {/* Active Filter Indicators & Reset */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-600 font-bold">
              Mostrando <strong>{filteredPlayers.length}</strong> de {players.length}
            </span>

            {isFiltering && (
              <button
                onClick={clearAllFilters}
                className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-bold text-[11px] hover:bg-rose-100 flex items-center gap-1 border border-rose-200 dark:border-rose-800"
              >
                <X className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Third Row: Quick Trait Badge Chips */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1 pr-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Filtro rápido:</span>
          </span>

          <button
            onClick={() => setSelectedTrait('ALL')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-black shrink-0 transition flex items-center gap-1 border ${
              selectedTrait === 'ALL'
                ? 'bg-[#1b55e2] text-white border-[#1b55e2] shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>Todos</span>
            <span className="text-[9.5px] opacity-75 font-normal">({players.length})</span>
          </button>

          {ALL_TRAIT_DEFINITIONS.map(def => {
            const isSelected = selectedTrait === def.id;
            const count = traitCounts[def.id] || 0;
            return (
              <button
                key={def.id}
                id={`filter-trait-chip-${def.id}`}
                onClick={() => setSelectedTrait(isSelected ? 'ALL' : def.id)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 transition flex items-center gap-1 border ${
                  isSelected
                    ? `${def.bgClass} ${def.colorClass} ${def.borderClass} ring-2 ring-blue-500/40 shadow-xs font-black`
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-slate-400'
                }`}
                title={`Filtrar por ${def.label} (${count} jugadores)`}
              >
                <span>{def.emoji}</span>
                <span>{def.label}</span>
                <span
                  className={`text-[9.5px] px-1 py-0.1 rounded font-bold ${
                    isSelected
                      ? 'bg-black/10 dark:bg-white/10'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 min-w-0">
          {paginatedPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              isFavorite={favoriteIds.has(player.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <PlayerTable
          players={paginatedPlayers}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-40 font-bold flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          <span className="font-semibold text-slate-600 dark:text-slate-300">
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-40 font-bold flex items-center gap-1"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

