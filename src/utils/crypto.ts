/**
 * Utilidades criptográficas para hashing seguro de contraseñas usando la Web Crypto API nativa.
 * No requiere librerías externas ni almacena contraseñas en texto plano.
 */

export async function hashPassword(password: string, salt: string): Promise<string> {
  if (!password) return '';
  const text = `${salt}__GRAN_DT_AUTH_2026__${password}`;
  
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    try {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Fallback to secondary hash:', e);
    }
  }

  // Fallback simple hash determinístico si subtle crypto no estuviera disponible
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fb_' + Math.abs(hash).toString(16) + text.length;
}

export function generateSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}
