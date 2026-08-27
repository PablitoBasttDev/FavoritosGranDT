import { UserProfile, FavoritePlayer } from '../types.js';
import { hashPassword, generateSalt } from './crypto.js';
import { db } from '../firebase.js';
import { hydrateFavorites } from './hydrateFavorites.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

const USERS_STORAGE_KEY = 'gran_dt_users_list_v2';
const ACTIVE_USER_ID_KEY = 'gran_dt_active_user_id_v2';
const FAVORITES_PREFIX = 'gran_dt_user_favorites_';
const GLOBAL_BACKUP_DOC_ID = 'global_latest_backup';

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

export interface CloudSavedListEntry {
  userId: string;
  username?: string;
  displayName?: string;
  avatarColor?: string;
  items: FavoritePlayer[];
  itemsCount: number;
  updatedAt: number;
  source: 'user_favorites' | 'cloud_backup';
}

// Clean username for lookups
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// ----------------------------------------------------
// LOCAL STORAGE CACHE HELPERS & LEGACY MIGRATION
// ----------------------------------------------------

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
    console.error('Error loading stored users from local cache:', e);
  }
  return [];
}

export function saveStoredUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to local cache:', e);
  }
}

export function getActiveUserId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  } catch (e) {
    return null;
  }
}

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

export function getActiveUser(): UserProfile | null {
  const activeId = getActiveUserId();
  if (!activeId) return null;

  const users = getStoredUsers();
  const found = users.find(u => u.id === activeId);
  return found || null;
}

// ----------------------------------------------------
// FIRESTORE CLOUD SYNCHRONIZATION
// ----------------------------------------------------

/**
 * Syncs all users from Firestore to local storage and pushes any unsaved local accounts to Firestore.
 */
export async function syncUsersWithCloud(): Promise<UserProfile[]> {
  try {
    const localUsers = getStoredUsers();
    const querySnapshot = await getDocs(collection(db, 'users'));
    const cloudUsers: UserProfile[] = [];

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data() as UserProfile;
      if (data && data.id && data.username) {
        cloudUsers.push(data);
      }
    });

    // Merge: If local has users not in cloud yet, upload them
    const mergedMap = new Map<string, UserProfile>();

    // Add cloud users first
    for (const u of cloudUsers) {
      mergedMap.set(u.id, u);
    }

    // Check local users
    for (const lu of localUsers) {
      if (!mergedMap.has(lu.id)) {
        mergedMap.set(lu.id, lu);
        // Upload unsynced local user to Firestore
        setDoc(doc(db, 'users', lu.id), lu).catch(err =>
          console.warn('Failed to upload local user to cloud:', err)
        );
      }
    }

    const finalUsers = Array.from(mergedMap.values());
    saveStoredUsers(finalUsers);
    return finalUsers;
  } catch (e) {
    console.warn('Firestore cloud sync notice (using local cache):', e);
    return getStoredUsers();
  }
}

/**
 * Fetch a single user by username from Firestore or local cache.
 */
export async function fetchUserByUsername(username: string): Promise<UserProfile | null> {
  const normUser = normalizeUsername(username);
  if (!normUser) return null;

  // Check cloud first
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    for (const docSnap of querySnapshot.docs) {
      const u = docSnap.data() as UserProfile;
      if (normalizeUsername(u.username) === normUser) {
        // Update local cache
        const local = getStoredUsers();
        const existingIdx = local.findIndex(x => x.id === u.id);
        if (existingIdx >= 0) {
          local[existingIdx] = u;
        } else {
          local.push(u);
        }
        saveStoredUsers(local);
        return u;
      }
    }
  } catch (e) {
    console.warn('Could not query Firestore for username, fallback to local:', e);
  }

  // Fallback to local
  const users = getStoredUsers();
  return users.find(u => normalizeUsername(u.username) === normUser) || null;
}

// ----------------------------------------------------
// AUTHENTICATION & USER ACTIONS
// ----------------------------------------------------

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
    return {
      success: false,
      error: 'El usuario solo puede contener letras, números, guiones y puntos (sin espacios).',
    };
  }

  if (!password || password.length < 4) {
    return { success: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
  }

  // Sync latest users to check uniqueness
  const existingUser = await fetchUserByUsername(normUser);
  if (existingUser) {
    return {
      success: false,
      error: `El usuario "${username}" ya está registrado. Elegí otro o iniciá sesión.`,
    };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const now = Date.now();

  const userId = 'user_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  const newUser: UserProfile = {
    id: userId,
    username: username.trim(),
    name: displayName?.trim() || username.trim(),
    passwordHash,
    salt,
    favoriteClub,
    avatarColor: avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    createdAt: now,
    lastActive: now,
  };

  // 1. Save locally for instant UI
  const users = getStoredUsers();
  users.push(newUser);
  saveStoredUsers(users);
  setActiveUserId(newUser.id);
  saveUserFavorites(newUser.id, []);

  // 2. Persist to Firestore Cloud permanently
  try {
    await setDoc(doc(db, 'users', newUser.id), sanitizeForFirestore(newUser));
    await setDoc(doc(db, 'user_favorites', newUser.id), sanitizeForFirestore({
      userId: newUser.id,
      items: [],
      updatedAt: now,
    }));
  } catch (e) {
    console.error('Error saving user to Firestore (saved locally):', e);
  }

  return { success: true, user: newUser };
}

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

  // Look up user from cloud (with local fallback)
  const user = await fetchUserByUsername(normUser);

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

  // Save to local cache
  const localUsers = getStoredUsers();
  const idx = localUsers.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    localUsers[idx] = user;
  } else {
    localUsers.push(user);
  }
  saveStoredUsers(localUsers);
  setActiveUserId(user.id);

  // Sync to Firestore in background
  try {
    updateDoc(doc(db, 'users', user.id), { lastActive: user.lastActive }).catch(() => {});
  } catch (e) {
    // Ignore offline update error
  }

  return { success: true, user };
}

export function logoutUser(): void {
  setActiveUserId(null);
}

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

  // Update in Firestore
  try {
    await updateDoc(doc(db, 'users', user.id), {
      salt: newSalt,
      passwordHash: newHash,
      lastActive: user.lastActive,
    });
  } catch (e) {
    console.error('Error updating password in Firestore:', e);
  }

  return { success: true };
}

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

  // Update in Firestore
  try {
    updateDoc(doc(db, 'users', userId), sanitizeForFirestore({
      name: users[index].name,
      favoriteClub: users[index].favoriteClub,
      avatarColor: users[index].avatarColor,
      lastActive: users[index].lastActive,
    })).catch(() => {});
  } catch (e) {
    console.error('Error updating profile metadata in Firestore:', e);
  }

  return users[index];
}

export function deleteUserProfile(userId: string): { remainingUsers: UserProfile[]; deleted: boolean } {
  let users = getStoredUsers();
  const filtered = users.filter(u => u.id !== userId);

  try {
    localStorage.removeItem(FAVORITES_PREFIX + userId);
  } catch (e) {
    console.error('Error removing user favorites from localStorage:', e);
  }

  saveStoredUsers(filtered);

  if (getActiveUserId() === userId) {
    setActiveUserId(null);
  }

  // Delete from Firestore
  try {
    deleteDoc(doc(db, 'users', userId)).catch(() => {});
    deleteDoc(doc(db, 'user_favorites', userId)).catch(() => {});
  } catch (e) {
    console.error('Error deleting user from Firestore:', e);
  }

  return { remainingUsers: filtered, deleted: true };
}

// ----------------------------------------------------
// FAVORITES CLOUD & LOCAL STORAGE
// ----------------------------------------------------

export function getUserFavorites(userId: string): FavoritePlayer[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(FAVORITES_PREFIX + userId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return hydrateFavorites(parsed);
      }
    }
  } catch (e) {
    console.error('Error loading favorites for user ' + userId, e);
  }
  return [];
}

export async function fetchUserFavoritesFromCloud(
  userId: string,
  username?: string
): Promise<FavoritePlayer[]> {
  if (!userId && !username) return [];
  try {
    // 1. Try fetching by canonical userId
    if (userId) {
      const docSnap = await getDoc(doc(db, 'user_favorites', userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const hydrated = hydrateFavorites(data.items);
          saveUserFavorites(userId, hydrated, false, username);
          return hydrated;
        }
      }
    }

    // 2. If no items found by userId and username is provided, look up by username
    if (username) {
      const norm = normalizeUsername(username);
      
      // 2a. Check if a doc named by the username directly exists
      try {
        const byUsernameDoc = await getDoc(doc(db, 'user_favorites', norm));
        if (byUsernameDoc.exists()) {
          const data = byUsernameDoc.data();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            const hydrated = hydrateFavorites(data.items);
            if (userId) {
              saveUserFavorites(userId, hydrated, true, username);
            }
            return hydrated;
          }
        }
      } catch (e) {
        // Continue fallback search
      }

      // 2b. Query all user_favorites to match username or userId in data payload
      const allFavsSnap = await getDocs(collection(db, 'user_favorites'));
      for (const d of allFavsSnap.docs) {
        const data = d.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const dUsername = data.username ? normalizeUsername(data.username) : '';
          const dUserId = data.userId || '';
          
          if (
            (dUsername && dUsername === norm) ||
            (userId && dUserId === userId) ||
            d.id.toLowerCase() === norm ||
            (userId && d.id === userId)
          ) {
            const hydrated = hydrateFavorites(data.items);
            if (userId) {
              saveUserFavorites(userId, hydrated, true, username);
            }
            return hydrated;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch favorites from cloud, fallback to local:', e);
  }
  return userId ? getUserFavorites(userId) : [];
}

export function saveUserFavorites(
  userId: string,
  favorites: FavoritePlayer[],
  syncToCloud = true,
  username?: string
): void {
  if (!userId) return;
  const hydrated = hydrateFavorites(favorites);

  // 1. Save locally
  try {
    localStorage.setItem(FAVORITES_PREFIX + userId, JSON.stringify(hydrated));
  } catch (e) {
    console.error('Error saving favorites for user ' + userId, e);
  }

  // 2. Save to Firestore Cloud
  if (syncToCloud) {
    try {
      const payload: any = {
        userId,
        items: hydrated,
        updatedAt: Date.now(),
      };
      if (username) {
        payload.username = username;
      }
      setDoc(
        doc(db, 'user_favorites', userId),
        sanitizeForFirestore(payload),
        { merge: true }
      ).catch(err => {
        console.warn('Failed to sync favorites to Firestore:', err);
      });
    } catch (e) {
      console.error('Error initiating cloud save of favorites:', e);
    }
  }
}

// ----------------------------------------------------
// ALL CLOUD LISTS DISCOVERY & BACKUP RESTORATION
// ----------------------------------------------------

/**
 * Scans Firestore for all saved lists in user_favorites and returns them
 * so any user or session can inspect and restore their saved squads.
 */
export async function fetchAllCloudSavedLists(): Promise<CloudSavedListEntry[]> {
  const results: CloudSavedListEntry[] = [];
  const users = await syncUsersWithCloud();
  const userMap = new Map<string, UserProfile>();
  users.forEach(u => userMap.set(u.id, u));

  try {
    const snap = await getDocs(collection(db, 'user_favorites'));
    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        const userId = docSnap.id;
        const profile = userMap.get(userId);
        const hydrated = hydrateFavorites(data.items);

        results.push({
          userId,
          username: profile?.username || data.username || undefined,
          displayName: profile?.name || data.displayName || undefined,
          avatarColor: profile?.avatarColor,
          items: hydrated,
          itemsCount: hydrated.length,
          updatedAt: data.updatedAt || Date.now(),
          source: 'user_favorites',
        });
      }
    });

    // Sort by most recently updated
    results.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (e) {
    console.error('Error fetching all cloud saved lists:', e);
  }

  return results;
}

/**
 * Generates an exportable JSON payload of the favorites list.
 */
export function exportFavoritesToJSON(
  favorites: FavoritePlayer[],
  userProfile?: UserProfile | null
): string {
  const payload = {
    appName: 'El Gran Asistente - Gran DT Clausura 2026',
    exportDate: new Date().toISOString(),
    user: userProfile ? { username: userProfile.username, name: userProfile.name } : undefined,
    count: favorites.length,
    favorites: favorites.map(f => ({
      id: f.id,
      nombre: f.nombre,
      equipo: f.equipo,
      posicion: f.posicion,
      precioNum: f.precioNum,
      notes: f.notes,
      addedAt: f.addedAt,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Imports and parses a JSON string of favorites.
 */
export function parseFavoritesFromJSON(rawJson: string): FavoritePlayer[] {
  try {
    const parsed = JSON.parse(rawJson);
    let items: any[] = [];
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && Array.isArray(parsed.favorites)) {
      items = parsed.favorites;
    } else if (parsed && Array.isArray(parsed.items)) {
      items = parsed.items;
    }

    return hydrateFavorites(items);
  } catch (e) {
    console.error('Failed to parse favorites JSON:', e);
    throw new Error('El formato del archivo o texto no es un JSON válido de favoritos.');
  }
}
