import React, { useState, useEffect, useMemo } from 'react';
import { ALL_PLAYERS } from './data/players';
import { Player, FavoritePlayer, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { FavoritesDashboard } from './components/FavoritesDashboard';
import { PlayerExplorer } from './components/PlayerExplorer';
import { ClubExplorer } from './components/ClubExplorer';
import { StatsDashboard } from './components/StatsDashboard';
import { UserAuthModal } from './components/UserAuthModal';
import { AuthScreen } from './components/AuthScreen';
import {
  getActiveUser,
  getStoredUsers,
  logoutUser,
  getUserFavorites,
  saveUserFavorites,
  syncUsersWithCloud,
  fetchUserFavoritesFromCloud,
} from './utils/userStorage';

const THEME_KEY = 'gran_dt_theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<'favorites' | 'players' | 'clubs' | 'stats'>('favorites');
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>('');
  const [targetPositionFilter, setTargetPositionFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Authenticated Active User State (null = not logged in / locked)
  const [activeUser, setActiveUserState] = useState<UserProfile | null>(() => getActiveUser());
  const [usersList, setUsersList] = useState<UserProfile[]>(() => getStoredUsers());

  // Favorites state strictly isolated for the active user
  const [favorites, setFavorites] = useState<FavoritePlayer[]>(() => {
    const user = getActiveUser();
    return user ? getUserFavorites(user.id) : [];
  });

  // Sync users and active favorites with Firestore cloud on startup
  useEffect(() => {
    syncUsersWithCloud().then(synced => {
      setUsersList(synced);
      const current = getActiveUser();
      if (current) {
        setActiveUserState(current);
        fetchUserFavoritesFromCloud(current.id).then(cloudFavs => {
          if (cloudFavs && cloudFavs.length > 0) {
            setFavorites(cloudFavs);
          }
        });
      }
    });
  }, []);

  // Save favorites to isolated user storage whenever favorites change
  useEffect(() => {
    if (activeUser?.id) {
      saveUserFavorites(activeUser.id, favorites);
    }
  }, [favorites, activeUser?.id]);

  // Handle successful login or registration
  const handleLoginSuccess = async (user: UserProfile) => {
    setActiveUserState(user);
    const updatedUsers = getStoredUsers();
    setUsersList(updatedUsers);
    
    // Load favorites from cloud or local
    const localFavs = getUserFavorites(user.id);
    setFavorites(localFavs);
    
    const cloudFavs = await fetchUserFavoritesFromCloud(user.id);
    if (cloudFavs && cloudFavs.length > 0) {
      setFavorites(cloudFavs);
    }
    
    showToast(`✓ Bienvenido, ${user.name} (@${user.username})`);
  };

  // Handle user logout (Locks access)
  const handleLogout = () => {
    if (activeUser?.id) {
      saveUserFavorites(activeUser.id, favorites);
    }
    logoutUser();
    setActiveUserState(null);
    setFavorites([]);
    setIsUserModalOpen(false);
    showToast('🔒 Sesión cerrada. Acceso protegido.');
  };

  // Handle switching to a different user account after password verification
  const handleSelectUser = async (user: UserProfile) => {
    if (activeUser?.id) {
      saveUserFavorites(activeUser.id, favorites);
    }
    setActiveUserState(user);
    const updatedUsers = getStoredUsers();
    setUsersList(updatedUsers);
    const loadedFavs = getUserFavorites(user.id);
    setFavorites(loadedFavs);
    
    const cloudFavs = await fetchUserFavoritesFromCloud(user.id);
    if (cloudFavs && cloudFavs.length > 0) {
      setFavorites(cloudFavs);
    }
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

  const favoriteIds = useMemo(() => new Set(favorites.map(p => p.id)), [favorites]);
  const starredIds = useMemo(() => new Set(favorites.filter(p => p.star).map(p => p.id)), [favorites]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Add a player to favorites with optional note
  const handleAddFavorite = (player: Player, notes?: string) => {
    if (!activeUser) return;

    if (favoriteIds.has(player.id)) {
      if (notes) {
        handleUpdateNotes(player.id, notes);
        showToast(`Nota actualizada para ${player.nombre}`);
      } else {
        showToast(`${player.nombre} ya está en tus favoritos.`);
      }
      return;
    }

    const newFav: FavoritePlayer = {
      ...player,
      notes: notes || undefined,
      addedAt: Date.now(),
      star: false,
    };

    setFavorites(prev => [newFav, ...prev]);
    showToast(`✓ ${player.nombre} agregado a ${player.equipo}`);
  };

  // Toggle favorite on/off
  const handleToggleFavorite = (player: Player) => {
    if (!activeUser) return;
    if (favoriteIds.has(player.id)) {
      handleRemoveFavorite(player.id);
    } else {
      handleAddFavorite(player);
    }
  };

  // Remove single player from favorites
  const handleRemoveFavorite = (playerId: number) => {
    const playerToRemove = favorites.find(p => p.id === playerId);
    setFavorites(prev => prev.filter(p => p.id !== playerId));
    if (playerToRemove) {
      showToast(`✕ ${playerToRemove.nombre} eliminado de favoritos`);
    }
  };

  // Update scouting note
  const handleUpdateNotes = (playerId: number, notes: string) => {
    setFavorites(prev =>
      prev.map(p => (p.id === playerId ? { ...p, notes: notes || undefined } : p))
    );
    showToast('Nota de scouting guardada');
  };

  // Toggle star / top priority
  const handleToggleStar = (playerId: number) => {
    setFavorites(prev =>
      prev.map(p => (p.id === playerId ? { ...p, star: !p.star } : p))
    );
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
        favorites={favorites}
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
            favorites={favorites}
            onAddFavorite={handleAddFavorite}
            onRemoveFavorite={handleRemoveFavorite}
            onUpdateNotes={handleUpdateNotes}
            onToggleStar={handleToggleStar}
            onClearAll={handleClearAll}
            onNavigateToDatabase={handleNavigateToDatabase}
          />
        )}

        {activeTab === 'players' && (
          <PlayerExplorer
            players={ALL_PLAYERS}
            favoriteIds={favoriteIds}
            starredIds={starredIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleStar={handleToggleStar}
            selectedClubFilter={selectedClubFilter}
            onClearClubFilter={() => setSelectedClubFilter('')}
            targetPositionFilter={targetPositionFilter}
            onClearTargetPositionFilter={() => setTargetPositionFilter('ALL')}
            onNavigateToFavorites={() => setActiveTab('favorites')}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubExplorer
            onSelectClub={handleNavigateToDatabase}
            favorites={favorites}
          />
        )}

        {activeTab === 'stats' && (
          <StatsDashboard onSelectClub={handleNavigateToDatabase} />
        )}
      </main>
    </div>
  );
}
