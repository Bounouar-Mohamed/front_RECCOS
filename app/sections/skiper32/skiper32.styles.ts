import { css } from '@/styled-system/css';

export const skiper32Styles = {
  root: css({
    position: 'relative',
    width: '100vw',
    minH: '100%',
    color: '#ffffff',
    overflow: 'hidden',
    zIndex: 10, // Z-index élevé pour passer au-dessus des cartes sticky
  }),

  introContainer: css({
    position: 'absolute',
    zIndex: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'grid',
    justifyItems: 'center',
    alignContent: 'flex-start',
    gap: '1.5rem',
    textAlign: 'center',
    maxW: '12ch',
  }),

  introText: css({
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    lineHeight: 1.2,
    letterSpacing: '0.25em',
    opacity: 0.4,
    position: 'relative',
    _after: {
      content: "''",
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '1px',
      height: '4rem',
      backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0))',
    },
  }),

  introChar: css({
    display: 'inline-block',
  }),

  gsapRoot: css({
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  }),

  gsapSection: css({
    position: 'relative',
    width: '100%',
    display: 'grid',
    placeItems: 'center',
  }),

  gsapGridWrapper: css({
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(5, minmax(0, 1fr))',
    columnGap: '1rem',
    rowGap: '1.5rem',
    padding: '1rem',
  }),

  gridFullItem: css({
    position: 'relative',
    zIndex: 10,
    perspective: '800px',
    willChange: 'transform',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '1.5rem',
    overflow: 'hidden',
    aspectRatio: '1',
  }),

  gridItemImg: css({
    height: '100%',
    width: '100%',
    borderRadius: '1.5rem',
    objectFit: 'cover',
    backfaceVisibility: 'hidden',
    willChange: 'transform',
  }),

  cardIcon: css({
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    zIndex: 20,
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    _hover: {
      transform: 'scale(1.1)',
    },
  }),

  gridFullItemExpanded: css({
    gridColumn: 'span 2',
    gridRow: 'span 2',
    zIndex: 100,
    aspectRatio: '1',
  }),

  blurOverlay: css({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)',
    zIndex: 50,
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease',
  }),
};












