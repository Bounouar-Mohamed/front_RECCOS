import { css } from '@/styled-system/css';

export const stickyCardStyles = {
  container: css({
    position: 'relative',
    height: '100vh',
    width: '100%',
  }),

  stickyCards: css({
    position: 'relative',
    display: 'flex',
    height: '100vh',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: { base: '12px !important', lg: '32px !important' },
  }),

  cardContainer: css({
    position: 'relative',
    height: '90%',
    width: '100%',
    maxWidth: {
      base: '384px',
      sm: '448px',
      md: '512px',
      lg: '576px',
      xl: '672px',
      '2xl': '768px',
    },
    overflow: 'hidden',
    borderRadius: '8px !important',
  }),

  image: css({
    position: 'absolute',
    height: '100%',
    width: '100%',
    objectFit: 'cover',
    borderRadius: '16px !important',
  }),
};

