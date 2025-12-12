import { css } from '@/styled-system/css';
import { cn } from '@/lib/utils';

export const stickyCard002Styles = {
  wrapper: (className?: string) =>
    cn(
      css({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        // paddingBottom: '100vh',
        // paddingTop: '50vh',
        zIndex: 1, // Z-index bas pour rester en arrière-plan
        isolation: 'isolate', // Crée un contexte d'empilement isolé
      }),
      className,
    ),

  main: (className?: string) =>
    cn(
      css({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }),
      className,
    ),

  header: css({
    position: 'absolute',
    left: '50%',
    top: '10%',
    display: 'grid',
    gridTemplateColumns: '1fr',
    justifyContent: 'center',
    alignItems: 'start',
    gap: '1.5rem',
    textAlign: 'center',
    transform: 'translateX(-50%)',
  }),

  headerLabel: css({
    position: 'relative',
    maxWidth: '12ch',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    lineHeight: 'tight',
    opacity: 0.4,
    _after: {
      content: "''",
      position: 'absolute',
      left: '50%',
      top: '100%',
      transform: 'translateX(-50%)',
      height: '4rem',
      width: '1px',
      backgroundImage:
        'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.75))',
    },
  }),

  stickyContainer: css({
    position: 'sticky',
    top: 0,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%',
    zIndex: 1, // Z-index bas pour rester dans le contexte du wrapper
    pointerEvents: 'none', // Désactiver les pointer-events sur le container pour éviter que les zones vides bloquent
  }),

  // Wrapper pour une ligne de cartes (affiche les cartes côte à côte)
  rowWrapper: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px', // Espace horizontal entre les cartes
    transformOrigin: 'top center',
    width: '100%',
    px: '20px',
    pointerEvents: 'none', // Désactiver les pointer-events sur le wrapper pour éviter que les zones vides bloquent
  }),

  card: css({
    borderRadius: '2rem', // rounded-4xl
    position: 'relative',
    display: 'flex',
    // Taille fixe des cartes : 450px x 450px (carré)
    height: '450px',
    width: '450px',
    flexShrink: 0,
    flexDirection: 'column',
    overflow: 'hidden',
    // Effet d'ombre pour donner l'impression qu'elles émergent de dessous
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 0, 0, 0.3)',
    // Border blanc 40% d'opacité
    border: '1px solid rgba(255, 255, 255, 0.4)',
    cursor: 'pointer',
    pointerEvents: 'auto', // Réactiver les pointer-events uniquement sur les cards
    // Animation d'apparition fluide
    animation: 'cardAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards',
  }),

  cardOverlay: css({
    position: 'absolute',
    bottom: '0.5rem', // Éloigne du bord inférieur
    left: '0.5rem', // Éloigne du bord gauche
    right: '0.5rem', // Éloigne du bord droit
    height: 'calc(50% - 1rem)', // 50% de la hauteur moins les marges
    backgroundColor: 'rgba(33, 33, 33, 0.2)', // #3C3C3C 20%
    border: '1px solid rgba(255, 255, 255, 0.2)', // #FFFFFF 20%
    borderRadius: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end', // Aligne le contenu en bas
    alignItems: 'stretch',

    gap: '0.75rem', // Espacement entre les éléments
    paddingTop: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingBottom: '1rem',

    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)', // Drop shadow #FFFFFF 15%
    zIndex: 10,
  }),

  cardDetails: css({
    color: '#ffffff',
    textAlign: 'left',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  }),

  cardTitle: css({
    fontSize: '1.5rem',

    marginBottom: 0,
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    lineHeight: 1.2,
  }),

  cardInfoList: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  }),

  cardInfoItem: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
  }),

  cardInfoLabel: css({
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'var(--font-inter), sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  }),

  cardInfoValue: css({
    fontSize: '0.875rem',
    color: '#ffffff',
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 500,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  }),

  cardButton: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.75rem 1.5rem !important',
    borderRadius: '1rem', // Border-radius harmonisé avec le cardOverlay (1.5rem - un peu plus petit)
    backgroundColor: '#FFFFFF',
    color: '#000000',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      transform: 'scale(1.02)',
    },
  }),

  cardButtonText: css({
    fontSize: '1rem',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    textTransform: 'uppercase',
    lineHeight: 1,
    display: 'block',
    whiteSpace: 'nowrap',
    transform: 'translateY(0.05em)', // Ajustement fin pour centrer avec Bebas Neue
  }),

  image: (className?: string) =>
    cn(
      css({
        height: '100%',
        width: '100%',
        objectFit: 'cover',
        pointerEvents: 'none', // Permet au hover de fonctionner même sur l'image
      }),
      className,
    ),

  defaultWrapper: css({
    width: '100%',
  }),

  placeholderPanel: css({
    width: '100%',
    borderRadius: { base: '20px', md: '28px' },
    // border: '1px solid rgba(255,255,255,0.25)',
    padding: { base: '32px', md: '48px' },
    textAlign: 'center',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '260px',
  }),
  placeholderText: css({
    fontSize: { base: '1rem', md: '1.2rem' },
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  }),

  // Loader avec points animés
  loaderContainer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  }),
  loaderDot: css({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.9)',
    animation: 'dotPulse 1.4s ease-in-out infinite',
    '&:nth-child(1)': {
      animationDelay: '0s',
    },
    '&:nth-child(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-child(3)': {
      animationDelay: '0.4s',
    },
  }),

  investorBadgePosition: css({
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    zIndex: 15,
  }),
  countdownBadge: css({
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    zIndex: 15,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    padding: '0.85rem 1rem',
    borderRadius: '1.25rem',
    background: 'rgba(5, 5, 5, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
  }),
  countdownTitle: css({
    fontSize: '0.75rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  }),
  countdownGrid: css({
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
  }),
  countdownCell: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '48px',
  }),
  countdownValue: css({
    fontSize: '1.15rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: '#ffffff',
  }),
  countdownLabel: css({
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
  }),
  countdownDate: css({
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  }),

  // Styles pour la MapCard
  mapContainer: css({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    borderRadius: '2rem',
    overflow: 'hidden',
    '& .mapboxgl-map': {
      borderRadius: 'inherit',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },
    '& .mapboxgl-canvas-container': {
      borderRadius: 'inherit',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },
    '& .mapboxgl-canvas': {
      borderRadius: 'inherit',
      display: 'block',
    },
    '& .mapboxgl-ctrl-logo': {
      display: 'none',
    },
    '& .mapboxgl-ctrl-attrib': {
      display: 'none',
    },
  }),

  mapExpandButton: css({
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    zIndex: 20,
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#000000',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor: '#ffffff',
      transform: 'scale(1.1)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  }),

  mapOverlay: css({
    position: 'absolute',
    bottom: '1rem',
    left: '1rem',
    right: '1rem',
    zIndex: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  }),

  mapPropertyCount: css({
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#ffffff',
    fontFamily: 'var(--font-inter), sans-serif',
    letterSpacing: '0.02em',
  }),

  // Overlay pour la carte non interactive (aperçu)
  mapPreviewOverlay: css({
    position: 'absolute',
    inset: 0,
    zIndex: 10,
    cursor: 'pointer',
    background: 'transparent',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.1)',
    },
  }),

  // Modal pour la carte étendue
  mapExpandedBackdrop: css({
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    backdropFilter: 'blur(0px)',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    '&[data-visible="true"]': {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(20px)',
    },
  }),

  mapExpandedContainer: css({
    position: 'relative',
    width: '100%',
    height: '100%',
    maxWidth: '1400px',
    maxHeight: '900px',
    borderRadius: '2rem',
    overflow: 'hidden',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 120px rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    transform: 'scale(0.8) translateY(40px)',
    opacity: 0,
    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    '&[data-visible="true"]': {
      transform: 'scale(1) translateY(0)',
      opacity: 1,
    },
  }),

  mapExpandedMap: css({
    width: '100%',
    height: '100%',
    '& .mapboxgl-map': {
      borderRadius: 'inherit',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },
    '& .mapboxgl-canvas-container': {
      borderRadius: 'inherit',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },
    '& .mapboxgl-canvas': {
      borderRadius: 'inherit',
      display: 'block',
    },
    '& .mapboxgl-ctrl-logo': {
      display: 'none',
    },
    '& .mapboxgl-ctrl-attrib': {
      display: 'none',
    },
  }),

  mapExpandedCloseButton: css({
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    zIndex: 20,
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      transform: 'scale(1.1)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  }),

  mapExpandedInfo: css({
    position: 'absolute',
    bottom: '1.5rem',
    left: '1.5rem',
    right: '1.5rem',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '1rem 1.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(12px)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  }),

  mapExpandedTitle: css({
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#ffffff',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }),

  mapExpandedCount: css({
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'var(--font-inter), sans-serif',
  }),
};
