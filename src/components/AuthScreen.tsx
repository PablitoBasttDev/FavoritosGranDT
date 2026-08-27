import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types.js';
import { TEAMS_DATA } from '../data/teams.js';
import { AVATAR_COLORS, getStoredUsers, loginUser, registerUser, syncUsersWithCloud } from '../utils/userStorage.js';
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [existingUsers, setExistingUsers] = useState<UserProfile[]>(() => getStoredUsers());
  const [mode, setMode] = useState<'login' | 'register'>(
    existingUsers.length === 0 ? 'register' : initialMode
  );

  // Sync users with cloud on load
  useEffect(() => {
    syncUsersWithCloud().then(synced => {
      setExistingUsers(synced);
      if (synced.length > 0 && !loginUsername) {
        setLoginUsername(synced[0].username);
      }
    });
  }, []);

  // Login form state
  const [loginUsername, setLoginUsername] = useState(
    existingUsers.length > 0 ? existingUsers[0].username : ''
  );
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFavoriteClub, setRegFavoriteClub] = useState('');
  const [regAvatarColor, setRegAvatarColor] = useState(AVATAR_COLORS[0]);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick switch user account on login screen
  const handleQuickSelectUser = (user: UserProfile) => {
    setLoginUsername(user.username);
    setLoginPassword('');
    setErrorMessage(null);
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginUser(loginUsername, loginPassword);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Error al iniciar sesión.');
      }
    } catch (err) {
      setErrorMessage('Ocurrió un error inesperado al procesar las credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verificalas.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUser({
        username: regUsername,
        displayName: regDisplayName || regUsername,
        password: regPassword,
        favoriteClub: regFavoriteClub || undefined,
        avatarColor: regAvatarColor,
      });

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'No se pudo crear la cuenta.');
      }
    } catch (err) {
      setErrorMessage('Ocurrió un error al registrar el usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center -mb-1">
            <img
              src="/logo.png"
              alt="El Gran Asistente Logo"
              referrerPolicy="no-referrer"
              className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-widest shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gran DT • Torneo Clausura 2026</span>
          </div>

          <div className="flex flex-col items-center justify-center leading-none space-y-0.5">
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-cyan-300/90">
              EL GRAN
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight uppercase text-white drop-shadow-md">
              ASISTENTE
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Accedé a tu lista personal de favoritos, armado táctico y seguimiento de jugadores protegida con tu usuario y clave.
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl border border-blue-900/50 shadow-2xl p-5 sm:p-6 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Cuenta</span>
            </button>
          </div>

          {/* Privacy Guarantee Pill */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-[11px] leading-tight">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              <strong>100% Seguro y Privado:</strong> No requiere emails ni información sensible. Solo tu usuario y clave.
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Quick User Picker if multiple exist */}
              {existingUsers.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                    Cuentas registradas en este equipo:
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {existingUsers.map(u => {
                      const isSelected = loginUsername.toLowerCase() === u.username.toLowerCase();
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickSelectUser(u)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-blue-900/90 border-cyan-400 text-white ring-1 ring-cyan-400'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: u.avatarColor || '#1b55e2' }}
                          />
                          <span>{u.username}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Usuario</span>
                  <span className="text-[10px] text-slate-500 font-normal">Sin espacios</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    placeholder="Tu nombre de usuario"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Tu contraseña secreta"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                    title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-[#1b55e2] hover:from-blue-500 hover:to-blue-600 active:scale-98 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Ingresar a mis Favoritos</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Username Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Nombre de Usuario <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-500">Único para login (ej: pablo_dt)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value.replace(/\s+/g, ''))}
                    placeholder="pablo_dt, martin99, dt_campeon"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Display Name (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Apodo o Nombre visible (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={regDisplayName}
                  onChange={e => setRegDisplayName(e.target.value)}
                  placeholder="Ej. Pablo DT, Martín G."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full pl-3 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Confirmar Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Repetí la clave"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition font-mono"
                  />
                </div>
              </div>

              {/* Favorite Club (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Club Favorito (Opcional)
                </label>
                <select
                  value={regFavoriteClub}
                  onChange={e => setRegFavoriteClub(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition cursor-pointer"
                >
                  <option value="">Seleccioná tu club...</option>
                  {Object.keys(TEAMS_DATA)
                    .sort()
                    .map(club => (
                      <option key={club} value={club}>
                        {club}
                      </option>
                    ))}
                </select>
              </div>

              {/* Avatar Color Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Color de Avatar
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setRegAvatarColor(color)}
                      className={`w-6 h-6 rounded-full transition transform flex items-center justify-center ${
                        regAvatarColor === color
                          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-110'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {regAvatarColor === color && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Creando cuenta segura...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Crear Usuario y Proteger mi Plantel</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500">
          Liga Profesional de Fútbol AFA • Torneo Clausura 2026 • Gran DT
        </div>
      </div>
    </div>
  );
};
