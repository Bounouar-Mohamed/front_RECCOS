'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { scrollAnimationStyles } from './scrollAnimation.styles';



export const ScrollAnimation = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('home.scrollAnimation');
    const punchlines = ['line1', 'line2', 'line3', 'line4', 'line5', 'line6'] as const;
    const [viewportWidth, setViewportWidth] = useState<number>(0);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const handleResize = () => setViewportWidth(window.innerWidth);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const textSamples = useMemo(
        () => [
            t('title'),
            ...punchlines.map((lineKey) => t(`lines.${lineKey}`)),
        ],
        [t, punchlines]
    );

    const longestTextLength = useMemo(() => {
        return textSamples.reduce((max, text) => Math.max(max, text.length), 0);
    }, [textSamples]);

    const adaptiveFontSize = useMemo(() => {
        if (!viewportWidth || !longestTextLength) {
            return undefined;
        }

        const isSmallMobile = viewportWidth < 480;
        const isMobile = viewportWidth < 768;
        const minSize = isSmallMobile ? 26 : isMobile ? 30 : 40;
        const maxSize = isSmallMobile ? 42 : isMobile ? 56 : 86;

        const compressionFactor = isSmallMobile ? 0.78 : isMobile ? 0.85 : viewportWidth >= 1440 ? 1.25 : 1.05;
        const estimatedSize = (viewportWidth / Math.max(longestTextLength, 12)) * compressionFactor;

        const clampedSize = Math.max(minSize, Math.min(maxSize, estimatedSize));
        return `${clampedSize}px`;
    }, [viewportWidth, longestTextLength]);

    const sharedLineHeight = useMemo(() => {
        if (!viewportWidth) return 1.15;
        if (viewportWidth < 480) return 1.35;
        if (viewportWidth < 768) return 1.28;
        return 1.15;
    }, [viewportWidth]);

    const sharedTextStyle = useMemo(() => {
        if (!adaptiveFontSize) {
            return { lineHeight: sharedLineHeight };
        }
        return {
            fontSize: adaptiveFontSize,
            lineHeight: sharedLineHeight,
        };
    }, [adaptiveFontSize, sharedLineHeight]);

    const { scrollYProgress: containerProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    const scale = useTransform(containerProgress, [0.1, 1], [1, 0.5]);

    return (
        <div ref={containerRef} className={scrollAnimationStyles.container}>

            <motion.div
                style={{
                    scale: scale,
                }}
                className={scrollAnimationStyles.stickyHeader}
            >
                <div className={scrollAnimationStyles.stickyWrapper}>
                    <h1 className={scrollAnimationStyles.title} style={sharedTextStyle}>
                        {t('title')}
                    </h1>
                    <div className={scrollAnimationStyles.topOverlay} />
                    <div className={scrollAnimationStyles.bottomOverlay} />
                </div>
                <div className={scrollAnimationStyles.textList}>
                    {punchlines.map((lineKey) => (
                        <h2
                            key={lineKey}
                            className={scrollAnimationStyles.textItem}
                            style={sharedTextStyle}
                        >
                            {t(`lines.${lineKey}`)}
                        </h2>
                    ))}
                </div>
              
            </motion.div>
            {/* espace de scroll invisible pour que l'animation ait de la matière */}
        </div>
    );
};