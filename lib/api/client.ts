import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { persistSession, getStoredRefreshToken } from '../auth/sessionStorage';
import { emitForceLogout } from '../auth/forceLogoutEvent';

// ═══════════════════════════════════════════════════════════════════════════════
// SÉCURITÉ: Logger conditionnel - Pas de logs sensibles en production
// ═══════════════════════════════════════════════════════════════════════════════
const isDev = process.env.NODE_ENV !== 'production';
const secureLog = {
  log: (...args: unknown[]) => isDev && console.log('[apiClient]', ...args),
  warn: (...args: unknown[]) => isDev && console.warn('[apiClient]', ...args),
  error: (...args: unknown[]) => console.error('[apiClient]', ...args), // Toujours logger les erreurs
};

/**
 * Configuration de l'URL de l'API
 * 
 * ARCHITECTURE:
 * - Développement: utilise le proxy Next.js (/api) qui redirige vers localhost:3000
 * - Production: utilise directement api.reccos.ae (sous-domaine dédié)
 * 
 * CONFIGURATION (dans .env.local pour dev, .env.production pour prod):
 * - BACKEND_URL=http://localhost:3000 (pour le proxy en dev)
 * - NEXT_PUBLIC_API_URL=https://api.reccos.ae/api (pour la production)
 * 
 * AVANTAGES DU SOUS-DOMAINE API:
 * - Séparation claire frontend/backend
 * - Configuration CORS simplifiée
 * - Meilleure scalabilité
 * - Isolation de sécurité
 */
const API_URL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  // Toujours privilégier la variable d'environnement si elle est définie
  if (envUrl) {
    secureLog.log('Using API URL from env:', envUrl);
    return envUrl;
  }

  if (!isProduction) {
    // En développement, utiliser le proxy Next.js
    const relativeUrl = '/api';
    secureLog.log('Development mode - Using relative API URL (via Next.js proxy):', relativeUrl);
    return relativeUrl;
  }

  // En production, si aucune variable n'est définie, tenter la détection automatique
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'reccos.ae' || hostname === 'www.reccos.ae') {
      const apiUrl = 'https://api.reccos.ae/api';
      return apiUrl;
    }
  }

  // Fallback: utiliser le proxy même en production
  secureLog.warn('NEXT_PUBLIC_API_URL non défini. Retombée sur le proxy /api.');
  return '/api';
})();

type RawAuthResponse = {
  access_token: string;
  refresh_token: string;
  expiresAt?: string;
  refreshExpiresAt?: string;
  user: any;
  session?: {
    lastHeartbeatAt?: string;
    heartbeatIntervalSeconds?: number;
  };
};

// Instance axios de base
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  // IMPORTANT: withCredentials: true pour que les cookies soient envoyés et reçus
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
const refreshQueue: Array<(token: string | null) => void> = [];

const notifyRefreshQueue = (token: string | null) => {
  refreshQueue.splice(0, refreshQueue.length).forEach((callback) => callback(token));
};

const enqueueRefreshCallback = (callback: (token: string | null) => void) => {
  refreshQueue.push(callback);
};

const normalizeAuthPayload = (payload: any): RawAuthResponse => {
  const data = payload?.data ?? payload;
  if (!data?.access_token || !data?.refresh_token || !data?.user) {
    throw new Error('Réponse invalide du serveur');
  }
  return data as RawAuthResponse;
};

const requestNewAccessToken = async (): Promise<string | null> => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await refreshClient.post<RawAuthResponse>('/auth/refresh', { refreshToken });
  const normalized = normalizeAuthPayload(response.data);

  persistSession({
    accessToken: normalized.access_token,
    refreshToken: normalized.refresh_token,
    expiresAt: normalized.expiresAt,
    refreshExpiresAt: normalized.refreshExpiresAt,
    user: normalized.user,
  });

  return normalized.access_token;
};

secureLog.log('Axios instance created with baseURL:', API_URL);

/**
 * Intercepteur pour ajouter automatiquement le token JWT aux requêtes
 * 
 * GUIDE D'INTÉGRATION - GESTION AUTOMATIQUE DU TOKEN:
 * ====================================================
 * 
 * Ce intercepteur ajoute automatiquement le token JWT à toutes les requêtes API.
 * 
 * FONCTIONNEMENT:
 * - Récupère le token depuis localStorage ('access_token')
 * - L'ajoute au header Authorization: Bearer {token}
 * - Fonctionne automatiquement pour toutes les requêtes via apiClient
 * 
 * IMPORTANT POUR L'INTÉGRATION:
 * - Après authentification (gérée via useAuthStore), le token est stocké dans localStorage
 * - Toutes les requêtes suivantes via apiClient incluent automatiquement le token
 * - Pas besoin de gérer manuellement le header Authorization dans vos composants
 * - Le token est valide jusqu'à expiration (géré par le backend)
 * 
 * EXEMPLE:
 * --------
 * // 1. Login (stocke le token automatiquement)
 * await authService.login({ email, password });
 * 
 * // 2. Requête authentifiée (token ajouté automatiquement)
 * const response = await apiClient.get('/users/me');
 * // Le header Authorization: Bearer {token} est ajouté automatiquement
 * 
 * GESTION DES ERREURS:
 * - Si le token est expiré (401), l'intercepteur de réponse gère la déconnexion
 * - Voir l'intercepteur de réponse ci-dessous pour plus de détails
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requiresAuth = config.requiresAuth ?? true;
    config.requiresAuth = requiresAuth;
    const fullUrl = `${config.baseURL}${config.url}`;
    
    // ══════════════════════════════════════════════════════════════════════════════
    // SÉCURITÉ: Authentification via cookie httpOnly + fallback legacy
    // ══════════════════════════════════════════════════════════════════════════════
    // 
    // Nouvelle architecture:
    // - Le access_token est dans un cookie httpOnly (envoyé automatiquement)
    // - withCredentials: true permet l'envoi automatique du cookie
    // 
    // Migration:
    // - Les tokens legacy en localStorage sont encore supportés
    // - Ils seront migrés vers les cookies à la prochaine connexion
    // 
    const legacyToken = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;
    
    secureLog.log('Request:', config.method?.toUpperCase(), config.url);
    
    // Ajouter le token legacy au header Authorization si présent
    // Note: Les nouvelles sessions utilisent le cookie httpOnly (pas besoin de header)
    if (typeof window !== 'undefined' && requiresAuth && legacyToken) {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${legacyToken}`;
      }
      // Token legacy détecté - sera migré à la prochaine connexion
      secureLog.warn('Legacy token detected - will migrate on next login');
    }
    
    return config;
  },
  (error) => {
    secureLog.error('Request interceptor error:', error?.message);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => {
    secureLog.log('Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    secureLog.error('Response error:', error.response?.status, error.config?.url, error.message);
    
    // Erreur réseau (pas de réponse du serveur)
    if (!error.response) {
      secureLog.error('Network error - no response from server');
      const networkError = new Error(
        error.code === 'ECONNABORTED'
          ? 'La requête a pris trop de temps. Vérifiez votre connexion.'
          : 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      );
      return Promise.reject(networkError);
    }

    const status = error.response.status;
    const errorData = error.response.data as ApiError;
    const originalRequest = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
    });
    const requiresAuth = originalRequest?.requiresAuth ?? true;
    const skipAuthRedirect = originalRequest?.skipAuthRedirect ?? false;
    
    secureLog.log('Error status:', status);

    // 401 Unauthorized - Token expiré ou invalide (mais pas pour les erreurs de login)
    if (status === 401) {
      secureLog.log('401 Unauthorized');
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isLoginPage = currentPath.includes('/login');
      const requestUrl = originalRequest?.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/verify-otp') ||
        requestUrl.includes('/auth/send-otp');

      const refreshToken = getStoredRefreshToken();

      if (
        requiresAuth &&
        !isLoginPage &&
        !isAuthEndpoint &&
        refreshToken &&
        originalRequest
      ) {
        if (originalRequest._retry) {
          secureLog.warn('Retry already attempted');
        } else {
          originalRequest._retry = true;

          try {
            if (isRefreshing) {
              secureLog.log('Refresh in progress, queueing');
              return new Promise((resolve, reject) => {
                enqueueRefreshCallback((token) => {
                  if (!token) {
                    reject(new Error('Unable to refresh session'));
                    return;
                  }
                  originalRequest.headers = originalRequest.headers ?? {};
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(apiClient(originalRequest));
                });
              });
            }

            isRefreshing = true;
            const newToken = await requestNewAccessToken();
            isRefreshing = false;

            if (newToken) {
              notifyRefreshQueue(newToken);
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              secureLog.log('Token refreshed, retrying request');
              return apiClient(originalRequest);
            }

            notifyRefreshQueue(null);
          } catch (refreshError: any) {
            secureLog.error('Refresh token failed');
            notifyRefreshQueue(null);
            isRefreshing = false;
            // Seulement effacer si c'est une vraie erreur 401, pas une erreur réseau
            const isNetworkError = !refreshError?.response && (
              refreshError?.code === 'ECONNABORTED' ||
              refreshError?.message?.includes('Network') ||
              refreshError?.message?.includes('connexion')
            );
            if (!isNetworkError) {
              emitForceLogout({
                reason: 'session-expired',
                message: 'Votre session a expiré. Veuillez vous reconnecter.',
              });
            }
          }
        }
      }

      secureLog.log('Path:', currentPath, 'isLogin:', isLoginPage);
      
      // Seulement rediriger si c'est une vraie erreur 401 avec réponse serveur
      // (pas une erreur réseau transitoire lors du hot reload)
      const hasServerResponse = !!error.response;
      if (!isLoginPage && requiresAuth && !skipAuthRedirect && hasServerResponse) {
        emitForceLogout({
          reason: 'session-expired',
          message: 'Votre session a expiré. Veuillez vous reconnecter.',
        });
      }
      
      const message = Array.isArray(errorData?.message)
        ? errorData?.message[0]
        : errorData?.message || 'Identifiants invalides';
      if (error) {
        (error as any).message = message;
      }
      return Promise.reject(error);
    }

    // 429 Too Many Requests - Rate limiting
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const message = retryAfter
        ? `Trop de tentatives. Réessayez dans ${retryAfter} secondes.`
        : 'Trop de tentatives. Réessayez plus tard.';
      return Promise.reject(new Error(message));
    }

    // 400 Bad Request - Erreurs de validation
    if (status === 400) {
      const message = errorData?.message || 'Données invalides';
      return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
    }

    // 403 Forbidden - Accès refusé (propriété non disponible, etc.)
    if (status === 403) {
      const message = errorData?.message || 'Accès refusé';
      return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
    }

    // 500+ Server Error
    if (status >= 500) {
      return Promise.reject(new Error('Erreur serveur. Veuillez réessayer plus tard.'));
    }

    // Autres erreurs - utiliser le message du serveur si disponible
    const message = errorData?.message || error.message || 'Une erreur est survenue';
    return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
  }
);

// Types pour les réponses API
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
}

// Helper pour extraire le message d'erreur
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    if (apiError?.message) {
      return Array.isArray(apiError.message) ? apiError.message[0] : apiError.message;
    }
    return error.message || 'Une erreur est survenue';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Une erreur inconnue est survenue';
}










