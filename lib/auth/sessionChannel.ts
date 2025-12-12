'use client';

import { ForceLogoutDetail } from './forceLogoutEvent';

type SessionMessage =
  | {
      type: 'FORCE_LOGOUT';
      payload: ForceLogoutDetail & { redirect?: boolean; silent?: boolean };
      id: string;
    };

const CHANNEL_NAME = 'reccos-auth-channel';
const STORAGE_EVENT_KEY = 'reccos-auth-storage-event';

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const broadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

export const broadcastForceLogoutMessage = (
  payload: ForceLogoutDetail & { redirect?: boolean; silent?: boolean },
) => {
  const message: SessionMessage = {
    type: 'FORCE_LOGOUT',
    payload,
    id: generateId(),
  };

  if (broadcastChannel) {
    broadcastChannel.postMessage(message);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(message));
      window.localStorage.removeItem(STORAGE_EVENT_KEY);
    } catch (error) {
      console.warn('[sessionChannel] Storage broadcast failed', error);
    }
  }
};

export const subscribeSessionChannel = (
  handler: (message: SessionMessage) => void,
) => {
  const listeners: Array<() => void> = [];

  if (broadcastChannel) {
    const onMessage = (event: MessageEvent<SessionMessage>) => {
      if (event?.data) {
        handler(event.data);
      }
    };
    broadcastChannel.addEventListener('message', onMessage);
    listeners.push(() => broadcastChannel.removeEventListener('message', onMessage));
  }

  if (typeof window !== 'undefined') {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_EVENT_KEY && event.newValue) {
        try {
          const message = JSON.parse(event.newValue) as SessionMessage;
          handler(message);
        } catch (error) {
          console.warn('[sessionChannel] Failed to parse storage message', error);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    listeners.push(() => window.removeEventListener('storage', onStorage));
  }

  return () => {
    listeners.forEach((dispose) => dispose());
  };
};


