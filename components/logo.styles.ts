import { css } from '@/styled-system/css';

export const logoStyles = {
  link: css({
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    zIndex: 10001,
  }),

  container: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
  }),

  text: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '2rem', md: '2.5rem', lg: '3rem', xl: '3.5rem' },
    fontWeight: 400,
    letterSpacing: '0.05em',
    background: 'linear-gradient(90deg, #FFFFFF 0%, #656565 50%, #FFFFFF 100%)',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    whiteSpace: 'nowrap',
    // @ts-ignore - Propriétés webkit nécessaires pour le gradient text
    WebkitBackgroundClip: 'text',
  } as any),
};

