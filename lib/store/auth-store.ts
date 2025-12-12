'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse } from '../api/auth';
import { authService } from '../api/auth';
import {
  persistSession,
  clearSession,
  getStoredSession,
  getStoredUser,
  getStoredRefreshToken,
  isAccessTokenExpired,
} from '../auth/sessionStorage';
import { showToast } from '../ui/toast';
import { FORCE_LOGOUT_EVENT, ForceLogoutDetail, ForceLogoutReason } from '../auth/forceLogoutEvent';
import { broadcastForceLogoutMessage, subscribeSessionChannel } from '../auth/sessionChannel';
import type { AxiosError } from 'axios';

const HEARTBEAT_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_HEARTBEAT_INTERVAL_MS ?? 240000);

let heartbeatTimer: number | null = null;
let heartbeatInFlight: Promise<void> | null = null;
let forceLogoutInFlight = false;

const detectUnauthorizedError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }
  const axiosError = error as AxiosError;
  if (axiosError?.response?.status === 401) {
    return true;
  }
  const status = (error as any)?.status;
  if (status === 401) {
    return true;
  }
  const message =
    (axiosError?.message || (error as Error)?.message || '')
      .toString()
      .toLowerCase();
  return message.includes('unauthorized') || message.includes('token') || message.includes('expired');
};

const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

const runHeartbeat = async () => {
  if (heartbeatInFlight) {
    return heartbeatInFlight;
  }

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    stopHeartbeat();
    return;
  }

  heartbeatInFlight = authService
    .heartbeat(refreshToken)
    .then((session) => {
      useAuthStore.getState().hydrateSession(session);
    })
    .catch((error) => {
      console.warn('[authStore] Heartbeat failed', error);
      stopHeartbeat();
      if (detectUnauthorizedError(error)) {
        useAuthStore
          .getState()
          .forceLogout({
            reason: 'session-expired',
            message: 'Votre session a expiré. Veuillez vous reconnecter.',
          });
      }
    })
    .finally(() => {
      heartbeatInFlight = null;
    });

  return heartbeatInFlight;
};

const scheduleHeartbeat = () => {
  if (typeof window === 'undefined') return;
  if (!getStoredRefreshToken()) {
    stopHeartbeat();
    return;
  }
  stopHeartbeat();
  heartbeatTimer = window.setInterval(() => {
    runHeartbeat().catch(() => undefined);
  }, HEARTBEAT_INTERVAL_MS);
  runHeartbeat().catch(() => undefined);
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiresAt: string | null;
  refreshExpiresAt: string | null;
  setUser: (user: User | null) => void;
  hydrateSession: (session: LoginResponse) => void;
  login: (session: LoginResponse) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  forceLogout: (options?: ForceLogoutOptions) => void;
}

interface ForceLogoutOptions extends ForceLogoutDetail {
  redirect?: boolean;
  broadcast?: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      sessionExpiresAt: null,
      refreshExpiresAt: null,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      hydrateSession: (session) => {
        persistSession({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expiresAt,
          refreshExpiresAt: session.refreshExpiresAt,
          user: session.user,
        });
        set({
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
          sessionExpiresAt: session.expiresAt ?? null,
          refreshExpiresAt: session.refreshExpiresAt ?? null,
        });
        if (session.refresh_token) {
          scheduleHeartbeat();
        } else {
          stopHeartbeat();
        }
      },

      login: (session) => {
        useAuthStore.getState().hydrateSession(session);
      },

      logout: async () => {
        forceLogoutInFlight = false;
        stopHeartbeat();
        clearSession();
        await authService.logout();
        set({
          user: null,
          isAuthenticated: false,
          sessionExpiresAt: null,
          refreshExpiresAt: null,
        });
      },

      forceLogout: (options?: ForceLogoutOptions) => {
        if (forceLogoutInFlight) {
          return;
        }
        forceLogoutInFlight = true;

        const {
          reason = 'session-expired',
          message,
          silent = false,
          redirect = true,
          broadcast = true,
        } = options || {};

        stopHeartbeat();
        clearSession();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          sessionExpiresAt: null,
          refreshExpiresAt: null,
        });

        if (broadcast) {
          broadcastForceLogoutMessage({
            reason,
            message,
            silent,
            redirect,
          });
        }

        if (!silent) {
          const descriptions: Record<ForceLogoutReason, string> = {
            'session-expired': 'Votre session a expiré. Veuillez vous reconnecter.',
            revoked: 'Votre session a été révoquée pour des raisons de sécurité.',
            security: 'Pour des raisons de sécurité, vous avez été déconnecté.',
            manual: 'Vous avez été déconnecté.',
          };
          showToast({
            title:
              reason === 'session-expired'
                ? 'Session expirée'
                : 'Déconnexion',
            description: message ?? descriptions[reason] ?? descriptions['session-expired'],
            variant: reason === 'security' || reason === 'session-expired' ? 'warning' : 'info',
          });
        }

        const finalize = () => {
          forceLogoutInFlight = false;
        };

        if (redirect && typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login')) {
            const localeAttr =
              document?.documentElement?.getAttribute('lang') || '';
            const localeSegment =
              localeAttr && !localeAttr.startsWith('/')
                ? `/${localeAttr}`
                : localeAttr || '';
            const basePath = localeSegment || '';
            const loginPath = `${basePath}/login`.replace('//', '/');
            const target = new URL(loginPath, window.location.origin);
            target.searchParams.set('reason', reason);
            const delay = silent ? 100 : 1400;
            window.setTimeout(() => {
              window.location.href = target.toString();
              finalize();
            }, delay);
            return;
          }
        }

        finalize();
      },

      checkAuth: async () => {
        const storedUser = getStoredUser();
        const { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } = getStoredSession();

        if (storedUser && accessToken && !isAccessTokenExpired()) {
          set({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
            sessionExpiresAt: accessTokenExpiresAt,
            refreshExpiresAt: refreshTokenExpiresAt,
          });
          if (refreshToken) {
            scheduleHeartbeat();
          } else {
            stopHeartbeat();
          }
          return;
        }

        if (refreshToken) {
          try {
            const session = await authService.refreshSession(refreshToken);
            useAuthStore.getState().hydrateSession(session);
            return;
          } catch (error: any) {
            console.warn('[authStore] Refresh session failed', error);
            // Seulement effacer la session si c'est une vraie erreur 401
            // (pas une erreur réseau ou timeout)
            const isNetworkError = !error?.response && (
              error?.code === 'ECONNABORTED' ||
              error?.message?.includes('Network') ||
              error?.message?.includes('connexion')
            );
            if (!isNetworkError) {
              useAuthStore
                .getState()
                .forceLogout({
                  reason: 'session-expired',
                  message: 'Votre session a expiré. Veuillez vous reconnecter.',
                });
              return;
            } else {
              console.warn('[authStore] Network error during refresh, keeping session');
              // Garder l'état courant si c'est une erreur réseau
              set({ isLoading: false });
              return;
            }
          }
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          sessionExpiresAt: null,
          refreshExpiresAt: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

declare global {
  interface Window {
    __reccosForceLogoutListener?: boolean;
  }
}

if (typeof window !== 'undefined' && !window.__reccosForceLogoutListener) {
  window.__reccosForceLogoutListener = true;
  window.addEventListener(FORCE_LOGOUT_EVENT, (event) => {
    const detail = (event as CustomEvent<ForceLogoutDetail>).detail || {};
    useAuthStore.getState().forceLogout({ ...detail, broadcast: false });
  });

  subscribeSessionChannel((message) => {
    if (message.type === 'FORCE_LOGOUT') {
      useAuthStore.getState().forceLogout({
        ...message.payload,
        broadcast: false,
      });
    }
  });
}

