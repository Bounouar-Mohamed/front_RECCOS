import { css } from '@/styled-system/css';

export const heroStyles = {
  root: css({
    minH: '100vh',
    h: '100vh',
    w: '100%',
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
  }),

  gradientOverlay: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, #000000 0%,rgb(14, 14, 14) 50%,rgb(21, 21, 21) 100%)',
    // background: '#000000 ',
    zIndex: 1,
    pointerEvents: 'none',
  }),

  video: css({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  }),

  imageWrapper: css({
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: "2%",
    paddingRight: "2%",
    paddingBottom: "2%",
    zIndex: 2,
  }),

  image: css({
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
    display: 'block',
    maxHeight: '100%',
    position: 'relative',
    zIndex: 2,
  }),

  slogan: css({
    position: 'absolute',
    top: '15%',
    left: 0,
    right: 0,
    width: '100%',
    overflow: 'hidden',
    zIndex: 1,
    pointerEvents: 'none',
  }),

  sloganTrack: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '200vw', // 2 copies × 100vw = 200vw
    minWidth: '200vw',
    gap: 0,
    margin: 0,
    padding: 0,
    animation: 'marquee 20s linear infinite',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
  }),

  sloganText: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '3.5rem', sm: '4.5rem', md: '5.5rem', lg: '6.5rem', xl: '7rem' },
    fontWeight: 400,
    letterSpacing: '0.02em',
    color: 'rgba(255, 255, 255, 0.15)',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    // 🔥 clé pour une boucle parfaite :
    // sloganTrack fait 200vw, donc chaque sloganText fait 100vw (100% de la largeur visible)
    flex: '0 0 100vw',
    width: '100vw',
    minWidth: '100vw',
    maxWidth: '100vw',
    textAlign: 'center',
    flexShrink: 0,
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  }),

  topContentArea: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 3,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    px: { base: 4, md: 6, lg: 8 },
    pt: { base: 12, md: 16, lg: 20 },
    '& > *': {
      pointerEvents: 'auto',
    },
  }),

  bottomContentArea: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    pointerEvents: 'none',
    px: "2%",
    pb: "2.5%",
    '& > *': {
      pointerEvents: 'auto',
    },
  }),

  heroContent: css({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: { base: 8, md: 12 },
  }),

  header: css({
    textAlign: 'center',
  }),

  mainTitle: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '3rem', sm: '4rem', md: '5rem', lg: '6rem' },
    fontWeight: 400,
    letterSpacing: '0.02em',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 1,
  }),

  stepsContainer: css({
    width: '100%',
    maxWidth: { base: '100%', lg: '1400px' },
    mx: 'auto',
  }),

  stepsGrid: css({
    display: 'grid',
    gridTemplateColumns: { 
      base: '1fr', 
      sm: 'repeat(2, 1fr)', 
      lg: 'repeat(4, 1fr)' 
    },
    gap: { base: 3, md: 4 },
    width: '100%',
  }),

  stepCard: css({
    padding: { base: 5, md: 6 },
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: { base: 3, md: 4 },
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    _hover: {
      background: 'rgba(255, 255, 255, 0.12)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
    },
  }),

  stepNumber: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '1.5rem', md: '1.75rem' },
    fontWeight: 400,
    letterSpacing: '0.02em',
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 1,
  }),

  stepTitle: css({
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: { base: '1rem', md: '1.125rem' },
    fontWeight: 500,
    letterSpacing: '-0.01em',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 1.3,
  }),

  stepDescription: css({
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: { base: '0.875rem', md: '0.9375rem' },
    fontWeight: 300,
    letterSpacing: '0.01em',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.5,
  }),

  contentWrapper: css({
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  content: css({
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    px: { base: 4, md: 6 },
  }),

  title: css({
    fontSize: { base: '4xl', md: '6xl' },
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: 'white',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
  }),

  subtitle: css({
    color: 'white',
    fontSize: { base: 'md', md: 'lg' },
    maxW: '800px',
    mx: 'auto',
    textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
  }),

  ctas: css({
    display: 'flex',
    gap: 3,
    justifyContent: 'center',
    mt: 2,
  }),

  primary: css({
    px: 6,
    py: 3,
    bg: 'gray.900',
    color: 'white',
    rounded: 'full',
    fontWeight: 600,
    _hover: { bg: 'black' },
    transition: 'background 0.2s ease',
  }),

  secondary: css({
    px: 6,
    py: 3,
    bg: 'white',
    color: 'gray.900',
    rounded: 'full',
    border: '1px solid',
    borderColor: 'gray.300',
    fontWeight: 600,
    _hover: { bg: 'gray.50' },
    transition: 'background 0.2s ease',
  }),

};
