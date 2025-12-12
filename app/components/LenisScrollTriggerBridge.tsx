'use client';

import { useEffect } from 'react';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LenisScrollTriggerBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Désactiver le lag smoothing pour éviter les sauts lors du scroll
    gsap.ticker.lagSmoothing(0);

    // Synchroniser ScrollTrigger avec Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // Définir le proxy pour que ScrollTrigger utilise les valeurs de Lenis
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value);
        } else {
          return lenis.scroll;
        }
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      ScrollTrigger.scrollerProxy(document.body, undefined);
    };
  }, [lenis]);

  return null;
}
