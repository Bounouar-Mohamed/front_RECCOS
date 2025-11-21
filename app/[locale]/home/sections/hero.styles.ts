import { css } from '@/styled-system/css';

export const heroStyles = {
  root: css({
    minH: '100vh',
    h: '100vh',
    w: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // nécessaire pour l'absolute
    zIndex: 1, // s'assure que le Hero reste au-dessus des sections suivantes (masque)
    overflow: 'hidden',
    backgroundImage: 'url(/images/skyline.png)',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    pb: 0,
    mb: 0,
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
