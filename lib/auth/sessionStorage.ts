/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SESSION STORAGE - VERSION SIMPLIFIÉE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce fichier gère le stockage local des tokens pour les requêtes API.
 * 
 * NOTE: La source de vérité reste le cookie httpOnly vérifié par /api/auth/me
 * Le localStorage sert uniquement à :
 * 1. Stocker le token pour les headers axios (authentification API)
 * 2. Cacher les infos user pour éviter le flicker
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { User } from '@/lib/types/user';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export interface PersistSessionPayload {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string;
  refreshExpiresAt?: string;
  user?: User;
}

export interface StoredSessionMetadata {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
}

/**
 * Persiste les tokens de session
 * Appelé après un login/verify-otp réussi
 */
export const persistSession = (payload: PersistSessionPayload) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);

  if (payload.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
  }

  if (payload.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  }
};

/**
 * Efface toutes les données de session
 */
export const clearSession = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('user_cache');
  
  // Anciennes clés (pour compatibilité)
  localStorage.removeItem('access_token_expires_at');
  localStorage.removeItem('refresh_token_expires_at');
};

/**
 * Récupère les métadonnées de session
 */
export const getStoredSession = (): StoredSessionMetadata => {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
    };
  }

  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
  };
};

/**
 * Récupère l'utilisateur stocké
 */
export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

/**
 * Récupère le refresh token
 */
export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Récupère l'access token
 */
export const getStoredAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Vérifie si le token d'accès est expiré
 * NOTE: Avec la nouvelle architecture, cette fonction retourne toujours false
 * car on ne stocke plus la date d'expiration côté client.
 * La vraie vérification se fait via /api/auth/me
 */
export const isAccessTokenExpired = (): boolean => {
  // On ne vérifie plus l'expiration côté client
  // La source de vérité est le serveur via /api/auth/me
  return false;
};
