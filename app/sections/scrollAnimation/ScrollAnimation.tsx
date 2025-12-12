'use client';

import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { scrollAnimationStyles } from './scrollAnimation.styles';

const TEAM_NAMES = [
  'Gurvinder Singh',
  'Not gxuri',
  'Jane Smith',
  'Emily Chen',
  'Carlos Ramirez',
  'Ava Patel',
  "Liam O'Brien",
  'Sophia Müller',
  'Noah Kim',
  'Mia Rossi',
  'Lucas Silva',
  'Olivia Dubois',
  'Ethan Zhang',
  'Chloe Ivanova',
  'Mateo Garcia',
  'Isabella Rossi',
  'William Lee',
  'Zara Ahmed',
  'Benjamin Cohen',
  'Hana Suzuki',
];

const PUNCHLINES = ['line1', 'line2', 'line3', 'line4', 'line5', 'line6'] as const;

export const ScrollAnimation = () => {
  const cardsRef = useRef<HTMLDivElement>(null); // ≈ containerRef de Skiper
  const t = useTranslations('home.scrollAnimation');

  const [viewportWidth, setViewportWidth] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Vérifier que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mesure du viewport (pour adapter la taille du texte, comme tu faisais)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const textSamples = useMemo(
    () => [
      t('title'),
      ...PUNCHLINES.map((key) => t(`lines.${key}`)),
    ],
    [t],
  );

  const longestTextLength = useMemo(
    () => textSamples.reduce((max, text) => Math.max(max, text.length), 0),
    [textSamples],
  );

  const adaptiveFontSize = useMemo(() => {
    if (!viewportWidth || !longestTextLength) return undefined;

    const isSmallMobile = viewportWidth < 480;
    const isMobile = viewportWidth < 768;

    const minSize = isSmallMobile ? 26 : isMobile ? 30 : 40;
    const maxSize = isSmallMobile ? 42 : isMobile ? 56 : 86;

    const compressionFactor =
      isSmallMobile ? 0.78 : isMobile ? 0.85 : viewportWidth >= 1440 ? 1.25 : 1.05;

    const estimatedSize =
      (viewportWidth / Math.max(longestTextLength, 12)) * compressionFactor;

    const clampedSize = Math.max(minSize, Math.min(maxSize, estimatedSize));
    return `${clampedSize}px`;
  }, [viewportWidth, longestTextLength]);

  const sharedLineHeight = useMemo(() => {
    if (!viewportWidth) return 1.15;
    if (viewportWidth < 480) return 1.35;
    if (viewportWidth < 768) return 1.28;
    return 1.15;
  }, [viewportWidth]);

  const sharedTextStyle = useMemo(
    () =>
      adaptiveFontSize
        ? { fontSize: adaptiveFontSize, lineHeight: sharedLineHeight }
        : { lineHeight: sharedLineHeight },
    [adaptiveFontSize, sharedLineHeight],
  );

  // === LE POINT CLÉ : même logique que Skiper44 ===
  // Utiliser useScroll seulement après le montage pour éviter les problèmes d'hydratation
  const { scrollYProgress: containerProgress } = useScroll({
    target: isMounted ? cardsRef : undefined,
    offset: ['start end', 'end start'],
  });

  const titleScale = useTransform(containerProgress, [0.2, 1], [1, 0.5]);
  const blurValue = useTransform(containerProgress, [0.2, 0.8], [0, 20]);
  const cardsScale = useTransform(containerProgress, [0, 0.3], [0.98, 1]);
  const blurFilter = useMotionTemplate`blur(${blurValue}px)`;

  const teamSections = useMemo(
    () => [
      {
        label: 'Brand Design',
        members: TEAM_NAMES.slice(0, 5),
      },
      {
        label: 'Design Engineers',
        members: TEAM_NAMES,
      },
    ],
    [],
  );

  return (
    <div ref={cardsRef} className={scrollAnimationStyles.container}>
      {/* HEADER STICKY — exactement comme Skiper44 */}
      <motion.div
        // style={{ scale: titleScale }}
        className={scrollAnimationStyles.stickyHeader}
      >
        {/* Colonne titre sticky à 50% avec overlays */}
        <div className={scrollAnimationStyles.titleColumn}>
          <h1 className={scrollAnimationStyles.title} style={sharedTextStyle}>
            {t('title')}
          </h1>
          <div className={scrollAnimationStyles.topOverlay} />
          <div className={scrollAnimationStyles.bottomOverlay} />
        </div>

        {/* Colonne punchlines qui défilent “naturellement” */}
        <div className={scrollAnimationStyles.linesColumn}>
          {PUNCHLINES.map((lineKey) => (
            <h2
              key={lineKey}
              className={scrollAnimationStyles.lineItem}
              style={sharedTextStyle}
            >
              {t(`lines.${lineKey}`)}
            </h2>
          ))}
        </div>

      </motion.div>
    </div>
  );
};