'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { MobileComingSoon } from './MobileComingSoon';

interface MobileContextType {
  isMobile: boolean;
  isLoading: boolean;
}

const MobileContext = createContext<MobileContextType>({
  isMobile: false,
  isLoading: true,
});

export const useMobile = () => useContext(MobileContext);

export const MobileGuard = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      // Vérifier avec media query
      const mediaQuery = window.matchMedia('(max-width: 1200px)');
      // Vérifier avec user agent (détection supplémentaire)
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'android',
        'webos',
        'iphone',
        'ipad',
        'ipod',
        'blackberry',
        'windows phone',
        'mobile',
      ];

      const isMobileUA = mobileKeywords.some((keyword) =>
        userAgent.includes(keyword),
      );

      // Combiner les deux vérifications - prioriser media query mais considérer user agent
      const isMobileDevice =
        mediaQuery.matches || (isMobileUA && window.innerWidth <= 1200);

      setIsMobile(isMobileDevice);
      setIsLoading(false);
    };

    // Vérification initiale
    checkIsMobile();

    // Écouter les changements de media query
    const mediaQuery = window.matchMedia('(max-width: 1200px)');
    const handleChange = () => checkIsMobile();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback pour les anciens navigateurs
      mediaQuery.addListener(handleChange);
    }

    // Écouter le redimensionnement de la fenêtre
    window.addEventListener('resize', checkIsMobile);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Sur mobile, afficher seulement le message "bientôt disponible"
  if (isMobile) {
    return <MobileComingSoon />;
  }

  // Sur desktop, afficher le contenu normal
  return (
    <MobileContext.Provider value={{ isMobile, isLoading }}>
      {!isLoading && children}
    </MobileContext.Provider>
  );
};


