'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTH STORE - VERSION ROBUSTE AVEC REFRESH AUTOMATIQUE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PRINCIPE UNIQUE DE VÉRITÉ: Le cookie httpOnly vérifié par /api/auth/me
 * 
 * FONCTIONNALITÉS:
 * - Refresh automatique des tokens en arrière-plan
 * - Gestion propre de la déconnexion (pas de boucle infinie)
 * - Synchronisation multi-onglets
 * - Cache local pour éviter le flash
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import type { User, LoginResponse } from '../api/auth';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const USER_CACHE_KEY = 'user_cache';
const SESSION_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes (avant expiration du token)
const LOGOUT_TIMEOUT = 3000; // 3 secondes max pour le logout

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const getCachedUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const setCachedUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_CACHE_KEY);
  }
};

/**
 * Nettoie toutes les données d'authentification de manière synchrone
 * et appelle le serveur pour supprimer les cookies (avec timeout)
 */
const clearAllAuthData = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  console.log('[authStore] Clearing all auth data');
  
  // 1. Nettoyer localStorage immédiatement (synchrone)
  localStorage.removeItem(USER_CACHE_KEY);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('access_token_expires_at');
  localStorage.removeItem('refresh_token_expires_at');
  localStorage.removeItem('user');
  
  // 2. Supprimer les cookies httpOnly côté serveur (avec timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LOGOUT_TIMEOUT);
    
    await fetch('/api/auth/clear-cookie', {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log('[authStore] Cookies cleared successfully');
  } catch (err) {
    // Ignorer les erreurs - le localStorage est déjà nettoyé
    console.warn('[authStore] Cookie clear failed (ignored):', err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION REFRESH MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

let refreshIntervalId: NodeJS.Timeout | null = null;
let isRefreshing = false;

/**
 * Tente de rafraîchir le token d'accès en utilisant le refresh token
 * Retourne true si le refresh a réussi, false sinon
 */
const attemptTokenRefresh = async (): Promise<{ success: boolean; user?: User }> => {
  if (typeof window === 'undefined') return { success: false };
  
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    console.log('[authStore] No refresh token available for refresh');
    return { success: false };
  }
  
  console.log('[authStore] Attempting token refresh with refresh token...');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch('/api/auth/refresh-cookie', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        console.log('[authStore] Token refresh successful');
        
        // Mettre à jour le refresh token si un nouveau est fourni
        if (data.newRefreshToken) {
          localStorage.setItem('refresh_token', data.newRefreshToken);
        }
        
        return { success: true, user: data.user };
      }
    }
    
    console.log('[authStore] Token refresh failed', { status: response.status });
    return { success: false };
    
  } catch (error) {
    console.warn('[authStore] Token refresh error:', error);
    return { success: false };
  }
};

const startSessionRefresh = () => {
  if (typeof window === 'undefined') return;
  
  // Éviter les intervalles multiples
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }
  
  console.log('[authStore] Starting session refresh interval');
  
  refreshIntervalId = setInterval(async () => {
    if (isRefreshing) return;
    
    const { isAuthenticated, isLoggingOut } = useAuthStore.getState();
    if (!isAuthenticated || isLoggingOut) {
      stopSessionRefresh();
      return;
    }
    
    isRefreshing = true;
    console.log('[authStore] Refreshing session in background...');
    
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          // Session valide - mettre à jour le cache
          setCachedUser(data.user);
          useAuthStore.setState({ user: data.user });
          console.log('[authStore] Session refreshed successfully');
        } else {
          // Token expiré mais on a peut-être un refresh token
          console.log('[authStore] Access token expired, attempting refresh...');
          
          const refreshResult = await attemptTokenRefresh();
          
          if (refreshResult.success && refreshResult.user) {
            // Refresh réussi - mettre à jour le cache et l'état
            setCachedUser(refreshResult.user);
            useAuthStore.setState({ user: refreshResult.user });
            console.log('[authStore] Session restored via refresh token');
          } else {
            // Refresh token aussi expiré - déconnexion propre
            console.log('[authStore] Refresh token expired, logging out gracefully');
            stopSessionRefresh();
            
            // Déconnexion en douceur (pas de blocage)
            const { isLoggingOut: stillLoggingOut } = useAuthStore.getState();
            if (!stillLoggingOut) {
              await useAuthStore.getState().logout();
            }
          }
        }
      } else if (response.status === 401) {
        // Session vraiment expirée - tenter un refresh
        console.log('[authStore] Got 401, attempting refresh...');
        
        const refreshResult = await attemptTokenRefresh();
        
        if (!refreshResult.success) {
          console.log('[authStore] Session completely expired');
          stopSessionRefresh();
          
          const { isLoggingOut: stillLoggingOut } = useAuthStore.getState();
          if (!stillLoggingOut) {
            await useAuthStore.getState().logout();
          }
        }
      }
    } catch (error) {
      console.warn('[authStore] Session refresh error (will retry):', error);
    } finally {
      isRefreshing = false;
    }
  }, SESSION_REFRESH_INTERVAL);
};

const stopSessionRefresh = () => {
  if (refreshIntervalId) {
    console.log('[authStore] Stopping session refresh interval');
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  
  login: (session: LoginResponse) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUserProfile: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════════

export const useAuthStore = create<AuthState>()((set, get) => ({
  // État initial : toujours isLoading: true, le checkAuth() va résoudre
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isLoggingOut: false,

  setUser: (user) => {
    console.log('[authStore] setUser:', user?.email);
    setCachedUser(user);
    set({ user, isAuthenticated: !!user });
  },

  login: (session) => {
    console.log('[authStore] login called', {
      hasUser: !!session.user,
      hasToken: !!session.access_token,
      userEmail: session.user?.email,
    });
    
    const user = session.user;
    
    // Persister le user dans le cache
    setCachedUser(user);
    
    // Persister les tokens dans localStorage (pour backup/debug)
    if (typeof window !== 'undefined') {
      if (session.access_token) {
        localStorage.setItem('access_token', session.access_token);
      }
      if (session.refresh_token) {
        localStorage.setItem('refresh_token', session.refresh_token);
      }
    }
    
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      isLoggingOut: false,
    });
    
    // Démarrer le refresh automatique
    startSessionRefresh();
    
    console.log('[authStore] login complete, session refresh started');
  },

  logout: async () => {
    const { isLoggingOut } = get();
    
    // Éviter les appels multiples
    if (isLoggingOut) {
      console.log('[authStore] logout already in progress, skipping');
      return;
    }
    
    console.log('[authStore] logout started');
    
    // 1. Arrêter le refresh automatique IMMÉDIATEMENT
    stopSessionRefresh();
    
    // 2. Marquer comme en cours de déconnexion et mettre à jour l'état immédiatement
    // CRITIQUE: isLoading DOIT être false pour éviter le chargement infini
    set({
      isLoggingOut: true,
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
    
    // 3. Nettoyer les données de manière asynchrone mais avec une garantie de completion
    // Utiliser Promise.race pour s'assurer que ça ne bloque jamais plus de LOGOUT_TIMEOUT
    try {
      await Promise.race([
        clearAllAuthData(),
        new Promise(resolve => setTimeout(resolve, LOGOUT_TIMEOUT)),
      ]);
    } catch (error) {
      // Ignorer les erreurs - l'état est déjà nettoyé
      console.warn('[authStore] Error during cleanup (ignored):', error);
    }
    
    // 4. Finaliser - TOUJOURS exécuté
    set({ isLoggingOut: false });
    
    console.log('[authStore] logout completed');
  },

  checkAuth: async () => {
    const { isLoggingOut } = get();
    
    // Ne pas vérifier si on est en train de se déconnecter
    if (isLoggingOut) {
      console.log('[authStore] checkAuth skipped (logging out)');
      set({ isLoading: false }); // Assurer qu'on ne reste pas en chargement
      return;
    }
    
    console.log('[authStore] checkAuth started');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('[authStore] checkAuth response:', {
        status: response.status,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[authStore] checkAuth data:', {
          authenticated: data.authenticated,
          hasUser: !!data.user,
          userEmail: data.user?.email,
        });
        
        if (data.authenticated && data.user) {
          setCachedUser(data.user);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Démarrer le refresh automatique
          startSessionRefresh();
          
          console.log('[authStore] checkAuth: authenticated, refresh started');
          return;
        }
        
        // Token expiré - tenter un refresh si on a un refresh token
        console.log('[authStore] checkAuth: token expired, attempting refresh...');
        
        const refreshResult = await attemptTokenRefresh();
        
        if (refreshResult.success && refreshResult.user) {
          setCachedUser(refreshResult.user);
          set({
            user: refreshResult.user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Démarrer le refresh automatique
          startSessionRefresh();
          
          console.log('[authStore] checkAuth: authenticated via refresh, refresh started');
          return;
        }
      }

      // Non authentifié - nettoyer proprement (pas de refresh token ou refresh échoué)
      console.log('[authStore] checkAuth: not authenticated, cleaning up');
      stopSessionRefresh();
      setCachedUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

    } catch (error) {
      console.error('[authStore] checkAuth error:', error);
      
      // En cas d'erreur réseau, utiliser le cache local si disponible
      const cachedUser = getCachedUser();
      if (cachedUser) {
        console.log('[authStore] checkAuth: using cached user due to network error');
        set({
          user: cachedUser,
          isAuthenticated: true,
          isLoading: false,
        });
        // Ne pas démarrer le refresh si on utilise le cache (erreur réseau)
      } else {
        // CRITIQUE: Toujours mettre isLoading à false pour éviter le blocage
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }
  },

  refreshUserProfile: async () => {
    const { isLoggingOut, isAuthenticated } = get();
    
    if (isLoggingOut || !isAuthenticated) {
      return;
    }
    
    console.log('[authStore] refreshUserProfile called');
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setCachedUser(data.user);
          set({ user: data.user });
          console.log('[authStore] refreshUserProfile: updated');
        }
      }
    } catch (error) {
      console.warn('[authStore] refreshUserProfile error:', error);
    }
  },
}));

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALISATION CÔTÉ CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  // Hydrater le store avec le cache local au chargement
  const cachedUser = getCachedUser();
  if (cachedUser) {
    console.log('[authStore] Hydrating from cache:', cachedUser.email);
    useAuthStore.setState({
      user: cachedUser,
      isAuthenticated: true,
      // isLoading reste true jusqu'à ce que checkAuth() confirme
    });
  }

  // Synchronisation multi-onglets
  window.addEventListener('storage', (event) => {
    if (event.key === USER_CACHE_KEY) {
      try {
        const newUser = event.newValue ? JSON.parse(event.newValue) : null;
        console.log('[authStore] Storage event, syncing:', newUser?.email);
        
        if (newUser) {
          useAuthStore.setState({
            user: newUser,
            isAuthenticated: true,
          });
        } else {
          // Un autre onglet s'est déconnecté
          stopSessionRefresh();
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch {
        // Ignorer les erreurs de parsing
      }
    }
  });

  // Écouter les événements de déconnexion forcée
  window.addEventListener('reccos:force-logout', () => {
    console.log('[authStore] Force logout event received');
    useAuthStore.getState().logout();
  });
  
  // Nettoyer à la fermeture de la page
  window.addEventListener('beforeunload', () => {
    stopSessionRefresh();
  });
  
  // Reprendre le refresh quand la page redevient visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const { isAuthenticated, isLoggingOut } = useAuthStore.getState();
      if (isAuthenticated && !isLoggingOut) {
        console.log('[authStore] Page visible, checking auth...');
        useAuthStore.getState().checkAuth();
      }
    } else {
      // Arrêter le refresh quand la page est cachée
      stopSessionRefresh();
    }
  });
}