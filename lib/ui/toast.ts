'use client';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastPayload {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastListener = (toast: ToastPayload) => void;

const listeners = new Set<ToastListener>();

export const toastBus = {
  subscribe(listener: ToastListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  emit(toast: ToastPayload) {
    listeners.forEach((listener) => listener(toast));
  },
};

export const showToast = (toast: ToastPayload) => {
  toastBus.emit(toast);
};


