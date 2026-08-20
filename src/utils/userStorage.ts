import { UserProfile, FavoritePlayer } from '../types';
import { hashPassword, generateSalt } from './crypto';

const USERS_STORAGE_KEY = 'gran_dt_users_list_v2';
const ACTIVE_USER_ID_KEY = 'gran_dt_active_user_id_v2';
const FAVORITES_PREFIX = 'gran_dt_user_favorites_';

export const AVATAR_COLORS = [
  '#1b55e2', // Gran DT Blue
  '#059669', // Emerald
  '#dc2626', // Red
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#db2777', // Pink
  '#475569', // Slate
];

// Clean username for lookups
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

// Get all stored user accounts
export function getStoredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored users:', e);
  }
  return [];
}

// Save all user accounts
export function saveStoredUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage:', e);
  }
}

// Get active user ID (returns null if logged out)
export function getActiveUserId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  } catch (e) {
    return null;
  }
}

// Set or clear active user ID
export function setActiveUserId(userId: string | null): void {
  try {
    if (userId) {
      localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
    } else {
      localStorage.removeItem(ACTIVE_USER_ID_KEY);
    }
  } catch (e) {
    console.error('Error setting active user id:', e);
  }
}

// Get the currently authenticated active user (or null if not logged in)
export function getActiveUser(): UserProfile | null {
  const activeId = getActiveUserId();
  if (!activeId) return null;

  const users = getStoredUsers();
  const found = users.find(u => u.id === activeId);
  return found || null;
}

// Register a new user account with Username + Password (NO EMAIL)
export async function registerUser({
  username,
  displayName,
  password,
  favoriteClub,
  avatarColor,
}: {
  username: string;
  displayName?: string;
  password: string;
  favoriteClub?: string;
  avatarColor?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const normUser = normalizeUsername(username);

  if (!normUser || normUser.length < 3) {
    return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres.' };
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(normUser)) {
    return { success: false, error: 'El usuario solo puede contener letras, números, guiones y puntos (sin espacios).' };
  }

  if (!password || password.length < 4) {
    return { success: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
  }

  const users = getStoredUsers();

  // Check if username is already taken
  const exists = users.some(u => normalizeUsername(u.username) === normUser);
  if (exists) {
    return { success: false, error: `El usuario "${username}" ya está registrado. Elegí otro o iniciá sesión.` };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const now = Date.now();

  const newUser: UserProfile = {
    id: 'user_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
    username: username.trim(),
    name: displayName?.trim() || username.trim(),
    passwordHash,
    salt,
    favoriteClub,
    avatarColor: avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    createdAt: now,
    lastActive: now,
  };

  users.push(newUser);
  saveStoredUsers(users);
  setActiveUserId(newUser.id);

  // Initialize empty favorites list for the new user
  saveUserFavorites(newUser.id, []);

  return { success: true, user: newUser };
}

// Login user verifying Username and Password
export async function loginUser(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const normUser = normalizeUsername(usernameInput);

  if (!normUser) {
    return { success: false, error: 'Por favor ingresá tu nombre de usuario.' };
  }

  if (!passwordInput) {
    return { success: false, error: 'Por favor ingresá tu contraseña.' };
  }

  const users = getStoredUsers();
  const user = users.find(u => normalizeUsername(u.username) === normUser);

  if (!user) {
    return { success: false, error: 'Usuario no encontrado. Verificá los datos o creá una cuenta nueva.' };
  }

  // Verify password hash
  const computedHash = await hashPassword(passwordInput, user.salt);
  if (computedHash !== user.passwordHash) {
    return { success: false, error: 'Contraseña incorrecta. Por favor volvé a intentar.' };
  }

  // Update last active
  user.lastActive = Date.now();
  saveStoredUsers(users);
  setActiveUserId(user.id);

  return { success: true, user };
}

// Logout current user (locks screen)
export function logoutUser(): void {
  setActiveUserId(null);
}

// Change user password
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
  }

  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    return { success: false, error: 'Usuario no encontrado.' };
  }

  const user = users[index];
  const computedCurrentHash = await hashPassword(currentPassword, user.salt);

  if (computedCurrentHash !== user.passwordHash) {
    return { success: false, error: 'La contraseña actual no es correcta.' };
  }

  const newSalt = generateSalt();
  const newHash = await hashPassword(newPassword, newSalt);

  user.salt = newSalt;
  user.passwordHash = newHash;
  user.lastActive = Date.now();

  saveStoredUsers(users);
  return { success: true };
}

// Update profile metadata (name, favoriteClub, avatarColor)
export function updateUserProfileMetadata(
  userId: string,
  data: { name?: string; favoriteClub?: string; avatarColor?: string }
): UserProfile | null {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    name: data.name?.trim() || users[index].name,
    favoriteClub: data.favoriteClub !== undefined ? data.favoriteClub : users[index].favoriteClub,
    avatarColor: data.avatarColor || users[index].avatarColor,
    lastActive: Date.now(),
  };

  saveStoredUsers(users);
  return users[index];
}

// Delete user account and all their private favorites
export function deleteUserProfile(userId: string): { remainingUsers: UserProfile[]; deleted: boolean } {
  let users = getStoredUsers();
  const filtered = users.filter(u => u.id !== userId);

  try {
    localStorage.removeItem(FAVORITES_PREFIX + userId);
  } catch (e) {
    console.error('Error removing user favorites:', e);
  }

  saveStoredUsers(filtered);

  if (getActiveUserId() === userId) {
    setActiveUserId(null);
  }

  return { remainingUsers: filtered, deleted: true };
}

// Load isolated favorites for a specific user ID strictly
export function getUserFavorites(userId: string): FavoritePlayer[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(FAVORITES_PREFIX + userId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading favorites for user ' + userId, e);
  }
  return [];
}

// Save isolated favorites for a specific user ID strictly
export function saveUserFavorites(userId: string, favorites: FavoritePlayer[]): void {
  if (!userId) return;
  try {
    localStorage.setItem(FAVORITES_PREFIX + userId, JSON.stringify(favorites));
  } catch (e) {
    console.error('Error saving favorites for user ' + userId, e);
  }
}
