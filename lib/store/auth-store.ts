'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTH STORE - VERSION SIMPLIFIÉE ET ROBUSTE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PRINCIPE: Cookie httpOnly = source de vérité pour le middleware
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import type { User, LoginResponse } from '../api/auth';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const USER_CACHE_KEY = 'user_cache';

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
 * Définit le cookie httpOnly via l'API route
 * CRITIQUE: Cette fonction DOIT réussir pour que l'auth fonctionne
 */
const setCookieOnServer = async (accessToken: string): Promise<boolean> => {
  try {
    console.log('[authStore] Setting httpOnly cookie...');
    
    const response = await fetch('/api/auth/set-cookie', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken }),
    });
    
    if (!response.ok) {
      console.error('[authStore] Failed to set cookie, status:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('[authStore] Cookie set successfully:', data);
    return true;
  } catch (error) {
    console.error('[authStore] Error setting cookie:', error);
    return false;
  }
};

/**
 * Supprime le cookie httpOnly via l'API route
 */
const clearCookieOnServer = async (): Promise<void> => {
  try {
    await fetch('/api/auth/clear-cookie', {
      method: 'POST',
      credentials: 'include',
    });
    console.log('[authStore] Cookie cleared');
  } catch (error) {
    console.warn('[authStore] Error clearing cookie:', error);
  }
};

/**
 * Nettoie toutes les données d'authentification
 */
const clearAllAuthData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(USER_CACHE_KEY);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  /**
   * Login: définit le cookie ET met à jour le store
   * Retourne true si succès, false si échec
   */
  login: (session: LoginResponse) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUserProfile: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════════

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    setCachedUser(user);
    set({ user, isAuthenticated: !!user });
  },

  login: async (session) => {
    console.log('[authStore] login called', {
      hasUser: !!session.user,
      hasToken: !!session.access_token,
      userEmail: session.user?.email,
    });
    
    if (!session.access_token || !session.user) {
      console.error('[authStore] Missing token or user in session');
      return false;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ÉTAPE 1: Définir le cookie httpOnly EN PREMIER (pour le middleware)
    // ═══════════════════════════════════════════════════════════════════════════
    const cookieSet = await setCookieOnServer(session.access_token);
    
    if (!cookieSet) {
      console.error('[authStore] Failed to set cookie, aborting login');
      return false;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ÉTAPE 2: Mettre à jour le localStorage et le store (APRÈS le cookie)
    // ═══════════════════════════════════════════════════════════════════════════
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', session.access_token);
      if (session.refresh_token) {
        localStorage.setItem('refresh_token', session.refresh_token);
      }
    }
    
    setCachedUser(session.user);
    
    set({
      user: session.user,
      isAuthenticated: true,
      isLoading: false,
    });
    
    console.log('[authStore] login complete - cookie set, store updated');
    return true;
  },

  logout: async () => {
    console.log('[authStore] logout started');
    
    // 1. Mettre à jour le store immédiatement
    set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
    
    // 2. Nettoyer localStorage
    clearAllAuthData();
    
    // 3. Supprimer le cookie côté serveur
    await clearCookieOnServer();
    
    console.log('[authStore] logout completed');
  },

  checkAuth: async () => {
    console.log('[authStore] checkAuth started');
    
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
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          console.log('[authStore] checkAuth: authenticated');
            return;
          }
        }

      // Non authentifié
      console.log('[authStore] checkAuth: not authenticated');
      clearAllAuthData();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

      } catch (error) {
        console.error('[authStore] checkAuth error:', error);
        
      // En cas d'erreur réseau, utiliser le cache
        const cachedUser = getCachedUser();
        if (cachedUser) {
          set({
            user: cachedUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
  },

  refreshUserProfile: async () => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) return;
    
    // Délègue à checkAuth pour rafraîchir le profil
    return get().checkAuth();
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
    });
  }

  // Synchronisation multi-onglets
  window.addEventListener('storage', (event) => {
    if (event.key === USER_CACHE_KEY) {
      try {
        const newUser = event.newValue ? JSON.parse(event.newValue) : null;
        if (newUser) {
          useAuthStore.setState({
            user: newUser,
            isAuthenticated: true,
          });
        } else {
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch {
        // Ignorer
      }
    }
  });
}
