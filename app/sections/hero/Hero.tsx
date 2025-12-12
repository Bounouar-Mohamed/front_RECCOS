'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { heroStyles } from './hero.styles';
import { HeroSearchForm } from './HeroSearchForm';
import { HeroContent } from './HeroContent';

interface HeroProps {
  isPreloaderComplete: boolean;
}

export const Hero = ({ isPreloaderComplete }: HeroProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [preloaderReady, setPreloaderReady] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  // Vérifier l'état du preloader du layout (data-preloader-ready sur le body)
  useEffect(() => {
    const checkPreloaderReady = () => {
      const isReady = document.body.hasAttribute('data-preloader-ready');
      setPreloaderReady(isReady);
    };

    // Vérifier immédiatement
    checkPreloaderReady();

    // Observer les changements de l'attribut data-preloader-ready
    const observer = new MutationObserver(checkPreloaderReady);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-preloader-ready'],
    });

    return () => observer.disconnect();
  }, []);

  // Précharger l'image pendant le preloader
  useEffect(() => {
    const img = new window.Image();
    img.src = '/images/LayoutReccosV4.png';
    
    // Si l'image est déjà en cache, elle se charge immédiatement
    if (img.complete) {
      setImageLoaded(true);
      return;
    }
    
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      // Même en cas d'erreur, on considère que c'est chargé pour ne pas bloquer
      setImageLoaded(true);
    };
  }, []);

  // Afficher le Hero seulement quand :
  // 1. Le preloader du layout est terminé (data-preloader-ready OU isPreloaderComplete)
  // 2. L'image est chargée
  useEffect(() => {
    const isReady = preloaderReady || isPreloaderComplete;
    if (isReady && imageLoaded) {
      // Petit délai pour s'assurer que le preloader est complètement terminé
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [preloaderReady, isPreloaderComplete, imageLoaded]);

  return (
    <section className={heroStyles.root}>
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            key="hero-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            {/* Gradient Overlay */}
            <motion.div 
              className={heroStyles.gradientOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            />
            
            <div className={heroStyles.imageWrapper}>
              {/* Slogan derrière l'image - boucle infinie */}
              <motion.div 
                className={heroStyles.slogan}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: 1.2, 
                  delay: 1.2,
                  ease: [0.25, 0.1, 0.25, 1] 
                }}
              >
                <div className={heroStyles.sloganTrack}>
                  <span className={heroStyles.sloganText}>RECCOS, Own Together</span>
                  <span className={heroStyles.sloganText}>RECCOS, Own Together</span>
                </div>
              </motion.div>
              
              {/* Image qui monte de bas en haut */}
              <motion.div
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 1.2, 
                  delay: 0.2,
                  ease: [0.25, 0.1, 0.25, 1] 
                }}
              >
                <Image
                  src="/images/LayoutReccosV4.png"
                  alt="Layout Reccos"
                  width={1920}
                  height={1080}
                  priority
                  className={heroStyles.image}
                  quality={100}
                  onLoad={() => setImageLoaded(true)}
                />
              </motion.div>
              
              {/* Contenu Hero */}
              <HeroContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};