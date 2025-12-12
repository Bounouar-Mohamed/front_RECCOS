import { css } from '@/styled-system/css';

export const selectStyles = {
  wrapper: css({
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    _hover: {
      '& [data-icon]': {
        color: 'rgba(255, 255, 255, 0.8)',
      },
      '& [data-arrow]': {
        opacity: 1,
      },
    },
  }),

  iconWrapper: css({
    position: 'absolute',
    left: { base: '14px !important', sm: '16px !important' },
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 1,
    color: 'rgba(255, 255, 255, 0.6)',
    transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '& svg': {
      width: { base: 14, sm: 16, md: 18 },
      height: { base: 14, sm: 16, md: 18 },
    },
  }),

  select: css({
    flex: 1,
    width: '100%',
    bg: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: { base: 8, md: 10 },
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: { base: 13, sm: 14, md: 15 },
    fontWeight: 400,
    letterSpacing: '-0.01em',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    appearance: 'none',
    paddingTop: { base: '10px !important', sm: '12px !important' },
    paddingBottom: { base: '10px !important', sm: '12px !important' },
    paddingLeft: { base: '40px !important', sm: '44px !important' },
    paddingRight: { base: '36px !important', sm: '40px !important' },
    _hover: {
      color: 'rgba(255, 255, 255, 1)',
      bg: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    _focus: {
      color: 'rgba(255, 255, 255, 1)',
      bg: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
    },
    '& option': {
      bg: '#1a1a1a',
      color: 'rgba(255, 255, 255, 0.95)',
      padding: 2,
    },
  }),

  // Variante compacte (petit select, plus adapté aux toolbars)
  selectCompact: css({
    flex: 1,
    width: '100%',
    bg: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: '-0.01em',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    appearance: 'none',
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: '14px',
    paddingRight: '26px',
    _hover: {
      color: 'rgba(255, 255, 255, 1)',
      bg: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    _focus: {
      color: 'rgba(255, 255, 255, 1)',
      bg: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
    },
    '& option': {
      bg: '#1a1a1a',
      color: 'rgba(255, 255, 255, 0.95)',
      padding: 2,
    },
  }),

  arrowWrapper: css({
    position: 'absolute',
    right: { base: '14px !important', sm: '16px !important' },
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
    transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  }),
};

