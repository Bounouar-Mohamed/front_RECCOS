/**
 * ===================================================================
 * SERVICE D'AUTHENTIFICATION - GUIDE D'INTÉGRATION API LOGIN
 * ===================================================================
 * 
 * Ce fichier contient tous les services nécessaires pour l'authentification.
 * 
 * POINT D'ENTRÉE PRINCIPAL: authService.login()
 * 
 * COMMENT CONSOMMER L'API DE LOGIN:
 * ==================================
 * 
 * 1. Importez le service:
 *    import { authService } from '@/lib/api/auth';
 * 
 * 2. Appelez la méthode login avec email et password:
 *    const response = await authService.login({
 *      email: 'user@example.com',
 *      password: 'SecurePass123!'
 *    });
 * 
 * 3. La réponse contient les tokens suivants :
 *    - access_token (JWT) à stocker côté client (géré par useAuthStore)
 *    - refresh_token permettant de garder la session active
 *    - L'intercepteur axios ajoute automatiquement le token aux requêtes ultérieures
 * 
 * 4. Les données utilisateur sont stockées dans localStorage ('user')
 * 
 * GESTION DU TOKEN:
 * =================
 * - Le token est automatiquement ajouté au header Authorization
 * - Format: Authorization: Bearer {access_token}
 * - Géré par l'intercepteur dans /lib/api/client.ts
 * - Pas besoin de le gérer manuellement dans vos composants
 * 
 * FLUX 2FA:
 * =========
 * Si l'utilisateur a activé la 2FA:
 * 1. Premier appel sans code → erreur "2FA code required"
 * 2. Afficher le champ pour saisir le code
 * 3. Deuxième appel avec twoFactorCode → succès
 * 
 * Voir les commentaires détaillés sur authService.login() ci-dessous.
 * 
 * ===================================================================
 */

import { apiClient, getErrorMessage } from './client';
import type { ApiResponse } from './client';
import type { AxiosResponse } from 'axios';
import { AxiosError } from 'axios';
import type { User } from '../types/user';
export type { User };
import { clearSession, getStoredUser } from '../auth/sessionStorage';

// Types
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  dateOfBirth: string;
  country: string;
}

/**
 * Interface pour les données de connexion
 * 
 * GUIDE D'INTÉGRATION API LOGIN:
 * ==============================
 * 
 * Endpoint: POST /api/auth/login
 * 
 * Paramètres requis:
 * - email: string (format email valide, validé côté backend avec @IsEmail)
 * - password: string (minimum 6 caractères, validé côté backend avec @MinLength(6))
 * 
 * Paramètre optionnel:
 * - twoFactorCode?: string (requis uniquement si l'utilisateur a activé la 2FA)
 * 
 * Validations backend:
 * - Email doit être au format valide
 * - Password minimum 6 caractères
 * - Compte doit être vérifié (emailVerified = true)
 * - Compte doit être actif (isActive = true)
 * 
 * Protection brute force:
 * - 5 tentatives échouées → compte verrouillé 30 minutes
 * - Message d'erreur: "Account is locked. Try again in X minutes."
 * 
 * Rate limiting:
 * - 5 tentatives par minute par IP
 * - Erreur 429 si dépassé
 */
export interface LoginData {
  email: string;
  password: string;
  twoFactorCode?: string; // Code 2FA (TOTP ou Email) - requis uniquement si 2FA activée
}

/**
 * Interface pour la réponse de connexion
 * 
 * Structure de la réponse (200 OK):
 * {
 *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT token à utiliser dans Authorization header
 *   "user": {
 *     "id": "uuid",
 *     "email": "user@example.com",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "username": "johndoe",
 *     "role": "CLIENT" | "AGENT" | "ADMIN",
 *     "emailVerified": true,
 *     "isActive": true
 *   }
 * }
 * 
 * IMPORTANT: Le token est renvoyé dans la réponse et doit être persisté côté client
 * (le store Zustand `useAuthStore` s'occupe de cette étape). L'intercepteur axios
 * ajoute ensuite automatiquement le token aux requêtes suivantes.
 * Format: Authorization: Bearer {access_token}
 */
export interface LoginResponse {
  access_token: string; // JWT token - à utiliser dans le header Authorization pour les requêtes authentifiées
  refresh_token?: string | null;
  expiresAt?: string;
  refreshExpiresAt?: string;
  user: User;
  session?: {
    lastHeartbeatAt?: string;
    heartbeatIntervalSeconds?: number;
  };
}

/**
 * Vérifie si l'erreur est une erreur 401 Unauthorized confirmée
 */
const isUnauthorizedError = (error: unknown): boolean => {
  if (error instanceof AxiosError && error.response) {
    return error.response.status === 401;
  }
  return false;
};

const normalizeAuthResponse = (payload: any): LoginResponse => {
  const responseData = payload?.data ?? payload;
  if (!responseData) {
    throw new Error('Réponse invalide du serveur');
  }

  const accessToken = responseData.access_token || responseData.accessToken;
  const refreshToken = responseData.refresh_token || responseData.refreshToken || null;
  const user = responseData.user;

  if (!accessToken || !user) {
    throw new Error('Réponse invalide du serveur');
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expiresAt: responseData.expiresAt,
    refreshExpiresAt: responseData.refreshExpiresAt,
    user,
    session: responseData.session,
  };
};

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface Enable2FAData {
  method: 'app' | 'email';
}

export interface Enable2FAResponse {
  method: string;
  secret?: string;
  qrCodeUrl?: string;
  message: string;
}

export interface Verify2FAData {
  code: string;
}

// Services d'authentification
export const authService = {
  /**
   * Inscription
   */
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await apiClient.post<User>('/auth/register', data);
      
      // Vérifier que la réponse contient les données attendues
      if (!response.data || !response.data.id || !response.data.email) {
        throw new Error('Réponse invalide du serveur');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Connexion utilisateur
   * 
   * GUIDE D'UTILISATION:
   * ====================
   * 
   * 1. Appel simple (sans 2FA):
   *    const response = await authService.login({
   *      email: 'user@example.com',
   *      password: 'SecurePass123!'
   *    });
   * 
   * 2. Appel avec 2FA (si l'utilisateur a activé la 2FA):
   *    const response = await authService.login({
   *      email: 'user@example.com',
   *      password: 'SecurePass123!',
   *      twoFactorCode: '123456' // Code TOTP ou code reçu par email
   *    });
   * 
   * 3. Flux avec 2FA en deux étapes:
   *    a) Premier appel sans twoFactorCode:
   *       try {
   *         await authService.login({ email, password });
   *       } catch (error) {
   *         if (error.message === '2FA code required') {
   *           // Afficher le formulaire pour saisir le code 2FA
   *           // L'utilisateur entre le code depuis son app TOTP ou email
   *         }
   *       }
   *    b) Deuxième appel avec le code 2FA:
   *       await authService.login({ email, password, twoFactorCode: '123456' });
   * 
   * GESTION AUTOMATIQUE:
   * - Le token JWT est automatiquement stocké dans localStorage ('access_token')
   * - Les données utilisateur sont stockées dans localStorage ('user')
   * - Le token est automatiquement ajouté aux requêtes suivantes via apiClient
   * - En cas d'erreur, le localStorage est automatiquement nettoyé
   * 
   * ERREURS POSSIBLES:
   * - 401 "Invalid credentials" → Email/mot de passe incorrect
   * - 401 "Email not verified" → L'email n'a pas été vérifié
   * - 401 "Account is not active" → Le compte a été désactivé
   * - 401 "Account is locked. Try again in X minutes." → Trop de tentatives échouées
   * - 401 "2FA code required" → L'utilisateur a la 2FA activée, code requis
   * - 401 "Invalid 2FA code" → Code 2FA incorrect
   * - 401 "Too many failed 2FA attempts" → Trop de tentatives 2FA échouées
   * - 429 "Too many requests" → Rate limiting (5 tentatives/minute)
   * 
   * EXEMPLE D'UTILISATION DANS UN COMPOSANT:
   * ========================================
   * 
   * const handleLogin = async (email: string, password: string) => {
   *   try {
   *     const response = await authService.login({ email, password });
   *     // Succès: token et user stockés automatiquement
   *     // Rediriger vers la page d'accueil ou dashboard
   *     router.push('/dashboard');
   *   } catch (error) {
   *     if (error.message === '2FA code required') {
   *       // Afficher le champ pour le code 2FA
   *       setShow2FAInput(true);
   *     } else {
   *       // Afficher l'erreur à l'utilisateur
   *       setError(error.message);
   *     }
   *   }
   * };
   * 
   * const handle2FALogin = async (email: string, password: string, code: string) => {
   *   try {
   *     const response = await authService.login({ email, password, twoFactorCode: code });
   *     // Succès: rediriger
   *     router.push('/dashboard');
   *   } catch (error) {
   *     setError(error.message);
   *   }
   * };
   * 
   * @param data - Données de connexion (email, password, twoFactorCode optionnel)
   * @returns Promise<LoginResponse> - Token JWT et données utilisateur
   * @throws Error avec message descriptif en cas d'échec
   */
  async login(data: LoginData): Promise<LoginResponse> {
    console.log('[authService] login called with:', { 
      email: data.email, 
      hasPassword: !!data.password,
      has2FACode: !!data.twoFactorCode 
    });
    
    try {
      console.log('[authService] Making POST request to /auth/login...');
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      const normalized = normalizeAuthResponse(response.data);
      console.log('[authService] Login successful, normalized response ready');
      return normalized;
    } catch (error) {
      console.error('[authService] Login error:', error);
      console.error('[authService] Error type:', typeof error);
      console.error('[authService] Error is AxiosError:', (error as any)?.isAxiosError);
      console.error('[authService] Error response:', (error as any)?.response);
      console.error('[authService] Error response data:', (error as any)?.response?.data);
      console.error('[authService] Error response status:', (error as any)?.response?.status);
      
      // Seulement effacer si c'est une vraie erreur 401, pas une erreur réseau
      // (login n'a pas de session à effacer de toute façon, donc on peut l'ignorer)
      
      const errorMessage = getErrorMessage(error);
      console.log('[authService] Error message extracted:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Vérification email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.get<{ message: string }>(`/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Renvoyer email de vérification
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Mot de passe oublié
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Réinitialisation mot de passe
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Activer 2FA
   */
  async enable2FA(data: Enable2FAData): Promise<Enable2FAResponse> {
    try {
      const response = await apiClient.post<Enable2FAResponse>('/auth/enable-2fa', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Vérifier et activer 2FA
   */
  async verify2FA(data: Verify2FAData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/verify-2fa', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Désactiver 2FA
   */
  async disable2FA(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/disable-2fa');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Envoyer un OTP par email (pour login/signup unifié)
   */
  async sendOTP(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/send-otp', { email });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Vérifier un OTP et obtenir le token d'accès
   */
  async verifyOTP(email: string, code: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/verify-otp', { email, code });
      
      // Debug: vérifier la structure de la réponse
      console.log('[authService.verifyOTP] Response structure:', {
        hasResponse: !!response,
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data as any) : [],
        fullData: response?.data
      });
      
      const normalized = normalizeAuthResponse(response.data);
      console.log('[authService.verifyOTP] Successfully extracted data:', {
        hasToken: !!normalized.access_token,
        hasUser: !!normalized.user,
        userId: normalized.user?.id,
      });
      return normalized;
    } catch (error) {
      console.error('[authService.verifyOTP] Error:', error);
      // Ne pas effacer la session pour des erreurs réseau
      // (verifyOTP n'a pas de session à effacer de toute façon)
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Rafraîchir la session à l'aide du refresh token
   */
  async refreshSession(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/refresh', { refreshToken });
      return normalizeAuthResponse(response.data);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Heartbeat pour garder la session active
   */
  async heartbeat(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/heartbeat', { refreshToken });
      return normalizeAuthResponse(response.data);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    clearSession();
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/auth/clear-cookie', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('[authService.logout] Error clearing cookie:', error);
      }
    }
  },

  /**
   * Récupérer l'utilisateur actuel depuis le storage
   */
  getCurrentUser(): User | null {
    return getStoredUser();
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token');
    }
    return false;
  },
};

// URLs OAuth
export const oauthUrls = {
  uaePass: '/api/auth/uae-pass',
  google: '/api/auth/google',
  facebook: '/api/auth/facebook',
  apple: '/api/auth/apple',
};

