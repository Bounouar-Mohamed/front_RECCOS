import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

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
    console.log('[apiClient] Using API URL from env:', envUrl);
    return envUrl;
  }

  if (!isProduction) {
    // En développement, utiliser le proxy Next.js
    const relativeUrl = '/api';
    console.log('[apiClient] Development mode - Using relative API URL (via Next.js proxy):', relativeUrl);
    console.log('[apiClient] Backend will be proxied through Next.js to:', process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000');
    return relativeUrl;
  }

  // En production, si aucune variable n'est définie, tenter la détection automatique
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'reccos.ae' || hostname === 'www.reccos.ae') {
      const apiUrl = 'https://api.reccos.ae/api';
      console.log('[apiClient] Production mode - Using dedicated API subdomain:', apiUrl);
      console.log('[apiClient] Tip: définissez NEXT_PUBLIC_API_URL dans .env.production pour surcharger cette valeur si besoin.');
      return apiUrl;
    }
  }

  // Fallback: utiliser le proxy même en production
  console.warn('[apiClient] NEXT_PUBLIC_API_URL non défini. Retombée sur le proxy /api.');
  return '/api';
})();

// Instance axios de base
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  // Important : s'assurer que les requêtes sont faites depuis le client
  withCredentials: false,
});

console.log('[apiClient] Axios instance created with baseURL:', API_URL);

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
 * - Après authService.login(), le token est stocké dans localStorage
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
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('[apiClient] Request interceptor:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl,
      hasToken: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,
      isClient: typeof window !== 'undefined',
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'server-side'
    });
    
    // Récupérer le token depuis le storage (côté client uniquement)
    // Le token a été stocké par authService.login() après une connexion réussie
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        // Ajouter le token au header Authorization pour authentifier la requête
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('[apiClient] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => {
    console.log('[apiClient] Response interceptor - success:', {
      status: response.status,
      url: response.config.url,
      hasData: !!response.data
    });
    // Vérifier que la réponse est valide
    if (!response || !response.data) {
      console.warn('[apiClient] Invalid response structure:', response);
    }
    return response;
  },
  async (error: AxiosError) => {
    console.error('[apiClient] Response interceptor - error:', {
      hasResponse: !!error.response,
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      code: error.code
    });
    
    // Erreur réseau (pas de réponse du serveur)
    if (!error.response) {
      console.error('[apiClient] Network error (no response):', {
        code: error.code,
        message: error.message,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          timeout: error.config?.timeout,
          fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
        },
        request: {
          path: error.request?.path,
          host: error.request?.host,
          protocol: error.request?.protocol,
        },
        stack: error.stack,
      });
      const networkError = new Error(
        error.code === 'ECONNABORTED'
          ? 'La requête a pris trop de temps. Vérifiez votre connexion.'
          : 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      );
      return Promise.reject(networkError);
    }

    const status = error.response.status;
    const errorData = error.response.data as ApiError;
    
    console.log('[apiClient] Error details:', {
      status,
      errorData,
      message: errorData?.message
    });

    // 401 Unauthorized - Token expiré ou invalide (mais pas pour les erreurs de login)
    if (status === 401) {
      console.log('[apiClient] 401 Unauthorized error');
      // Ne pas rediriger si on est déjà sur la page de login (c'est une erreur de credentials)
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isLoginPage = currentPath.includes('/login');
      
      console.log('[apiClient] Current path:', currentPath, 'isLoginPage:', isLoginPage);
      
      if (!isLoginPage && typeof window !== 'undefined') {
        console.log('[apiClient] Not on login page, clearing storage and redirecting...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        // Rediriger vers login si on n'est pas déjà sur une page publique
        if (!currentPath.includes('/register')) {
          window.location.href = '/login';
        }
      }
      
      // Toujours propager l'erreur pour que le catch puisse la gérer
      const message = errorData?.message || 'Identifiants invalides';
      console.log('[apiClient] Rejecting with message:', message);
      return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
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










