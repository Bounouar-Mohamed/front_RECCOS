import { css } from '@/styled-system/css';

export const mapPropertyPopupCardStyles = {
  container: css({
    minWidth: { base: '300px', sm: '360px' },
    maxWidth: { base: '360px', sm: '400px' },
    maxHeight: { base: '35vh', sm: '40vh', md: '45vh' }, // Hauteur réduite pour rester visible dans la carte
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '5px', sm: '6px', md: '8px' },
    boxSizing: 'border-box',
    overflowY: 'auto', // Permet le scroll si le contenu dépasse
    overflowX: 'hidden',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '3px',
      '&:hover': {
        background: 'rgba(0, 0, 0, 0.3)',
      },
    },
  } as any),
  row: css({
    display: 'flex',
    gap: { base: '6px', sm: '8px' },
    width: '100%',
    boxSizing: 'border-box',
    alignItems: 'stretch', // Force les enfants à avoir la même hauteur
    flexShrink: 0, // Empêche la compression de cette ligne
  }),
  imageBox: css({
    width: { base: '100px', sm: '120px', md: '140px' },
    minWidth: { base: '100px', sm: '120px', md: '140px' },
    borderRadius: { base: '10px', sm: '12px', md: '14px' },
    position: 'relative',
    overflow: 'hidden',
    background: 'rgb(0, 0, 0)',
    backdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
    flexShrink: 0,
    boxSizing: 'border-box',
    alignSelf: 'stretch', // S'étire pour correspondre à la hauteur du sibling
  }),
  image: css({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  }),
  imageOverlay: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)',
    pointerEvents: 'none',
  }),
  detailsBox: css({
    flex: 1,
    padding: { base: '10px', sm: '12px', md: '14px' },
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(5px)',
    borderRadius: { base: '10px', sm: '12px', md: '14px' },
    border: '1px solid rgba(255,255,255,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '8px', sm: '10px' },
    overflow: 'visible',
    boxSizing: 'border-box',
    minWidth: 0,
    alignSelf: 'stretch', // S'étire pour correspondre à la hauteur du sibling
    minHeight: 0, // Permet la compression si nécessaire
  }),
  investorBadgeWrapper: css({
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.85)',
    borderRadius: '16px',
    width: 'fit-content',
    marginBottom: '4px',
    flexShrink: 0,
  }),
  detailsGrid: css({
    display: 'grid',
    gridTemplateColumns: { base: '1fr', sm: '1fr 1fr' }, // Une colonne sur mobile, deux sur desktop
    gap: { base: '8px', sm: '10px' },
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
    alignContent: 'flex-start', // Aligne le contenu en haut
  }),
  detailsColumn: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '8px', sm: '10px' },
    minWidth: 0,
    overflow: 'visible',
    justifyContent: 'flex-start', // Aligne le contenu en haut
  }),
  detailItem: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
    overflow: 'visible',
    width: '100%', // Prend toute la largeur disponible
  }),
  detailLabel: css({
    fontSize: { base: '9px', sm: '10px' },
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  }),
  detailValue: css({
    fontSize: { base: '13px', sm: '14px' },
    color: '#ffffff',
    fontWeight: 600,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    width: '100%',
    maxWidth: '100%', // S'assure que le texte ne dépasse pas
    lineHeight: { base: 1.4, sm: 1.5 }, // Meilleur espacement sur petits écrans
  }),
  locationBox: css({
    width: '100%',
    padding: { base: '10px', sm: '12px', md: '14px' },
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(5px)',
    borderRadius: { base: '10px', sm: '12px', md: '14px' },
    border: '1px solid rgba(255,255,255,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '5px', sm: '6px', md: '8px' },
    boxSizing: 'border-box',
    overflow: 'visible',
    flexShrink: 0, // Empêche la compression de cette boîte
  }),
  title: css({
    fontSize: { base: '24px', sm: '26px', md: '28px' },
    lineHeight: 0.8,
    color: '#ffffff',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    // letterSpacing: '-0.02em',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  }),
  locationContainer: css({
    fontSize: { base: '13px', sm: '14px' },
    color: 'rgba(255, 255, 255, 0.6)',
    display: 'flex',
    alignItems: 'center',
    gap: { base: '5px', sm: '6px' },
    fontWeight: 500,
    minWidth: 0,
    overflow: 'hidden',
  }),
  locationIcon: css({
    width: '14px',
    height: '14px',
    flexShrink: 0,
  }),
} as const;

