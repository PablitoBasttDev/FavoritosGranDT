import React, { useState } from 'react';
import { UserProfile } from '../types.js';
import { TEAMS_DATA } from '../data/teams.js';
import {
  AVATAR_COLORS,
  loginUser,
  registerUser,
  changeUserPassword,
  deleteUserProfile,
} from '../utils/userStorage.js';
import {
  User,
  Users,
  UserPlus,
  Check,
  X,
  Trash2,
  Lock,
  KeyRound,
  ShieldCheck,
  LogOut,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: UserProfile;
  usersList: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onLogout: () => void;
  onUserListUpdated: () => void;
  favoritesCount: number;
  showToast: (msg: string) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  activeUser,
  usersList,
  onSelectUser,
  onLogout,
  onUserListUpdated,
  favoritesCount,
  showToast,
}) => {
  const [tab, setTab] = useState<'profiles' | 'create' | 'password'>('profiles');

  // Switch account password challenge state
  const [switchingToUser, setSwitchingToUser] = useState<UserProfile | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [showSwitchPassword, setShowSwitchPassword] = useState(false);

  // Create new user form state
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newClub, setNewClub] = useState('');
  const [newColor, setNewColor] = useState(AVATAR_COLORS[0]);
  const [createError, setCreateError] = useState<string | null>(null);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmNewPassInput, setConfirmNewPassInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Delete account challenge state
  const [deleteChallengeId, setDeleteChallengeId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle switching into another user account with password
  const handleSwitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchingToUser) return;
    setSwitchError(null);

    const res = await loginUser(switchingToUser.username, switchPassword);
    if (res.success && res.user) {
      onSelectUser(res.user);
      setSwitchingToUser(null);
      setSwitchPassword('');
      onClose();
      showToast(`✓ Sesión cambiada a: ${res.user.name}`);
    } else {
      setSwitchError(res.error || 'Contraseña incorrecta para este usuario.');
    }
  };

  // Handle creating a new account from modal
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (newPassword !== newConfirmPassword) {
      setCreateError('Las contraseñas no coinciden.');
      return;
    }

    const res = await registerUser({
      username: newUsername,
      displayName: newDisplayName || newUsername,
      password: newPassword,
      favoriteClub: newClub || undefined,
      avatarColor: newColor,
    });

    if (res.success && res.user) {
      onSelectUser(res.user);
      onUserListUpdated();
      setNewUsername('');
      setNewDisplayName('');
      setNewPassword('');
      setNewConfirmPassword('');
      setNewClub('');
      onClose();
      showToast(`✓ Nueva cuenta creada y autenticada: ${res.user.name}`);
    } else {
      setCreateError(res.error || 'Error al crear la cuenta.');
    }
  };

  // Handle changing active user's password
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassInput !== confirmNewPassInput) {
      setPasswordError('La confirmación de la nueva contraseña no coincide.');
      return;
    }

    const res = await changeUserPassword(activeUser.id, currentPassword, newPassInput);
    if (res.success) {
      setPasswordSuccess('¡Contraseña actualizada exitosamente!');
      setCurrentPassword('');
      setNewPassInput('');
      setConfirmNewPassInput('');
      showToast('✓ Contraseña actualizada');
    } else {
      setPasswordError(res.error || 'Error al actualizar contraseña.');
    }
  };

  // Handle deleting account
  const handleDeleteAccountSubmit = async (userId: string) => {
    setDeleteError(null);
    const target = usersList.find(u => u.id === userId);
    if (!target) return;

    // Verify password before deletion
    const verifyRes = await loginUser(target.username, deletePassword);
    if (!verifyRes.success) {
      setDeleteError('Contraseña incorrecta para confirmar la eliminación.');
      return;
    }

    const { remainingUsers } = deleteUserProfile(userId);
    onUserListUpdated();
    setDeleteChallengeId(null);
    setDeletePassword('');

    if (activeUser.id === userId) {
      if (remainingUsers.length > 0) {
        // Log out to force credentials for the other account
        onLogout();
        onClose();
        showToast('Cuenta eliminada. Por favor iniciá sesión con otra cuenta.');
      } else {
        onLogout();
        onClose();
        showToast('Cuenta eliminada.');
      }
    } else {
      showToast('Cuenta de usuario eliminada.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#07193b] text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="El Gran Asistente"
              referrerPolicy="no-referrer"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain filter drop-shadow-md shrink-0"
            />
            <div className="flex flex-col justify-center leading-none">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400 leading-tight">
                EL GRAN
              </span>
              <span className="text-base sm:text-lg font-black uppercase tracking-tight text-white leading-none">
                ASISTENTE
              </span>
              <span className="text-[10px] text-blue-200/80 font-semibold mt-0.5">
                Mi Cuenta & Seguridad
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 pt-3 gap-2">
          <button
            onClick={() => {
              setTab('profiles');
              setSwitchingToUser(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              tab === 'profiles'
                ? 'border-[#1b55e2] text-[#1b55e2] dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Cuentas ({usersList.length})</span>
          </button>

          <button
            onClick={() => {
              setTab('create');
              setCreateError(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              tab === 'create'
                ? 'border-[#1b55e2] text-[#1b55e2] dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Otra Cuenta</span>
          </button>

          <button
            onClick={() => {
              setTab('password');
              setPasswordError(null);
              setPasswordSuccess(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              tab === 'password'
                ? 'border-[#1b55e2] text-[#1b55e2] dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Seguridad / Clave</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* 1. PROFILES & SWITCH LIST */}
          {tab === 'profiles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs"
                    style={{ backgroundColor: activeUser.avatarColor || '#1b55e2' }}
                  >
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {activeUser.name}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Conectado
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      @{activeUser.username} • {favoritesCount} futbolistas en lista
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-bold transition flex items-center gap-1.5 border border-rose-200 dark:border-rose-900 cursor-pointer"
                  title="Cerrar sesión y bloquear acceso"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>

              {/* Password Challenge Dialog if switching to another user */}
              {switchingToUser && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                        Ingresar contraseña para @{switchingToUser.username}
                      </span>
                    </div>
                    <button
                      onClick={() => setSwitchingToUser(null)}
                      className="p-1 text-amber-700 hover:text-amber-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {switchError && (
                    <div className="text-[11px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 p-2 rounded-lg border border-rose-200">
                      {switchError}
                    </div>
                  )}

                  <form onSubmit={handleSwitchSubmit} className="space-y-2.5">
                    <div className="relative">
                      <input
                        type={showSwitchPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        value={switchPassword}
                        onChange={e => setSwitchPassword(e.target.value)}
                        placeholder="Contraseña del usuario"
                        className="w-full pl-3 pr-9 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSwitchPassword(!showSwitchPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400"
                      >
                        {showSwitchPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSwitchingToUser(null)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Desbloquear y Acceder</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Accounts list */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Todas las cuentas en este dispositivo ({usersList.length}):
                </span>

                {usersList.map(user => {
                  const isActive = user.id === activeUser.id;
                  const isDeleting = deleteChallengeId === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isActive
                          ? 'border-[#1b55e2] bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-[#1b55e2]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0"
                          style={{ backgroundColor: user.avatarColor || '#1b55e2' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              @{user.username}
                            </span>
                          </div>
                          {user.favoriteClub && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              Hincha de {user.favoriteClub}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950">
                            Activo
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSwitchingToUser(user);
                              setSwitchPassword('');
                              setSwitchError(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Entrar</span>
                          </button>
                        )}

                        {/* Delete button with challenge */}
                        {isDeleting ? (
                          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950 p-1.5 rounded-lg border border-rose-200 dark:border-rose-900">
                            <input
                              type="password"
                              placeholder="Clave"
                              value={deletePassword}
                              onChange={e => setDeletePassword(e.target.value)}
                              className="w-16 px-1.5 py-0.5 text-[10px] rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900"
                            />
                            <button
                              onClick={() => handleDeleteAccountSubmit(user.id)}
                              className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                            >
                              Borrar
                            </button>
                            <button
                              onClick={() => {
                                setDeleteChallengeId(null);
                                setDeletePassword('');
                              }}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setDeleteChallengeId(user.id);
                              setDeletePassword('');
                              setDeleteError(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Eliminar cuenta y su lista"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. CREATE NEW ACCOUNT */}
          {tab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              {createError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de Usuario <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="ej. martin_dt, fede2026"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1b55e2] outline-none text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre o Apodo de DT
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  placeholder="ej. Martín Gómez"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1b55e2] outline-none text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1b55e2] outline-none text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={newConfirmPassword}
                    onChange={e => setNewConfirmPassword(e.target.value)}
                    placeholder="Repetí la clave"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1b55e2] outline-none text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Club Favorito (Opcional)
                </label>
                <select
                  value={newClub}
                  onChange={e => setNewClub(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1b55e2] outline-none text-slate-900 dark:text-white font-medium cursor-pointer"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Color de Avatar
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`w-7 h-7 rounded-full transition transform flex items-center justify-center ${
                        newColor === color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {newColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTab('profiles')}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1b55e2] hover:bg-[#1444b8] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear y Autenticar</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. CHANGE PASSWORD */}
          {tab === 'password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Cambiá la contraseña de acceso para tu cuenta <strong className="text-slate-800 dark:text-slate-200">@{activeUser.username}</strong>.
              </div>

              {passwordError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña Actual <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1b55e2] outline-none text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nueva Contraseña <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={newPassInput}
                  onChange={e => setNewPassInput(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1b55e2] outline-none text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Nueva Contraseña <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={confirmNewPassInput}
                  onChange={e => setConfirmNewPassInput(e.target.value)}
                  placeholder="Repetí la nueva contraseña"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white focus:ring-2 focus:ring-[#1b55e2] outline-none text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTab('profiles')}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1b55e2] hover:bg-[#1444b8] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Actualizar Contraseña</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 px-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Acceso protegido por contraseña</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
