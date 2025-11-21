import { css } from '@/styled-system/css';

export const carouselStyles = {
  root: css({
    position: 'relative',
    w: '100%',
  }),

  viewport: css({
    overflow: 'hidden',
    w: '100%',
  }),

  content: css({
    display: 'flex',
    flexDirection: 'row',
    ml: '-1',
  }),

  item: css({
    minW: '0',
    flexShrink: 0,
    pl: '1',
  }),
};

