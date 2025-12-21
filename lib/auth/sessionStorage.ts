/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SESSION STORAGE - VERSION SÉCURISÉE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECTURE DE SÉCURITÉ:
 * -------------------------
 * 
 * 1. ACCESS TOKEN: 
 *    - Stocké UNIQUEMENT dans un cookie httpOnly (côté serveur via /api/auth/set-cookie)
 *    - JAMAIS accessible en JavaScript (protection XSS)
 *    - Envoyé automatiquement avec chaque requête (withCredentials: true)
 * 
 * 2. REFRESH TOKEN:
 *    - Stocké en mémoire uniquement (variable sessionRefreshToken)
 *    - Perdu au rechargement de la page (sécurité intentionnelle)
 *    - Utilisé pour renouveler silencieusement la session
 * 
 * 3. DONNÉES UTILISATEUR:
 *    - Stockées en localStorage (non sensible, pour éviter le flicker)
 *    - Cache uniquement, la source de vérité est /api/auth/me
 * 
 * IMPORTANT: Le cookie httpOnly est vérifié par le middleware Next.js
 * et par /api/auth/me pour valider la session.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { User } from '@/lib/types/user';

// ══════════════════════════════════════════════════════════════════════════════
// SÉCURITÉ: Tokens sensibles en mémoire uniquement (pas de localStorage)
// ══════════════════════════════════════════════════════════════════════════════
let sessionRefreshToken: string | null = null;

// Clés localStorage (uniquement pour données non-sensibles)
const USER_KEY = 'user';

// ⚠️ DÉPRÉCIÉ: Ces clés ne sont plus utilisées pour les nouveaux tokens
// Conservées uniquement pour la migration/nettoyage
const LEGACY_ACCESS_TOKEN_KEY = 'access_token';
const LEGACY_REFRESH_TOKEN_KEY = 'refresh_token';

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
 * Persiste les données de session
 * 
 * SÉCURITÉ:
 * - Le access_token n'est PAS stocké ici (géré via cookie httpOnly par le serveur)
 * - Le refresh_token est stocké en mémoire uniquement
 * - Seules les infos utilisateur vont en localStorage
 */
export const persistSession = (payload: PersistSessionPayload) => {
  if (typeof window === 'undefined') return;
  
  // ⚠️ SÉCURITÉ: NE PAS stocker l'access_token en localStorage
  // Le cookie httpOnly est défini par le serveur via /api/auth/set-cookie
  // ou directement dans la réponse de /api/auth/verify-otp
  
  // Stocker le refresh token en mémoire uniquement
  if (payload.refreshToken) {
    sessionRefreshToken = payload.refreshToken;
  }

  // Les infos utilisateur peuvent aller en localStorage (non sensible)
  if (payload.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  }
  
  // Nettoyer les anciennes clés legacy si elles existent
  cleanupLegacyTokens();
};

/**
 * Nettoie les tokens stockés dans l'ancienne architecture (migration)
 */
const cleanupLegacyTokens = () => {
  if (typeof window === 'undefined') return;
  
  // Supprimer les tokens de l'ancienne architecture
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  localStorage.removeItem('access_token_expires_at');
  localStorage.removeItem('refresh_token_expires_at');
};

/**
 * Efface toutes les données de session
 */
export const clearSession = () => {
  if (typeof window === 'undefined') return;
  
  // Effacer le refresh token en mémoire
  sessionRefreshToken = null;
  
  // Effacer les données utilisateur
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('user_cache');
  
  // Nettoyer les anciennes clés legacy
  cleanupLegacyTokens();
  
  // Note: Le cookie httpOnly sera effacé via /api/auth/clear-cookie
};

/**
 * Récupère les métadonnées de session
 * Note: Le access_token n'est plus accessible côté client (cookie httpOnly)
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
    // Le access_token est dans un cookie httpOnly, pas accessible en JS
    // On retourne null ici, les requêtes l'enverront automatiquement via le cookie
    accessToken: null,
    refreshToken: sessionRefreshToken,
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
 * Récupère le refresh token (stocké en mémoire)
 */
export const getStoredRefreshToken = (): string | null => {
  return sessionRefreshToken;
};

/**
 * Récupère l'access token
 * 
 * ⚠️ DÉPRÉCIÉ: Avec l'architecture sécurisée, le access_token
 * n'est plus accessible en JavaScript (cookie httpOnly).
 * Cette fonction retourne null et les requêtes utilisent
 * automatiquement le cookie via withCredentials: true.
 * 
 * Pour la compatibilité pendant la migration, on vérifie
 * aussi l'ancienne clé localStorage.
 */
export const getStoredAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Migration: vérifier l'ancienne clé pour compatibilité
  const legacyToken = localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
  if (legacyToken) {
    // Token legacy - sera migré à la prochaine connexion (pas de log en prod)
    return legacyToken;
  }
  
  // Nouvelle architecture: pas de token accessible côté client
  return null;
};

/**
 * Vérifie si le token d'accès est expiré
 * 
 * NOTE: Avec l'architecture sécurisée, cette vérification
 * se fait côté serveur via le cookie httpOnly.
 * La vraie vérification se fait via /api/auth/me
 */
export const isAccessTokenExpired = (): boolean => {
  // On ne vérifie plus l'expiration côté client
  // La source de vérité est le serveur via /api/auth/me
  return false;
};

/**
 * Vérifie si l'utilisateur a une session potentiellement valide
 * (basé sur la présence de données utilisateur en cache)
 */
export const hasSessionHint = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(USER_KEY);
};
