import { css } from '@/styled-system/css';

export const loginFlowStyles = {
  container: css({
    position: 'fixed',
    top: 0,
    left: 0,
    w: '100vw',
    h: '100vh',
    bg: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    color: '#FFFFFF',
  }),

  stepContainer: css({
    w: '100%',
    maxW: '600px',
    px: { base: 4, md: 8 },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  loadingContainer: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  }),

  loadingSpinner: css({
    w: '48px',
    h: '48px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #FFFFFF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }),

  loadingText: css({
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: '-0.02em',
  }),

  errorContainer: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    maxW: '500px',
    px: 4,
    textAlign: 'center',
  }),

  errorText: css({
    fontSize: '1.25rem',
    color: '#FF4444',
    letterSpacing: '-0.02em',
  }),

  retryButton: css({
    px: 6,
    py: 3,
    bg: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    _hover: {
      bg: 'rgba(255, 255, 255, 0.2)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
  }),

  successContainer: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    maxW: '500px',
    px: 4,
    textAlign: 'center',
  }),

  successIcon: css({
    w: '64px',
    h: '64px',
    borderRadius: '50%',
    bg: '#22C55E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: '#FFFFFF',
    fontWeight: 'bold',
    mb: 2,
  }),

  successText: css({
    fontSize: '1.5rem',
    color: '#22C55E',
    fontWeight: 'bold',
    letterSpacing: '-0.02em',
  }),

  successSubtext: css({
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: '-0.02em',
  }),
};

