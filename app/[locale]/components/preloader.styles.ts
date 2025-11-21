import { css } from '@/styled-system/css';

export const preloaderStyles = {
  container: css({
    position: 'fixed',
    inset: 0,
    zIndex: 9999999,
    display: 'flex',
    h: '100%',
    w: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    bg: 'white',
    isolation: 'isolate',
    transform: 'translateZ(0)',
    willChange: 'transform',
  }),

  text: css({
    position: 'absolute',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: { base: '3rem', md: '3.75rem' },
    fontWeight: 'semibold',
    letterSpacing: '-0.02em',
    color: 'black',
  }),

  svg: css({
    position: 'absolute',
    top: 0,
    h: 'calc(100% + 300px)',
    w: '100%',
  }),

  path: css({
    fill: 'white',
    boxShadow: '0 0 10px #fff',
  }),
};

