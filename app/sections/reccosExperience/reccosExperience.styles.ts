import { css } from '@/styled-system/css';

export const reccosExperienceStyles = {
  section: css({
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    margin: '0 auto',
  }),

  content: css({
    display: 'grid',
    color: '#FFFFFF',
    background: '#000000',
    borderRadius: { base: '45px', md: '55px' },
    border: '1px solid rgba(255, 255, 255, 0.4)',
    gridTemplateColumns: { base: '1fr', lg: '0.9fr 0.6fr' },
    gap: { base: '32px', lg: '36px' },
    py: { base: '10px', md: '14px', xl: '18px' },
    pl: { base: '32px', md: '48px', xl: '56px' },
    pr: { base: '10px', md: '14px', xl: '18px' },
    alignItems: { base: 'stretch', lg: 'center' },
    minHeight: { base: 'auto', lg: '560px' },
    maxW: '1400px',
  }),

  leftColumn: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '20px', md: '26px' },
    justifyContent: 'space-between',
  }),

  heroCopy: css({
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 200,
    fontSize: { base: '0.65rem', md: '0.75rem', lg: '0.85rem' },
    lineHeight: 1.3,
    color: 'rgba(255, 255, 255, 0.9)',
    maxW: { base: '100%', md: '75%', lg: '65%' },
  }),

  badgeRow: css({
    display: 'flex',
    flexDirection: { base: 'column', sm: 'row' },
    gap: { base: '10px', sm: '15px' },
    alignItems: { base: 'flex-start', sm: 'center' },
  }),

  teamCopy: css({
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 200,
    fontSize: { base: '0.65rem', md: '0.75rem', lg: '0.85rem' },
    lineHeight: 1,
  }),

  statsStack: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '12px', md: '16px' },
    flex: 1,
    justifyContent: 'space-evenly',
  }),

  statBlock: css({
    display: 'grid',
    gridTemplateColumns: { base: 'auto', sm: 'minmax(0, 140px) 1fr' },
    gap: { base: '12px', sm: '20px' },
    alignItems: 'center',
  }),

  statValue: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '3.5rem', md: '4rem' },
    lineHeight: 0.9,
    color: '#C4C4C4',
  }),

  statLabel: css({
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 200,
    fontSize: { base: '1rem', md: '1.1rem' },
    letterSpacing: '0.05em',
    color: 'rgb(255, 255, 255)',
    display: 'flex',
    flexDirection: 'column',
  }),

  statDivider: css({
    gridColumn: '1 / -1',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
  }),

  rightColumn: css({
    position: 'relative',
    borderRadius: '35px',
    overflow: 'hidden',
    width: { base: '100%', lg: '80%' },
    minHeight: { base: '280px', md: '360px', lg: '100%' },
    alignSelf: 'stretch',
    justifySelf: { base: 'stretch', lg: 'end' },
    display: 'flex',
    alignItems: 'stretch',
  }),

  imageWrapper: css({
    position: 'relative',
    inset: 0,
    padding: 0,
    flex: 1,
  }),
  
  image: css({
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    borderRadius: 'inherit',
    filter: 'saturate(1.05)',
  }),
};

