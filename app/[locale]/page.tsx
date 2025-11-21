'use client';

import { useEffect, useState } from 'react';
import { skiper8Styles } from './home.styles';
import HomeLandingPage from './home/HomeLandingPage';

const HomePage = () => {
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false);

  useEffect(() => {
    // Vérifier si le preloader a été affiché (géré par PreloaderWrapper dans le layout)
    const hasShownPreloader = sessionStorage.getItem('preloader-shown');
    
    if (hasShownPreloader) {
      // Si le preloader a déjà été affiché, on considère que c'est complet
      setIsPreloaderComplete(true);
    } else {
      // Sinon, attendre que le preloader se termine
    // Calcul du temps total de l'animation :
    // - 8 mots : 1000ms (premier) + 7 * 150ms = 2050ms
    // - Animation de sortie : delay 0.2s + duration 0.8s = 1000ms
    // - Total : ~3050ms
      const preloaderDuration = 1000 + (8 - 1) * 150; // Temps pour tous les mots
    const exitAnimationDelay = 200; // delay de l'animation de sortie
    const exitAnimationDuration = 800; // duration de l'animation de sortie
    const totalDuration = preloaderDuration + exitAnimationDelay + exitAnimationDuration;

    const completeTimer = window.setTimeout(() => {
      setIsPreloaderComplete(true);
    }, totalDuration);

    return () => {
      window.clearTimeout(completeTimer);
    };
    }
  }, []);

  return (
    <main className={skiper8Styles.main}>
      <HomeLandingPage isPreloaderComplete={isPreloaderComplete} />
    </main>
  );
};

export default HomePage;