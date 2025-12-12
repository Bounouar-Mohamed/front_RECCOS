'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { css } from '@/styled-system/css';
import { cn } from '@/lib/utils';
import { AudioState } from '@/lib/realtime/types';

interface AudioVisualizerProps {
  /** État audio actuel */
  audioState: AudioState;
  /** Volume d'entrée (0-1) */
  inputVolume?: number;
  /** Volume de sortie (0-1) */
  outputVolume?: number;
  /** Nombre de barres */
  barCount?: number;
  /** Variante de style */
  variant?: 'bars' | 'wave' | 'circle';
  /** Taille */
  size?: 'sm' | 'md' | 'lg';
  /** Classe CSS additionnelle */
  className?: string;
}

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
  }),

  containerSm: css({
    height: '24px',
  }),

  containerMd: css({
    height: '40px',
  }),

  containerLg: css({
    height: '60px',
  }),

  bar: css({
    width: '4px',
    borderRadius: '2px',
    transformOrigin: 'center',
    transition: 'background-color 0.3s ease',
  }),

  barListening: css({
    backgroundColor: '#3b82f6',
  }),

  barSpeaking: css({
    backgroundColor: '#10b981',
  }),

  barThinking: css({
    backgroundColor: '#f59e0b',
    animation: 'wave-animation 1s ease-in-out infinite',
  }),

  barIdle: css({
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  }),

  // Variante cercle
  circleContainer: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  circle: css({
    borderRadius: '50%',
    transition: 'all 0.15s ease-out',
  }),

  circleInner: css({
    position: 'absolute',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }),

  // Variante onde
  waveContainer: css({
    position: 'relative',
    overflow: 'hidden',
  }),

  wavePath: css({
    fill: 'none',
    strokeWidth: '2',
    strokeLinecap: 'round',
  }),

  wavePathListening: css({
    stroke: '#3b82f6',
  }),

  wavePathSpeaking: css({
    stroke: '#10b981',
  }),
};

// Composant de visualisation en barres
function BarsVisualizer({
  audioState,
  volume,
  barCount,
  size,
}: {
  audioState: AudioState;
  volume: number;
  barCount: number;
  size: 'sm' | 'md' | 'lg';
}) {
  const heights = useMemo(() => {
    const baseHeight = size === 'sm' ? 8 : size === 'md' ? 16 : 24;
    const maxHeight = size === 'sm' ? 24 : size === 'md' ? 40 : 60;

    return [...Array(barCount)].map((_, i) => {
      if (audioState === 'idle') {
        return baseHeight;
      }

      // Créer une variation naturelle entre les barres
      const phase = (i / barCount) * Math.PI * 2;
      const variation = Math.sin(phase + Date.now() / 200) * 0.3 + 0.7;
      const heightRatio = volume * variation;

      return Math.max(baseHeight, Math.min(maxHeight, baseHeight + (maxHeight - baseHeight) * heightRatio));
    });
  }, [audioState, volume, barCount, size]);

  const barStyle = useMemo(() => {
    switch (audioState) {
      case 'listening':
        return styles.barListening;
      case 'speaking':
        return styles.barSpeaking;
      case 'thinking':
        return styles.barThinking;
      default:
        return styles.barIdle;
    }
  }, [audioState]);

  const containerSizeStyle = size === 'sm' ? styles.containerSm : size === 'md' ? styles.containerMd : styles.containerLg;

  return (
    <div className={cn(styles.container, containerSizeStyle)}>
      {heights.map((height, i) => (
        <motion.div
          key={i}
          className={cn(styles.bar, barStyle)}
          animate={{ height }}
          transition={{
            duration: 0.1,
            ease: 'easeOut',
          }}
          style={{
            animationDelay: audioState === 'thinking' ? `${i * 0.1}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}

// Composant de visualisation en cercle
function CircleVisualizer({
  audioState,
  volume,
  size,
}: {
  audioState: AudioState;
  volume: number;
  size: 'sm' | 'md' | 'lg';
}) {
  const baseSize = size === 'sm' ? 40 : size === 'md' ? 60 : 80;
  const scale = 1 + volume * 0.3;

  const color = useMemo(() => {
    switch (audioState) {
      case 'listening':
        return 'rgba(59, 130, 246, 0.6)';
      case 'speaking':
        return 'rgba(16, 185, 129, 0.6)';
      case 'thinking':
        return 'rgba(245, 158, 11, 0.6)';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  }, [audioState]);

  return (
    <div className={styles.circleContainer} style={{ width: baseSize * 1.5, height: baseSize * 1.5 }}>
      <motion.div
        className={styles.circle}
        animate={{
          width: baseSize * scale,
          height: baseSize * scale,
          backgroundColor: color,
          boxShadow: audioState !== 'idle' ? `0 0 ${20 * volume}px ${color}` : 'none',
        }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      />
      <div
        className={styles.circleInner}
        style={{
          width: baseSize * 0.6,
          height: baseSize * 0.6,
        }}
      />
    </div>
  );
}

// Composant de visualisation en onde
function WaveVisualizer({
  audioState,
  volume,
  size,
}: {
  audioState: AudioState;
  volume: number;
  size: 'sm' | 'md' | 'lg';
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const phaseRef = useRef(0);

  const dimensions = useMemo(() => {
    switch (size) {
      case 'sm':
        return { width: 100, height: 30 };
      case 'lg':
        return { width: 200, height: 60 };
      default:
        return { width: 150, height: 45 };
    }
  }, [size]);

  const color = useMemo(() => {
    switch (audioState) {
      case 'listening':
        return '#3b82f6';
      case 'speaking':
        return '#10b981';
      case 'thinking':
        return '#f59e0b';
      default:
        return 'rgba(255, 255, 255, 0.3)';
    }
  }, [audioState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();

      const amplitude = (dimensions.height / 3) * (audioState === 'idle' ? 0.2 : volume);
      const frequency = 0.05;
      const speed = audioState === 'idle' ? 0.02 : 0.1;

      phaseRef.current += speed;

      for (let x = 0; x < dimensions.width; x++) {
        const y =
          dimensions.height / 2 +
          Math.sin(x * frequency + phaseRef.current) * amplitude +
          Math.sin(x * frequency * 2 + phaseRef.current * 1.5) * (amplitude * 0.3);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioState, volume, color, dimensions]);

  return (
    <div className={styles.waveContainer}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />
    </div>
  );
}

export function AudioVisualizer({
  audioState,
  inputVolume = 0,
  outputVolume = 0,
  barCount = 5,
  variant = 'bars',
  size = 'md',
  className,
}: AudioVisualizerProps) {
  // Utiliser le volume approprié selon l'état
  const volume = audioState === 'listening' ? inputVolume : outputVolume;

  return (
    <div className={className}>
      {variant === 'bars' && (
        <BarsVisualizer audioState={audioState} volume={volume} barCount={barCount} size={size} />
      )}
      {variant === 'circle' && (
        <CircleVisualizer audioState={audioState} volume={volume} size={size} />
      )}
      {variant === 'wave' && (
        <WaveVisualizer audioState={audioState} volume={volume} size={size} />
      )}
    </div>
  );
}

export default AudioVisualizer;

