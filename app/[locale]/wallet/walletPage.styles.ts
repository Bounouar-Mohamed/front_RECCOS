import { css } from '@/styled-system/css';

export const walletPageStyles = {
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

  welcomeText: css({
    fontSize: { base: '1.25rem', md: '1.5rem' },
    fontWeight: 400,
    letterSpacing: '-0.01em',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mb: { base: 4, md: 6 },
  }),

  userInfo: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: 3, md: 4 },
    w: '100%',
    textAlign: 'left',
    fontSize: { base: '0.9375rem', md: '1rem' },
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '-0.01em',
  }),

  userInfoItem: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  }),

  userInfoLabel: css({
    fontSize: { base: '0.75rem', md: '0.8125rem' },
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  }),

  userInfoValue: css({
    fontSize: { base: '0.9375rem', md: '1rem' },
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.9)',
  }),

  comingSoon: css({
    fontSize: { base: '1.125rem', md: '1.25rem' },
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    mt: { base: 4, md: 6 },
  }),

  loading: css({
    fontSize: { base: '1rem', md: '1.125rem' },
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
};

