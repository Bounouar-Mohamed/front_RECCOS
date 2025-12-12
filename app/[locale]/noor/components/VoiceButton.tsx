'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mic, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConnectionStatus } from '@/lib/realtime/types';
import { voiceButtonStyles as styles } from './VoiceButton.styles';

interface VoiceButtonProps {
  /** Statut de connexion */
  status: ConnectionStatus;
  /** Callback au clic */
  onClick: () => void;
  /** Bouton désactivé */
  disabled?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
}

export function VoiceButton({
  status,
  onClick,
  disabled = false,
  className,
}: VoiceButtonProps) {
  // Déterminer le style du bouton selon l'état
  const buttonStyle = useMemo(() => {
    if (status === 'error') return styles.buttonError;
    if (status === 'connecting' || status === 'reconnecting') return styles.buttonConnecting;
    if (status === 'connected') return styles.buttonActive;
    return styles.buttonInactive;
  }, [status]);

  // Déterminer l'icône à afficher
  const Icon = useMemo(() => {
    if (status === 'connecting' || status === 'reconnecting') {
      return () => <Loader2 className={cn(styles.icon, 'animate-spin')} />;
    }
    return () => <Mic className={styles.icon} />;
  }, [status]);

  return (
    <div className={cn(styles.container, styles.minimalContainer, className)}>
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(styles.button, styles.minimalButton, buttonStyle)}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        aria-label="Talk with Noor"
      >
        <Icon />
      </motion.button>
    </div>
  );
}

export default VoiceButton;

