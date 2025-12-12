import type { User } from '@/lib/types/user';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_EXPIRES_KEY = 'access_token_expires_at';
const REFRESH_EXPIRES_KEY = 'refresh_token_expires_at';
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

export const persistSession = (payload: PersistSessionPayload) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);

  if (payload.refreshToken !== undefined) {
    if (payload.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
      if (payload.refreshExpiresAt) {
        localStorage.setItem(REFRESH_EXPIRES_KEY, payload.refreshExpiresAt);
      } else {
        localStorage.removeItem(REFRESH_EXPIRES_KEY);
      }
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_EXPIRES_KEY);
    }
  } else if (payload.refreshExpiresAt) {
    localStorage.setItem(REFRESH_EXPIRES_KEY, payload.refreshExpiresAt);
  }

  if (payload.expiresAt !== undefined) {
    if (payload.expiresAt) {
      localStorage.setItem(ACCESS_EXPIRES_KEY, payload.expiresAt);
    } else {
      localStorage.removeItem(ACCESS_EXPIRES_KEY);
    }
  }

  if (payload.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  }
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_EXPIRES_KEY);
  localStorage.removeItem(REFRESH_EXPIRES_KEY);
  localStorage.removeItem(USER_KEY);

  // Maintenir la cohérence avec le cookie httpOnly côté serveur
  fetch('/api/auth/clear-cookie', {
    method: 'POST',
    credentials: 'include',
  }).catch((error) => {
    console.warn('[sessionStorage] Failed to clear auth cookie', error);
  });
};

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
    accessTokenExpiresAt: localStorage.getItem(ACCESS_EXPIRES_KEY),
    refreshTokenExpiresAt: localStorage.getItem(REFRESH_EXPIRES_KEY),
  };
};

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

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getStoredAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const isAccessTokenExpired = (bufferMs = 5000): boolean => {
  if (typeof window === 'undefined') return true;
  const expiresAt = localStorage.getItem(ACCESS_EXPIRES_KEY);
  if (!expiresAt) return true;
  const expiresTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresTime)) return true;
  return Date.now() >= expiresTime - bufferMs;
};

