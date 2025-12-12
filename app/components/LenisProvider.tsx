'use client';

import { ReactLenis } from 'lenis/react';
import type { LenisRef } from 'lenis/react';
import { frame, cancelFrame } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import 'lenis/dist/lenis.css';

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef | null>(null);

  useEffect(() => {
    function update(data: { timestamp: number }) {
      const time = data.timestamp;
      lenisRef.current?.lenis?.raf(time);
    }

    // On connecte Lenis à la boucle interne de Framer Motion
    frame.update(update, true);

    return () => {
      cancelFrame(update);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,   // Framer drive Lenis
        lerp: 0.1,
        duration: 1.2,
      }}
    >
      {children}
    </ReactLenis>
  );
}