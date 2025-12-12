'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff } from 'lucide-react';
import { css } from '@/styled-system/css';
import { RealtimeSessionState } from '@/lib/realtime/types';
import Image from 'next/image';

interface RealtimePanelProps {
  state: RealtimeSessionState;
  onDisconnect: () => void;
  onInterrupt: () => void;
  isVisible: boolean;
}

const styles = {
  overlay: css({
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    bg: 'rgba(0, 0, 0, 0.94)',
    backdropFilter: 'blur(60px)',
  }),

  // État de connexion
  connectingContainer: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  }),

  connectingText: css({
    fontSize: '2rem',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  connectingSubtext: css({
    fontSize: '0.875rem',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.02em',
  }),

  // Loader ring
  loaderRing: css({
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
  }),

  // État connecté
  connectedContainer: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
    maxWidth: '320px',
    padding: '0 24px',
  }),

  // Avatar Noor
  avatarContainer: css({
    position: 'relative',
    width: '160px',
    height: '160px',
  }),

  avatarGlow: css({
    position: 'absolute',
    inset: '-30px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
  }),

  avatarRing: css({
    position: 'absolute',
    inset: '-6px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  }),

  avatarRingInner: css({
    position: 'absolute',
    inset: '-2px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  }),

  avatar: css({
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  }),

  avatarImage: css({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }),

  // Nom
  name: css({
    fontSize: '3rem',
    fontWeight: '400',
    color: '#ffffff',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    marginTop: '8px',
  }),

  // Statut
  statusContainer: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),

  statusDot: css({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    bg: '#34d399',
  }),

  statusText: css({
    fontSize: '0.8125rem',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.03em',
  }),

  // Visualiseur audio
  visualizer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    height: '40px',
    marginTop: '12px',
  }),

  bar: css({
    width: '3px',
    borderRadius: '3px',
    bg: 'rgba(255, 255, 255, 0.8)',
  }),

  // Bouton raccrocher
  endButton: css({
    marginTop: '40px',
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bg: '#ff3b30',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(255, 59, 48, 0.4)',
  }),

  endIcon: css({
    color: '#ffffff',
    width: '32px',
    height: '32px',
  }),

  // Hint
  hint: css({
    position: 'absolute',
    bottom: '48px',
    fontSize: '0.75rem',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.25)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }),

  // Transcription
  transcript: css({
    marginTop: '20px',
    padding: '20px 24px',
    borderRadius: '20px',
    bg: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    maxWidth: '100%',
    width: '100%',
    backdropFilter: 'blur(20px)',
  }),

  transcriptLabel: css({
    fontSize: '0.875rem',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '8px',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  transcriptText: css({
    fontSize: '0.9375rem',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.6',
  }),

  // Erreur
  errorText: css({
    fontSize: '0.875rem',
    color: '#ff453a',
    textAlign: 'center',
    marginTop: '12px',
  }),
};

// Transitions fluides
const springConfig = { stiffness: 100, damping: 20, mass: 0.5 };
const smoothTransition = { duration: 0.6, ease: 'easeOut' as const };
const staggerDelay = 0.1;

// Visualiseur audio smooth
function SmoothVisualizer({ 
  isActive, 
  volume 
}: { 
  isActive: boolean; 
  volume: number;
}) {
  const bars = 7;
  const [heights, setHeights] = useState<number[]>(Array(bars).fill(4));

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(bars).fill(4));
      return;
    }

    const interval = setInterval(() => {
      setHeights(prev => prev.map((_, i) => {
        const center = Math.floor(bars / 2);
        const distFromCenter = Math.abs(i - center);
        const centerWeight = 1 - (distFromCenter / center) * 0.4;
        
        const baseHeight = 4;
        const maxHeight = 28;
        const noise = Math.sin(Date.now() / 150 + i * 0.8) * 0.3 + 0.7;
        
        return baseHeight + (maxHeight - baseHeight) * volume * centerWeight * noise;
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, volume]);

  return (
    <div className={styles.visualizer}>
      {heights.map((height, i) => (
        <motion.div
          key={i}
          className={styles.bar}
          animate={{ height, opacity: 0.3 + (height / 28) * 0.7 }}
          transition={{ type: 'spring', ...springConfig }}
        />
      ))}
    </div>
  );
}

export function RealtimePanel({
  state,
  onDisconnect,
  isVisible,
}: RealtimePanelProps) {
  const { status, audioState, userTranscript, assistantTranscript, error, inputVolume, outputVolume } = state;
  const [phase, setPhase] = useState<'connecting' | 'connected'>('connecting');

  // Transition de phase fluide
  useEffect(() => {
    if (status === 'connected') {
      const timer = setTimeout(() => setPhase('connected'), 400);
      return () => clearTimeout(timer);
    } else if (status === 'connecting' || status === 'reconnecting') {
      setPhase('connecting');
    }
  }, [status]);

  const isConnecting = status === 'connecting' || status === 'reconnecting';
  const isListening = audioState === 'listening';
  const isSpeaking = audioState === 'speaking';
  const isThinking = audioState === 'thinking';

  // Statut texte
  const statusText = React.useMemo(() => {
    if (isListening) return 'Écoute';
    if (isSpeaking) return 'Répond';
    if (isThinking) return 'Réfléchit';
    return 'En ligne';
  }, [isListening, isSpeaking, isThinking]);

  // Volume
  const activeVolume = isListening ? inputVolume : isSpeaking ? outputVolume : 0;

  // Transcription
  const displayTranscript = isSpeaking || isThinking ? assistantTranscript : userTranscript;
  const transcriptLabel = isSpeaking || isThinking ? 'Noor' : 'Vous';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={styles.overlay}
        >
          <AnimatePresence mode="wait">
            {/* État de connexion */}
            {phase === 'connecting' && isConnecting && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={smoothTransition}
                className={styles.connectingContainer}
              >
                {/* Loader ring */}
                <motion.div
                  className={styles.loaderRing}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                
                <motion.span 
                  className={styles.connectingText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Connexion à Noor
                </motion.span>
                
                <motion.span 
                  className={styles.connectingSubtext}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Initialisation du canal audio...
                </motion.span>
              </motion.div>
            )}

            {/* État connecté */}
            {phase === 'connected' && (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={smoothTransition}
                className={styles.connectedContainer}
              >
                {/* Avatar */}
                <motion.div 
                  className={styles.avatarContainer}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...smoothTransition, delay: staggerDelay }}
                >
                  <motion.div 
                    className={styles.avatarGlow}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                  <div className={styles.avatarRing} />
                  <div className={styles.avatarRingInner} />
                  <motion.div 
                    className={styles.avatar}
                    animate={{ scale: [1, 1.015, 1] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <Image
                      src="/images/Noor_x4.png"
                      alt="Noor"
                      width={160}
                      height={160}
                      className={styles.avatarImage}
                      priority
                    />
                  </motion.div>
                </motion.div>

                {/* Nom */}
                <motion.h2 
                  className={styles.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...smoothTransition, delay: staggerDelay * 2 }}
                >
                  Noor
                </motion.h2>

                {/* Statut */}
                <motion.div 
                  className={styles.statusContainer}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...smoothTransition, delay: staggerDelay * 3 }}
                >
                  <motion.div 
                    className={styles.statusDot}
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                  <span className={styles.statusText}>{statusText}</span>
                </motion.div>

                {/* Visualiseur */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...smoothTransition, delay: staggerDelay * 4 }}
                >
                  <SmoothVisualizer 
                    isActive={isListening || isSpeaking} 
                    volume={activeVolume} 
                  />
                </motion.div>

                {/* Transcription */}
                <AnimatePresence>
                  {displayTranscript && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={smoothTransition}
                      className={styles.transcript}
                    >
                      <p className={styles.transcriptLabel}>{transcriptLabel}</p>
                      <p className={styles.transcriptText}>{displayTranscript}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Erreur */}
                {error && (
                  <motion.p 
                    className={styles.errorText}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.p>
                )}

                {/* Bouton raccrocher */}
                <motion.button
                  className={styles.endButton}
                  onClick={onDisconnect}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...smoothTransition, delay: staggerDelay * 5 }}
                  whileHover={{ scale: 1.08, boxShadow: '0 12px 40px rgba(255, 59, 48, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Terminer"
                >
                  <PhoneOff className={styles.endIcon} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint */}
          <motion.span 
            className={styles.hint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Échap pour terminer
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RealtimePanel;
