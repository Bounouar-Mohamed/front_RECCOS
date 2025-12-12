'use client';

export type ForceLogoutReason = 'session-expired' | 'revoked' | 'security' | 'manual';

export interface ForceLogoutDetail {
  reason?: ForceLogoutReason;
  message?: string;
  silent?: boolean;
}

export const FORCE_LOGOUT_EVENT = 'reccos:force-logout';

export const emitForceLogout = (detail: ForceLogoutDetail) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FORCE_LOGOUT_EVENT, { detail }));
};


