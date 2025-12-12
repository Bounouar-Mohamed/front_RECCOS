import { css } from '@/styled-system/css';

export const voiceButtonStyles = {
  // Container principal du bouton
  container: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  // Anneau animé de fond (quand actif)
  pulseRing: css({
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px solid rgba(147, 51, 234, 0.4)',
    animation: 'pulse-ring 2s ease-in-out infinite',
    pointerEvents: 'none',
  }),

  // Bouton principal
  button: css({
    position: 'relative',
    width: { base: '36px', md: '40px' },
    height: { base: '36px', md: '40px' },
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    outline: 'none',
    overflow: 'hidden',
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  }),

  minimalContainer: css({
    width: { base: '36px', md: '40px' },
    height: { base: '36px', md: '40px' },
  }),

  minimalButton: css({
    width: '100%',
    height: '100%',
    bg: 'transparent',
    border: 'none',
    _hover: {
      transform: 'scale(1.1)',
    },
  }),

  // État inactif (transparent, juste l'icône)
  buttonInactive: css({
    bg: 'transparent',
    border: 'none',
    _hover: {
      transform: 'scale(1.1)',
    },
  }),

  // État de connexion
  buttonConnecting: css({
    bg: 'rgba(251, 191, 36, 0.15)',
    border: '1px solid rgba(251, 191, 36, 0.4)',
  }),

  // État actif (violet/magenta gradient)
  buttonActive: css({
    bg: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    animation: 'pulse-glow 2s ease-in-out infinite',
    _hover: {
      transform: 'scale(1.05)',
    },
  }),

  // État écoute (bleu)
  buttonListening: css({
    bg: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }),

  // État parole IA (vert)
  buttonSpeaking: css({
    bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }),

  // État erreur
  buttonError: css({
    bg: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
  }),

  // Icône du microphone
  icon: css({
    width: { base: '20px', md: '22px' },
    height: { base: '20px', md: '22px' },
    color: 'rgba(255, 255, 255, 0.7)',
    transition: 'all 0.2s ease',
    zIndex: 1,
    _hover: {
      color: '#ffffff',
    },
  }),

  minimalIcon: css({
    width: { base: '18px', md: '20px' },
    height: { base: '18px', md: '20px' },
  }),

  // Animation de chargement
  loadingSpinner: css({
    width: { base: '22px', md: '26px' },
    height: { base: '22px', md: '26px' },
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }),

  // Visualiseur audio intégré
  audioVisualizer: css({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    height: '100%',
    width: '100%',
    pointerEvents: 'none',
  }),

  // Barre de visualisation
  audioBar: css({
    width: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '2px',
    transformOrigin: 'center',
    animation: 'wave-animation 0.5s ease-in-out infinite',
  }),

  // Label de statut
  statusLabel: css({
    position: 'absolute',
    bottom: '-24px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '0.6875rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    opacity: 0.7,
    letterSpacing: '0.02em',
  }),

  statusLabelActive: css({
    color: '#a855f7',
  }),

  statusLabelListening: css({
    color: '#3b82f6',
  }),

  statusLabelSpeaking: css({
    color: '#10b981',
  }),

  statusLabelError: css({
    color: '#ef4444',
  }),

  // Gradient border rotatif (effet spécial)
  gradientBorder: css({
    position: 'absolute',
    inset: '-2px',
    borderRadius: '50%',
    background: 'conic-gradient(from 0deg, #9333ea, #db2777, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #9333ea)',
    animation: 'rotate-gradient 3s linear infinite',
    mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))',
    WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))',
    opacity: 0.8,
    pointerEvents: 'none',
  }),

  // Tooltip
  tooltip: css({
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    bg: 'rgba(0, 0, 0, 0.9)',
    color: '#ffffff',
    fontSize: '0.75rem',
    padding: '6px 12px',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.2s ease',
    pointerEvents: 'none',
    zIndex: 50,
    _before: {
      content: '""',
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: '4px',
      borderStyle: 'solid',
      borderColor: 'rgba(0, 0, 0, 0.9) transparent transparent transparent',
    },
  }),

  tooltipVisible: css({
    opacity: 1,
    visibility: 'visible',
  }),
} as const;

