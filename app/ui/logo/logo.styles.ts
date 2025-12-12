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
    fontSize: { base: '1.5rem', md: '1.75rem', lg: '2rem', xl: '2.25rem' },
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

