'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { liquidRingStyles } from './liquidRing.styles';

export const LiquidRing = () => {
  const t = useTranslations('home.button');
  const locale = useLocale();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const totalFrames = 31; // noor.png + noor(1).png à noor(150).png
  const fps = 8; // 30 images par seconde
  const frameDuration = 6000 / fps; // ~33.33ms par frame

  // Précharger les images pour une animation fluide
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises: Promise<void>[] = [];
      
      for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        const src = i === 0 
          ? '/animations/NoorIA/noor.png'
          : `/animations/NoorIA/noor(${i}).png`;
        
        const promise = new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue même si une image échoue
          img.src = src;
        });
        
        imagePromises.push(promise);
      }
      
      await Promise.all(imagePromises);
      setImagesLoaded(true);
    };

    preloadImages();
  }, [totalFrames]);

  // Animation en boucle avec requestAnimationFrame pour une meilleure fluidité
  useEffect(() => {
    if (!imagesLoaded) return;

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const elapsed = currentTime - lastTimeRef.current;

      if (elapsed >= frameDuration) {
        setCurrentFrame((prev) => {
          const next = (prev + 1) % totalFrames;
          return next;
        });
        lastTimeRef.current = currentTime - (elapsed % frameDuration);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [totalFrames, imagesLoaded, frameDuration]);

  const getImageSrc = (frame: number) => {
    if (frame === 0) {
      return '/animations/NoorIA/noor.png';
    }
    return `/animations/NoorIA/noor(${frame}).png`;
  };

  // Précharger la prochaine image pour éviter les saccades
  const nextFrame = (currentFrame + 1) % totalFrames;
  useEffect(() => {
    if (imagesLoaded) {
      const nextImg = new Image();
      nextImg.src = getImageSrc(nextFrame);
    }
  }, [currentFrame, imagesLoaded, nextFrame, totalFrames]);

  return (
    <div className={liquidRingStyles.container}>
      <div className={liquidRingStyles.logoContainer}>
        {imagesLoaded ? (
          <img
            src={getImageSrc(currentFrame)}
            alt="Noor AI Logo Animation"
            className={liquidRingStyles.image}
            style={{
              imageRendering: 'auto',
              willChange: 'contents',
            }}
          />
        ) : (
          <div className={liquidRingStyles.image} />
        )}
      </div>
      <Link href={`/${locale}/login`} className={liquidRingStyles.button}>
        {t('discover')}
      </Link>
    </div>
  );
};
