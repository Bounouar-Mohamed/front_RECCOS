import { css } from '@/styled-system/css';

export const scrollAnimationStyles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflowX: 'clip',
    minH: '100%',
    // texte par défaut en blanc (les lignes seront atténuées individuellement)
    color: '#ffffff',
    // correspond à `w-screen` mais sans débordement
    w: '100%',
    maxW: '100vw',
    marginTop: '100px !important',
    // Padding vertical supprimé - géré par le parent
  }),

  stickyHeader: css({
    position: 'sticky',
    display: 'flex',
    gap: "10px",
    lineHeight: 1.1,
    fontWeight: 'Regular',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  title: css({
    // h1 "We Design" en blanc plein
    color: '#ffffff',
  }),

  stickyWrapper: css({
    position: 'sticky',
    top: '50%',
    h: 'fit-content',
  }),

  topOverlay: css({
    position: 'absolute',
    left: '100%',
    top: 0,
    zIndex: 10,
    h: '50vh',
    w: '100vw',
    maxW: '100vw',
    transform: 'translateY(-100%)',
    // masques latéraux noirs légèrement translucides
    bg: 'rgba(0, 0, 0, 0.85)',
  }),

  bottomOverlay: css({
    position: 'absolute',
    bottom: 0,
    left: '100%',
    zIndex: 10,
    h: '50vh',
    w: '100vw',
    maxW: '100vw',
    transform: 'translateY(100%)',
    bg: 'rgba(0, 0, 0, 0.85)',
  }),

  textList: css({
    h: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  }),

  textItem: css({
    // lignes de texte en blanc 15%
    lineHeight: 1.1,
    color: 'rgb(255, 255, 255)',
  }),

  blurOverlay: css({
    position: 'absolute',
    inset: 0,
    // aucun voile gris : on garde le fond noir, seul le blur agit
    bg: 'transparent',
  }),
};

