import React, { useState } from 'react';
import {
  BookmarkCheck,
  Database,
  Shield,
  BarChart3,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Users,
  UserCheck,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { FavoritePlayer, UserProfile } from '../types';
import { ALL_PLAYERS } from '../data/players';

interface NavbarProps {
  activeTab: 'favorites' | 'players' | 'clubs' | 'stats';
  setActiveTab: (tab: 'favorites' | 'players' | 'clubs' | 'stats') => void;
  favorites: FavoritePlayer[];
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  activeUser: UserProfile;
  onOpenUserModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favorites,
  darkMode,
  setDarkMode,
  isDrawerOpen,
  setIsDrawerOpen,
  activeUser,
  onOpenUserModal,
  onLogout,
}) => {
  const navTabs = [
    {
      id: 'favorites' as const,
      label: 'Mis Favoritos (Scouting)',
      badge: favorites.length > 0 ? favorites.length : undefined,
    },
    {
      id: 'players' as const,
      label: `Base de Jugadores (${ALL_PLAYERS.length})`,
    },
    {
      id: 'stats' as const,
      label: 'Estadísticas y Valores',
    },
  ];

  return (
    <>
      {/* COMPACT GRAN DT HEADER (Official Style) */}
      <header className="sticky top-0 z-40 bg-[#07193b] text-white border-b border-blue-900/60 shadow-md">
        <div className="max-w-[1920px] mx-auto px-2 sm:px-5 flex items-center justify-between h-12 sm:h-20">
          {/* Left: Gran DT Logo & Navigation Tabs */}
          <div className="flex items-center gap-2 sm:gap-6 h-full">
            {/* Logo El Gran Asistente */}
            <div
              onClick={() => setActiveTab('favorites')}
              className="flex items-center gap-1.5 sm:gap-3.5 cursor-pointer select-none group py-0.5"
            >
              <img
                src="/logo.png"
                alt="El Gran Asistente"
                referrerPolicy="no-referrer"
                className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain shrink-0 filter drop-shadow-lg group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex flex-col justify-center leading-none">
                <span className="text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] text-cyan-300 leading-tight">
                  EL GRAN
                </span>
                <span className="text-sm sm:text-xl md:text-2xl font-black italic uppercase tracking-tight text-white leading-none group-hover:text-cyan-300 transition-colors">
                  ASISTENTE
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-blue-200/80 tracking-wider mt-1">
                  Gran DT · Clausura 2026
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links with Gran DT Cyan Underline */}
            <nav className="hidden md:flex items-center gap-1 h-full">
              {navTabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-full px-3 text-xs font-bold flex items-center gap-1.5 transition relative border-b-2 ${
                      isActive
                        ? 'border-cyan-400 text-cyan-300 font-black'
                        : 'border-transparent text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className="bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black shadow-xs">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: User Profile Chip, Theme Controls & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* User Profile Access Button & Quick Logout */}
            <div className="flex items-center gap-1 bg-blue-950/80 rounded-lg border border-blue-800/60 p-0.5">
              <button
                onClick={onOpenUserModal}
                id="user-account-button"
                className="px-2 py-1 rounded-md hover:bg-blue-900/80 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Administrar cuenta y cambiar contraseña"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
                  style={{ backgroundColor: activeUser.avatarColor || '#1b55e2' }}
                >
                  {activeUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-start text-left leading-none max-w-[90px] sm:max-w-[120px]">
                  <span className="truncate text-[11px] font-bold text-cyan-300">
                    {activeUser.name}
                  </span>
                  <span className="truncate text-[9px] text-slate-400 font-mono">
                    @{activeUser.username}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              <button
                onClick={onLogout}
                className="p-1 rounded-md text-slate-400 hover:text-rose-300 hover:bg-rose-950/60 transition cursor-pointer"
                title="Cerrar sesión (Bloquear acceso)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-2 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-slate-200 hover:text-white transition flex items-center gap-1 border border-blue-700/40 text-xs font-semibold"
              title={darkMode ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline text-[11px]">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="hidden lg:inline text-[11px]">Oscuro</span>
                </>
              )}
            </button>

            {/* Mobile / Quick Menu Button */}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-1.5 rounded-lg bg-blue-900/60 text-slate-200 hover:text-white hover:bg-blue-800 transition md:hidden flex items-center"
              title="Menú"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="md:hidden flex items-center border-t border-blue-900/80 bg-[#051430] overflow-x-auto px-2 py-1 gap-1">
          {navTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  isActive
                    ? 'bg-cyan-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-blue-950'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1 py-0.2 rounded text-[9px] font-black ${
                      isActive ? 'bg-slate-950 text-cyan-300' : 'bg-blue-800 text-cyan-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
};
