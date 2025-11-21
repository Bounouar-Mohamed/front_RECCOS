import { css } from '@/styled-system/css';

export const exchangePageStyles = {
  container: css({
    minH: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    px: { base: 4, md: 6 },
    py: { base: 8, md: 12 },
    bg: '#000000',
    color: '#ffffff',
  }),

  content: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    maxW: '680px',
    gap: { base: 6, md: 8 },
  }),

  title: css({
    fontSize: { base: '3rem', md: '4.5rem', lg: '5.5rem' },
    fontWeight: 300,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),

  comingSoon: css({
    fontSize: { base: '1.125rem', md: '1.25rem' },
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
  }),
};

