'use client';

import { useEffect } from 'react';
import { useLenis } from 'lenis/react';
import { useMotionValueEvent, useScroll } from 'framer-motion';

export function DebugScroll() {
  const lenis = useLenis();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (!lenis) return;
    lenis.on('scroll', (e) => {
      console.log('Lenis scroll:', e.animatedScroll, 'progress:', e.progress);
    });
  }, [lenis]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    console.log('Framer scrollYProgress:', v);
  });

  return null;
}

