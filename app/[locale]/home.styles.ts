import { css } from '@/styled-system/css';

export const homeStyles = {
  main: css({
    bg: 'black',
    margin: 0,
    padding: 0,
    minH: '100vh',
    display: 'flex',
    flexDirection: 'column',
  }),

  // Style pour wrapper chaque section avec espacement uniforme
  sectionWrapper: css({
    py: '5%',
    w: '100%',
  }),
};

export const skiper8Styles = {
  preloaderContainer: css({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: '100vw',
    h: '100vh',
    bg: 'white',
  }),

  preloaderText: css({
    position: 'absolute',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    fontSize: '56px',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    color: 'black',
  }),

  svg: css({
    position: 'absolute',
    top: 0,
    w: '100%',
    h: 'calc(100% + 300px)',
  }),

  path: css({
    fill: 'white',
    filter: 'drop-shadow(0 0 10px #ffffff)',
  }),

  main: css({
    minH: '100vh',
    w: '100%',
  }),

  section: css({
    minH: '100vh',
    w: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    color: '#ffffff',
  }),
};


