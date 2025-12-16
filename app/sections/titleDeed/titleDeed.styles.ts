import { css } from '@/styled-system/css';

export const titleDeedStyles = {
  root: css({
    display: 'flex',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    bg: '#000000',
  }),

  container: css({
    position: 'relative',
    width: '100%',
    maxW: '72rem',
    px: '1.25rem',
  }),

  innerWrapper: css({
    width: '100%',
  }),

  cardsContainer: css({
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
  }),

  card: css({
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
    borderRadius: '2rem',
    bg: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(40px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    transition: 'border-color 0.3s ease',
    _hover: {
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
  }),

  // Contenu de la carte (centré verticalement)
  cardInner: css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: '1.5rem',
  }),

  // ID de la propriété (petit, discret)
  cardId: css({
    fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace',
    fontSize: '0.625rem',
    fontWeight: '500',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.3)',
    mb: '0.75rem',
  }),

  // Nom de la propriété (vertical quand réduit, horizontal quand actif)
  cardName: css({
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    fontSize: '0.875rem',
    fontWeight: '400',
    letterSpacing: '-0.01em',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: '1.3',
  }),

  // Nom vertical pour les cartes réduites
  cardNameVertical: css({
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    transform: 'rotate(180deg)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxH: '18rem',
  }),

  // Badge PDF
  cardBadge: css({
    position: 'absolute',
    bottom: '1rem',
    left: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    px: '0.75rem',
    py: '0.375rem',
    borderRadius: '100px',
    bg: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  }),

  cardBadgeIcon: css({
    width: '0.75rem',
    height: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  }),

  cardBadgeText: css({
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    fontSize: '0.6875rem',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.02em',
  }),

  // Indicateur de document
  cardDocIcon: css({
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '1.25rem',
    height: '1.25rem',
    color: 'rgba(255, 255, 255, 0.2)',
  }),

  // Accent lumineux subtil
  cardGlow: css({
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.04) 0%, transparent 50%)',
    pointerEvents: 'none',
  }),
};
