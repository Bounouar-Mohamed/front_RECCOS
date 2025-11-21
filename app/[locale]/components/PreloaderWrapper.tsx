'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Preloader_002 } from './Preloader';

const words = [
  'Hello',
  'bonjour',
  'Ciao',
  'Olà',
  'やあ',
  'Hallå',
  'Guten tag',
  'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ',
];

const PRELOADER_SHOWN_KEY = 'preloader-shown';

// Fonction pour vérifier sessionStorage de manière synchrone (côté client uniquement)
const shouldShowPreloader = (): boolean => {
  if (typeof window === 'undefined') return true; // Côté serveur, on assume qu'on doit montrer le preloader
  const hasShownPreloader = sessionStorage.getItem(PRELOADER_SHOWN_KEY);
  return !hasShownPreloader;
};

export const PreloaderWrapper = () => {
  // Initialiser avec la vérification synchrone pour éviter le flash
  const shouldShow = shouldShowPreloader();
  const [showPreloader, setShowPreloader] = useState(shouldShow);
  // Si le preloader ne doit pas être affiché, on est prêt immédiatement
  const [isReady, setIsReady] = useState(!shouldShow);

  useEffect(() => {
    // Vérifier si le preloader a déjà été affiché dans cette session
    const hasShownPreloader = sessionStorage.getItem(PRELOADER_SHOWN_KEY);
    
    if (!hasShownPreloader) {
      // Afficher le preloader seulement au premier chargement
      setShowPreloader(true);
      
      // Calcul du temps total de l'animation :
      // - 8 mots : 1000ms (premier) + 7 * 150ms = 2050ms
      // - Animation de sortie : delay 0.2s + duration 0.8s = 1000ms
      // - Total : ~3050ms
      const preloaderDuration = 1000 + (words.length - 1) * 150; // Temps pour tous les mots
      const exitAnimationDelay = 200; // delay de l'animation de sortie

      const hideTimer = window.setTimeout(() => {
        setShowPreloader(false);
        // Marquer que le preloader a été affiché
        sessionStorage.setItem(PRELOADER_SHOWN_KEY, 'true');
        setIsReady(true);
      }, preloaderDuration + exitAnimationDelay);

      return () => {
        window.clearTimeout(hideTimer);
      };
    } else {
      // Si le preloader a déjà été affiché, on est prêt immédiatement
      setIsReady(true);
    }
  }, []);

  // Exposer l'état isReady via un attribut data sur le body pour le CSS
  useEffect(() => {
    if (isReady) {
      document.body.setAttribute('data-preloader-ready', 'true');
    } else {
      document.body.removeAttribute('data-preloader-ready');
    }
  }, [isReady]);

  return (
    <AnimatePresence mode="wait">
      {showPreloader && <Preloader_002 />}
    </AnimatePresence>
  );
};

