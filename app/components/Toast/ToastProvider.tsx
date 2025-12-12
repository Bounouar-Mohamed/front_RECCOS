'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { toastBus, ToastPayload, ToastVariant } from '@/lib/ui/toast';
import {
  containerClass,
  toastCard,
  titleClass,
  descriptionClass,
  closeButton,
  separatorContainer,
  decorativeBar,
  contentContainer,
  designModeToggle,
} from './ToastProvider.styles';

type ToastInternal = ToastPayload & { id: string; variant: ToastVariant };

const toastVariants = {
  initial: { opacity: 0, x: 140, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 160, scale: 0.96 },
};

const toastTransition: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);
  const [designMode, setDesignMode] = useState(false);
  const [hoveredToastId, setHoveredToastId] = useState<string | null>(null);
  const timers = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (payload: ToastPayload) => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      const toast: ToastInternal = {
        id,
        title: payload.title,
        description: payload.description,
        variant: payload.variant ?? 'info',
        duration: payload.duration ?? 4000,
      };
      setToasts((prev) => [toast, ...prev].slice(0, 4));

      // Ne pas créer de timer si le mode design est activé
      if (!designMode) {
        const timer = window.setTimeout(() => removeToast(id), toast.duration);
        timers.current.set(id, timer);
      }
    },
    [removeToast, designMode],
  );

  useEffect(() => {
    const unsubscribe = toastBus.subscribe((toast) => pushToast(toast));
    return () => {
      unsubscribe();
    };
  }, [pushToast]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  // Afficher un toast de démonstration quand le mode design est activé
  useEffect(() => {
    if (designMode) {
      const demoToast: ToastInternal = {
        id: 'design-demo',
        title: 'Toast de démonstration',
        description: 'Ce toast reste affiché pour vérifier le design',
        variant: 'info',
        duration: Infinity,
      };
      setToasts((prev) => {
        const filtered = prev.filter((t) => t.id !== 'design-demo');
        return [demoToast, ...filtered].slice(0, 4);
      });
    } else {
      // Supprimer le toast de démonstration quand le mode design est désactivé
      removeToast('design-demo');
    }
  }, [designMode, removeToast]);

  return (
    <>
      {children}
      {/* <button
        className={designModeToggle}
        onClick={() => setDesignMode((prev) => !prev)}
        type="button"
      >
        {designMode ? 'Désactiver' : 'Activer'} mode design
      </button> */}
      <div className={containerClass}>
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              className={toastCard}
              initial={toastVariants.initial}
              animate={toastVariants.animate}
              exit={toastVariants.exit}
              transition={toastTransition}
              onMouseEnter={() => setHoveredToastId(toast.id)}
              onMouseLeave={() => setHoveredToastId(null)}
            >

              <div className={contentContainer}>
                <div className={titleClass}>{toast.title}</div>
                {toast.description && (
                  <div className={descriptionClass}>{toast.description}</div>
                )}
              </div>

              <button
                aria-label="Fermer"
                className={closeButton}
                onClick={() => removeToast(toast.id)}
                style={{
                  WebkitBackdropFilter: hoveredToastId === toast.id ? 'blur(16px)' : 'blur(12px)',
                }}
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};