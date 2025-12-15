'use client';

/**
 * AuthHydrator - Composant pour hydrater l'état d'authentification au chargement
 * 
 * Ce composant s'exécute une seule fois au montage pour vérifier
 * l'état d'authentification via /api/auth/me
 * 
 * GARANTIE: Si checkAuth ne répond pas dans 15 secondes, on force isLoading à false
 * pour éviter tout chargement infini.
 */

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

const AUTH_CHECK_TIMEOUT = 15000; // 15 secondes max pour la vérification

export function AuthHydrator() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Éviter les vérifications multiples
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    
    // Vérifier l'authentification au montage
    console.log('[AuthHydrator] Starting auth check');
    
    // Timeout de sécurité pour éviter le chargement infini
    const timeoutId = setTimeout(() => {
      const { isLoading } = useAuthStore.getState();
      if (isLoading) {
        console.warn('[AuthHydrator] Auth check timeout, forcing isLoading to false');
        useAuthStore.setState({ isLoading: false });
      }
    }, AUTH_CHECK_TIMEOUT);
    
    checkAuth().finally(() => {
      clearTimeout(timeoutId);
      console.log('[AuthHydrator] Auth check completed');
    });
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [checkAuth]);

  // Ce composant ne rend rien
  return null;
}




