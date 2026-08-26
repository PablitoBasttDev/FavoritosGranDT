import React, { useState, useEffect, useMemo } from 'react';
import { ALL_PLAYERS, updateAllPlayers } from './data/players';
import { Player, FavoritePlayer, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { FavoritesDashboard } from './components/FavoritesDashboard';
import { PlayerExplorer } from './components/PlayerExplorer';
import { ClubExplorer } from './components/ClubExplorer';
import { StatsDashboard } from './components/StatsDashboard';
import { UserAuthModal } from './components/UserAuthModal';
import { AuthScreen } from './components/AuthScreen';
import {
  getCachedSheetPlayers,
  initBackgroundAutoSync,
  SheetSyncResult,
} from './services/sheetsService';
import {
  usePromiedosLiveFixture,
} from './services/promiedosService';
import {
  getActiveUser,
  getStoredUsers,
  logoutUser,
  getUserFavorites,
  saveUserFavorites,
  syncUsersWithCloud,
  fetchUserFavoritesFromCloud,
} from './utils/userStorage';

import {
  findPlayerInCollection,
  isSamePlayer,
  generateDeterministicPlayerId,
} from './utils/playerIdentity';

const THEME_KEY = 'gran_dt_theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<'favorites' | 'players' | 'clubs' | 'stats'>('favorites');
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>('');
  const [targetPositionFilter, setTargetPositionFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Dynamic Live Players state automatically synced with Google Sheets
  const [livePlayers, setLivePlayers] = useState<Player[]>(() => getCachedSheetPlayers());

  // Authenticated Active User State (null = not logged in / locked)
  const [activeUser, setActiveUserState] = useState<UserProfile | null>(() => getActiveUser());
  const [usersList, setUsersList] = useState<UserProfile[]>(() => getStoredUsers());

  // Favorites state strictly isolated for the active user
  const [favorites, setFavorites] = useState<FavoritePlayer[]>(() => {
    const user = getActiveUser();
    return user ? getUserFavorites(user.id) : [];
  });

  // Track hydration state so empty initial state on new devices NEVER overwrites Firestore cloud favorites
  const isHydratedRef = React.useRef<boolean>(false);

  // Poll and sync Promiedos fixtures & live match stats every 45s across the whole application
  usePromiedosLiveFixture();

  // Auto-sync Google Sheet (Planeta Gran DT) in background on mount and continuously every 45s
  useEffect(() => {
    const unsubscribe = initBackgroundAutoSync((result: SheetSyncResult) => {
      if (result.players && result.players.length > 0) {
        setLivePlayers(result.players);
        updateAllPlayers(result.players);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync users and active favorites with Firestore cloud on startup
  useEffect(() => {
    syncUsersWithCloud().then(async synced => {
      setUsersList(synced);
      const current = getActiveUser();
      if (current) {
        setActiveUserState(current);
        const cloudFavs = await fetchUserFavoritesFromCloud(current.id, current.username);
        if (cloudFavs && cloudFavs.length > 0) {
          setFavorites(cloudFavs);
        }
        isHydratedRef.current = true;
      }
    });
  }, []);


  // Save favorites to isolated user storage whenever favorites change (ONLY when hydrated)
  useEffect(() => {
    if (activeUser?.id && isHydratedRef.current) {
      saveUserFavorites(activeUser.id, favorites, true, activeUser.username);
    }
  }, [favorites, activeUser?.id]);

  // Handle successful login or registration
  const handleLoginSuccess = async (user: UserProfile) => {
    isHydratedRef.current = false;
    setActiveUserState(user);
    const updatedUsers = getStoredUsers();
    setUsersList(updatedUsers);
    
    // Fetch from cloud first to ensure cross-device synchronization
    const cloudFavs = await fetchUserFavoritesFromCloud(user.id, user.username);
    if (cloudFavs && cloudFavs.length > 0) {
      setFavorites(cloudFavs);
    } else {
      const localFavs = getUserFavorites(user.id);
      setFavorites(localFavs);
    }
    isHydratedRef.current = true;
    
    showToast(`✓ Bienvenido, ${user.name} (@${user.username})`);
  };

  // Handle user logout (Locks access)
  const handleLogout = () => {
    if (activeUser?.id && isHydratedRef.current) {
      saveUserFavorites(activeUser.id, favorites, true, activeUser.username);
    }
    isHydratedRef.current = false;
    logoutUser();
    setActiveUserState(null);
    setFavorites([]);
    setIsUserModalOpen(false);
    showToast('🔒 Sesión cerrada. Acceso protegido.');
  };

  // Handle switching to a different user account after password verification
  const handleSelectUser = async (user: UserProfile) => {
    if (activeUser?.id && isHydratedRef.current) {
      saveUserFavorites(activeUser.id, favorites, true, activeUser.username);
    }
    isHydratedRef.current = false;
    setActiveUserState(user);
    const updatedUsers = getStoredUsers();
    setUsersList(updatedUsers);
    
    const cloudFavs = await fetchUserFavoritesFromCloud(user.id, user.username);
    if (cloudFavs && cloudFavs.length > 0) {
      setFavorites(cloudFavs);
    } else {
      const localFavs = getUserFavorites(user.id);
      setFavorites(localFavs);
    }
    isHydratedRef.current = true;
  };

  const refreshUserList = () => {
    const updated = getStoredUsers();
    setUsersList(updated);
    const current = getActiveUser();
    if (!current) {
      setActiveUserState(null);
      setFavorites([]);
    } else {
      setActiveUserState(current);
    }
  };

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  // Dynamically enrich user favorites with the latest prices, averages and scores from the live Google Sheet / Planeta Gran DT
  // matching strictly by player NAME and club rather than transient row numbers
  const enrichedFavorites = useMemo(() => {
    if (!livePlayers || livePlayers.length === 0) return favorites;

    return favorites.map(fav => {
      // Find the corresponding player in livePlayers strictly by NAME and team
      const live = findPlayerInCollection(fav, livePlayers);
      if (!live) return fav;

      return {
        ...fav,
        id: live.id || fav.id,
        nombre: live.nombre || fav.nombre,
        equipo: live.equipo || fav.equipo,
        posicion: live.posicion || fav.posicion,
        precio: live.precio || fav.precio,
        precioNum: live.precioNum ?? fav.precioNum,
        promedio: live.promedio ?? fav.promedio,
        promedioGranDT: live.promedioGranDT ?? fav.promedioGranDT,
        puntosTotales: live.puntosTotales ?? fav.puntosTotales,
        partidosJugados: live.partidosJugados ?? fav.partidosJugados,
        goles: live.goles ?? fav.goles,
        figura: live.figura ?? fav.figura,
        vallaInvicta: live.vallaInvicta ?? fav.vallaInvicta,
        amarillas: live.amarillas ?? fav.amarillas,
        rojas: live.rojas ?? fav.rojas,
        penalesErrados: live.penalesErrados ?? fav.penalesErrados,
        penalesAtajados: live.penalesAtajados ?? fav.penalesAtajados,
        golesPenal: live.golesPenal ?? fav.golesPenal,
        fechasPuntajes: live.fechasPuntajes || fav.fechasPuntajes,
      };
    });
  }, [favorites, livePlayers]);

  const favoriteIds = useMemo(() => {
    const ids = new Set<number>();
    enrichedFavorites.forEach(p => {
      if (p.id) ids.add(p.id);
      const detId = generateDeterministicPlayerId(p.nombre, p.equipo, p.posicion);
      ids.add(detId);
    });
    return ids;
  }, [enrichedFavorites]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Add a player to favorites with optional note, matched by NAME
  const handleAddFavorite = (player: Player, notes?: string) => {
    if (!activeUser) return;

    // Check if already in favorites by name or ID
    const existingIndex = favorites.findIndex(f => isSamePlayer(f, player) || f.id === player.id);

    if (existingIndex >= 0) {
      if (notes) {
        handleUpdateNotes(favorites[existingIndex].id, notes, favorites[existingIndex].nombre);
        showToast(`Nota actualizada para ${player.nombre}`);
      } else {
        showToast(`${player.nombre} ya está en tus favoritos.`);
      }
      return;
    }

    const stableId = player.id || generateDeterministicPlayerId(player.nombre, player.equipo, player.posicion);
    const newFav: FavoritePlayer = {
      ...player,
      id: stableId,
      notes: notes || undefined,
      addedAt: Date.now(),
    };

    setFavorites(prev => [newFav, ...prev]);
    showToast(`✓ ${player.nombre} agregado a ${player.equipo}`);
  };

  // Toggle favorite on/off
  const handleToggleFavorite = (player: Player) => {
    if (!activeUser) return;
    const exists = favorites.some(f => isSamePlayer(f, player) || f.id === player.id);
    if (exists) {
      handleRemoveFavorite(player.id, player.nombre);
    } else {
      handleAddFavorite(player);
    }
  };

  // Remove single player from favorites by ID and Name
  const handleRemoveFavorite = (playerId: number, playerName?: string) => {
    const playerToRemove = favorites.find(
      p => p.id === playerId || (playerName && isSamePlayer(p, { nombre: playerName }))
    );
    setFavorites(prev =>
      prev.filter(p => {
        if (p.id === playerId) return false;
        if (playerName && isSamePlayer(p, { nombre: playerName })) return false;
        if (playerToRemove && isSamePlayer(p, playerToRemove)) return false;
        return true;
      })
    );
    if (playerToRemove) {
      showToast(`✕ ${playerToRemove.nombre} eliminado de favoritos`);
    }
  };

  // Update scouting note
  const handleUpdateNotes = (playerId: number, notes: string, playerName?: string) => {
    setFavorites(prev =>
      prev.map(p => {
        if (p.id === playerId || (playerName && isSamePlayer(p, { nombre: playerName }))) {
          return { ...p, notes: notes || undefined };
        }
        return p;
      })
    );
    showToast('Nota de scouting guardada');
  };

  // Clear all favorites
  const handleClearAll = () => {
    setFavorites([]);
    showToast('Lista de favoritos reiniciada');
  };

  // Navigate to database tab with optional club filter
  const handleNavigateToDatabase = (clubName?: string) => {
    if (clubName) {
      setSelectedClubFilter(clubName);
    }
    setActiveTab('players');
  };

  // If no user is authenticated, render the dedicated secure AuthScreen
  if (!activeUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#edf2f7] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-none">
          <div className="px-4 py-2.5 rounded-xl bg-[#0d141e]/95 text-white font-bold text-xs shadow-2xl border border-cyan-500/50 flex items-center gap-2">
            <span className="text-cyan-400 font-bold">●</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* User Accounts & Profile Management Modal */}
      <UserAuthModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        activeUser={activeUser}
        usersList={usersList}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
        onUserListUpdated={refreshUserList}
        favoritesCount={favorites.length}
        showToast={showToast}
      />

      {/* Compact Gran DT Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favorites={enrichedFavorites}
        playersCount={livePlayers.length}
        darkMode={isDark}
        setDarkMode={setIsDark}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        activeUser={activeUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Full-Width Content Container */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3">
        {activeTab === 'favorites' && (
          <FavoritesDashboard
            favorites={enrichedFavorites}
            players={livePlayers}
            onAddFavorite={handleAddFavorite}
            onRemoveFavorite={handleRemoveFavorite}
            onUpdateNotes={handleUpdateNotes}
            onClearAll={handleClearAll}
            onNavigateToDatabase={handleNavigateToDatabase}
            activeUser={activeUser}
            onFavoritesUpdated={setFavorites}
            showToast={showToast}
          />
        )}

        {activeTab === 'players' && (
          <PlayerExplorer
            players={livePlayers}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            selectedClubFilter={selectedClubFilter}
            onClearClubFilter={() => setSelectedClubFilter('')}
            targetPositionFilter={targetPositionFilter}
            onClearTargetPositionFilter={() => setTargetPositionFilter('ALL')}
            onNavigateToFavorites={() => setActiveTab('favorites')}
          />
        )}

        {activeTab === 'stats' && (
          <StatsDashboard
            players={livePlayers}
            onSelectClub={handleNavigateToDatabase}
          />
        )}
      </main>
    </div>
  );
}
