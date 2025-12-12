import { css } from '@/styled-system/css';

export const parallaxStickyContainerStyles = {
  stickyContainer: css({
    position: 'sticky',
    top: 0,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%',
    zIndex: 1,
    pointerEvents: 'auto',
  }),
  rowWrapper: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    transformOrigin: 'top center',
    width: '100%',
    paddingLeft: '20px',
    paddingRight: '20px',
    pointerEvents: 'auto',
  }),
} as const;










